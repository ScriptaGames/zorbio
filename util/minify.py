#!/usr/bin/env python
import sys
import subprocess
from bs4 import BeautifulSoup, Comment

# Read in the index.html file
try:
    fileobj = open(sys.argv[1], 'r')
except IndexError:
    fileobj = sys.stdin

with fileobj:
    data = fileobj.read()

soup = BeautifulSoup(data, 'html.parser')

# Get the file paths of third and first party scripts to be minified
third_party = soup.find(id='third_party')
first_party = soup.find(id='first_party')
third_children = third_party.findChildren()
first_children = first_party.findChildren()

third_party_scripts = ''
first_party_scripts = ''

for script_tag in third_children:
    third_party_scripts += ' client/' + script_tag['src']

for script_tag in first_children:
    first_party_scripts += ' client/' + script_tag['src']

# Generate the minified files and move them to the right location
subprocess.call('npm run uglify-theirs ' + third_party_scripts + ' > /dev/null 2>&1', shell=True)
subprocess.call('npm run uglify-ours ' + first_party_scripts + ' > /dev/null 2>&1', shell=True)

# Replace the script divs with a single script tag for the minified files
new_third_tag = soup.new_tag("script", src='js/third.min.js')
third_party.replace_with(new_third_tag)
new_first_tag = soup.new_tag("script", src='js/first.min.js')
first_party.replace_with(new_first_tag)

# Write out the file
print(soup.prettify())
