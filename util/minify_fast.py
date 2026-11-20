#!/usr/bin/env python3
"""
Fast replacement for util/minify.py — same job, powered by esbuild (native Go
binary) instead of uglify-es, roughly 50-100x faster, with no third-party
python dependencies (BeautifulSoup is not needed).

Usage is identical to util/minify.py:

    python3 util/minify_fast.py client/index.jsontemplate.html > client/index_min.html
    cat index.html | python3 util/minify_fast.py

What it does (mirroring util/minify.py and the npm scripts it invoked):

  * finds the <div id="third_party"> and <div id="first_party"> script
    containers in the input html
  * minifies the third-party scripts into client/js/third.min.js
    (was: `npm run uglify-theirs` — uglifyjs with no compress/mangle flags)
  * minifies the first-party scripts into client/js/first.min.js, wrapped in
    the exact closure uglify's `--wrap ZOR` produces (see uglify-es
    lib/ast.js, AST_Toplevel.wrap_commonjs):

        (function(exports){ ... })(typeof ZOR=='undefined'?(ZOR={}):ZOR);

    (was: `npm run uglify-ours` — uglifyjs --wrap ZOR -m -c)
  * replaces both containers with single <script> tags for the minified files
  * prints the resulting html on stdout

Differences from the uglify build (all functionally safe):

  * third-party code is fully minified by esbuild (uglify-theirs only
    stripped whitespace there). esbuild preserves top-level names in script
    mode, so cross-script globals (THREE, Ractive, _, ...) keep working, and
    top-level `this` (used by the UMD wrappers) is left untouched.
  * uglify's `--mangle-props regex="/^z_|^ZOR/"` is not replicated — esbuild
    does not mangle property names. That regex only matched ~49 property
    references in the first-party code, so the cost is a few hundred bytes.

esbuild is resolved from (first match wins): $ESBUILD, node_modules/.bin/esbuild,
build-tools/node_modules/.bin/esbuild, $PATH. If missing, this script will
attempt `npm install --no-save --no-package-lock esbuild` (which leaves
package.json and package-lock.json untouched).
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

CLIENT_DIR = 'client'  # same cwd-relative prefix util/minify.py used
THIRD_OUT = os.path.join('js', 'third.min.js')
FIRST_OUT = os.path.join('js', 'first.min.js')

# Exactly what uglify-es `--wrap ZOR` generates (lib/ast.js wrap_commonjs).
FIRST_PARTY_PREFIX = "(function(exports){"
FIRST_PARTY_SUFFIX = "})(typeof ZOR=='undefined'?(ZOR={}):ZOR);"


def die(msg):
    sys.exit('ERROR: ' + msg)


def human(n):
    for unit in ('B', 'KB', 'MB'):
        if n < 1024 or unit == 'MB':
            return '%.1f%s' % (n, unit)
        n /= 1024.0


def find_esbuild():
    candidates = [
        os.environ.get('ESBUILD'),
        os.path.join('node_modules', '.bin', 'esbuild'),
        os.path.join('build-tools', 'node_modules', '.bin', 'esbuild'),
        shutil.which('esbuild'),
    ]
    for path in candidates:
        if path and os.path.isfile(path) and os.access(path, os.X_OK):
            return path

    # Not installed — install it locally without touching package.json.
    print('esbuild not found; installing it locally '
          '(npm install --no-save --no-package-lock esbuild) ...', file=sys.stderr)
    rc = subprocess.call(['npm', 'install', '--no-save', '--no-package-lock', 'esbuild'])
    local = os.path.join('node_modules', '.bin', 'esbuild')
    if rc == 0 and os.path.isfile(local):
        return local
    die('could not locate or install esbuild. Install it with:\n'
        '  npm install --no-save --no-package-lock esbuild\n'
        'or point the ESBUILD env var at the esbuild binary.')


def read_html():
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            return f.read()
    return sys.stdin.read()


def extract_container(html, container_id):
    """Return (start, end, [src, ...]) for a script container div.

    The tag is anchored to the start of a line because index.html also has a
    JS comment that literally contains the text <div id="first_party"> mid
    line ("This must be outside <div id=...>"). BeautifulSoup ignored it
    because it sits inside an HTML comment; we skip it by requiring the real
    tag to start a line.
    """
    pattern = re.compile(
        r'^[ \t]*<div[^>]*\bid="%s"[^>]*>.*?</div>' % re.escape(container_id),
        re.MULTILINE | re.DOTALL)
    m = pattern.search(html)
    if not m:
        die('could not find <div id="%s"> in the input html' % container_id)
    srcs = re.findall(r'<script[^>]*\bsrc="([^"]+)"', m.group(0))
    if not srcs:
        die('no <script src=...> tags found inside #%s' % container_id)
    return m.start(), m.end(), srcs


def build_bundle(esbuild, srcs, outfile, label, wrap=False):
    """Concatenate srcs (optionally inside the ZOR closure) and minify with esbuild."""
    t0 = time.time()
    chunks = []
    for src in srcs:
        path = os.path.join(CLIENT_DIR, src)
        if not os.path.isfile(path):
            die('script not found: %s (referenced by #%s)' % (path, label))
        with open(path, 'r') as f:
            chunks.append(f.read())

    # The ';\n' separators guard against ASI bugs when concatenating
    # separately-authored scripts (e.g. a file ending in `foo()` followed by
    # a file starting with `(function(){...})()`).
    body = '\n;\n'.join(chunks)
    if wrap:
        body = FIRST_PARTY_PREFIX + '\n' + body + '\n' + FIRST_PARTY_SUFFIX

    outpath = os.path.join(CLIENT_DIR, outfile)
    with tempfile.TemporaryDirectory(prefix='minify_fast_') as tmp:
        inpath = os.path.join(tmp, 'bundle.js')
        with open(inpath, 'w') as f:
            f.write(body)
        cmd = [esbuild, '--minify', '--legal-comments=none',
               '--log-level=warning', inpath, '--outfile=' + outpath]
        res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
        if res.stderr.strip():
            sys.stderr.write(res.stderr)
        if res.returncode != 0:
            die('esbuild failed while minifying %s' % label)

    size = os.path.getsize(outpath)
    print('[minify_fast] %-11s %-5d files -> %s (%.0f ms)'
          % (label, len(srcs), human(size), (time.time() - t0) * 1000), file=sys.stderr)


def main():
    html = read_html()
    esbuild = find_esbuild()

    third = extract_container(html, 'third_party')
    first = extract_container(html, 'first_party')

    # Minify first so any JS error aborts before we emit any html.
    build_bundle(esbuild, third[2], THIRD_OUT, 'third_party')
    build_bundle(esbuild, first[2], FIRST_OUT, 'first_party', wrap=True)

    # Splice in the replacement <script> tags (end-first keeps offsets valid).
    for start, end, outfile in sorted(
            [third[:2] + (THIRD_OUT,), first[:2] + (FIRST_OUT,)], reverse=True):
        tag = '<script src="%s"></script>' % outfile.replace(os.sep, '/')
        html = html[:start] + tag + html[end:]

    sys.stdout.write(html)


if __name__ == '__main__':
    main()
