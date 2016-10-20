#!/usr/bin/env python
import subprocess
from bs4 import BeautifulSoup, Comment

# html = """
# <html>
# <body>
# <p>p tag text</p>
# <!--UNIQUE COMMENT-->
# I would like to get this text
# <!--SECOND UNIQUE COMMENT-->
# I would also like to find this text
# </body>
# </html>
# """

html = """
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <title>Zorbio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="version" content="{{ VERSION }}" />
        <meta name="build" content="{{ BUILD }}" />
        <meta name="ref" content="{{ GIT_REF }}" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#171717">
        <link rel="stylesheet" href="./css/main.css"/>
        <!-- Google Analytics -->
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-73203609-1', 'auto');
            ga('send', 'pageview');
        </script>
        <!-- End Google Analytics -->
    </head>

    <body>

        <div id="ui-overlay"></div>

        <canvas id="render-canvas"></canvas>

        <!-- UI TEMPLATES -->

        <script src="templates/title.html"        id="title-template"       type="text/ractive"></script>
        <script src="templates/playing.html"      id="playing-template"     type="text/ractive"></script>
        <script src="templates/config.html"       id="config-template"      type="text/ractive"></script>
        <script src="templates/tutorial.html"     id="tutorial-template"    type="text/ractive"></script>
        <script src="templates/stats.html"        id="stats-template"       type="text/ractive"></script>
        <script src="templates/leaderboard.html"  id="leaderboard-template" type="text/ractive"></script>
        <script src="templates/player-size.html"  id="player-size-template" type="text/ractive"></script>
        <script src="templates/targets.html"      id="targets-template"     type="text/ractive"></script>
        <script src="templates/social.html"       id="social-template"      type="text/ractive"></script>
        <script src="templates/ad.html"           id="ad-template"          type="text/ractive"></script>
        <script src="templates/tabs.html"         id="tabs-template"        type="text/ractive"></script>
        <script src="templates/copyright.html"    id="copyright-template"   type="text/ractive"></script>
        <script src="templates/menu.html"         id="menu-template"        type="text/ractive"></script>
        <script src="templates/game-tab.html"     id="game-tab-template"    type="text/ractive"></script>
        <script src="templates/store.html"        id="store-template"       type="text/ractive"></script>
        <script src="templates/death.html"        id="death-template"       type="text/ractive"></script>
        <script src="templates/credits.html"      id="credits-template"     type="text/ractive"></script>
        <script src="templates/kicked.html"       id="kicked-template"      type="text/ractive"></script>
        <script src="templates/initerror.html"    id="initerror-template"   type="text/ractive"></script>
        <script src="templates/ui.html"           id="ui-template"          type="text/ractive"></script>

        <!-- SHADERS -->

        <script src="shaders/drain.vert"  id="drain-vertex-shader"    type="x-shader/x-vertex"></script>
        <script src="shaders/drain.frag"  id="drain-frag-shader"      type="x-shader/x-fragment"></script>
        <script src="shaders/food.frag"   id="food-frag-shader"       type="x-shader/x-fragment"></script>
        <script src="shaders/food.vert"   id="food-vertex-shader"     type="x-shader/x-vertex"></script>

        <!-- SKINS -->


        <script src="skins/earth/sphere.vert" id="skin-earth-vertex-shader"   type="x-shader/x-vertex"></script>
        <script src="skins/earth/sphere.frag" id="skin-earth-fragment-shader" type="x-shader/x-fragment"></script>
        <script src="skins/default/sphere.vert" id="skin-default-vertex-shader"   type="x-shader/x-vertex"></script>
        <script src="skins/default/sphere.frag" id="skin-default-fragment-shader" type="x-shader/x-fragment"></script>
        <script src="skins/boing/sphere.vert" id="skin-boing-vertex-shader"   type="x-shader/x-vertex"></script>
        <script src="skins/boing/sphere.frag" id="skin-boing-fragment-shader" type="x-shader/x-fragment"></script>
        <script src="skins/reddit/sphere.vert" id="skin-reddit-vertex-shader"   type="x-shader/x-vertex"></script>
        <script src="skins/reddit/sphere.frag" id="skin-reddit-fragment-shader" type="x-shader/x-fragment"></script>

        <!--THIRD PARTY -->
        <div id="third_party">
            <script src="./lib/schemapack.js"></script>
            <script src="./lib/modernizr.min.js"></script>
            <script src="./bower_components/ractive/ractive.js"></script>
            <script src="./bower_components/three.js/build/three.min.js"></script>
            <script src="./bower_components/ShaderParticleEngine/build/SPE.min.js"></script>
            <script src="./lib/Octree.js"></script>
            <script src="./lib/THREE.MeshLine.js"></script>
            <script src="./bower_components/isMobile/isMobile.min.js"></script>
            <script src="./bower_components/lodash/dist/lodash.min.js"></script>
            <script src="./bower_components/uri.js/src/URI.min.js"></script>
            <script src="./bower_components/howler.js/dist/howler.min.js"></script>
            <script src="./bower_components/howler.js/dist/howler.spatial.min.js"></script>
            <script src="./bower_components/fetch/fetch.js"></script>
            <script src="./bower_components/es6-promise/es6-promise.min.js"></script>
            <script src="./bower_components/Wad/build/wad.js"></script>
            <script src="./bower_components/linode-near-location/linode-near-location.js"></script>
            <script src="./bower_components/xss-filters/dist/xss-filters.min.js"></script>
            <script src="./bower_components/raven-js/dist/raven.js"></script>
        </div>

        <!-- FIRST PARTY -->
        <div id="first_party">
            <script src="skins/default/default.js"></script>
            <script src="skins/earth/earth.js"></script>
            <script src="skins/boing/boing.js"></script>
            <script src="skins/reddit/reddit.js"></script>
            <script src="./lib/environment.js"></script>
            <script src="./js/config.js"></script>
            <script src="./js/Sentry.js"></script>
            <script src="./js/FollowOrbitControls.js"></script>
            <script src="./js/TrackballControls.js"></script>
            <script src="./lib/util.js"></script>
            <script src="./lib/zorbio.js"></script>
            <script src="./lib/schemas.js"></script>
            <script src="./js/LagScale.js"></script>
            <script src="./js/Sounds.js"></script>
            <script src="./js/UI.js"></script>
            <script src="./js/Game.js"></script>
            <script src="./js/PlayerView.js"></script>
            <script src="./js/PlayerController.js"></script>
            <script src="./js/FoodController.js"></script>
            <script src="./js/FoodView.js"></script>
            <script src="./js/DrainView.js"></script>
            <script src="./js/Network.js"></script>
        </div>
    </body>
</html>
"""

soup = BeautifulSoup(html, 'html.parser')

# Get the file paths of third and first party scripts to be minified
third_party = soup.find(id='third_party')
first_party = soup.find(id='first_party')
third_children = third_party.findChildren()
first_children = first_party.findChildren()

third_party_scripts = ''
first_party_scripts = ''

for script_tag in third_children:
    third_party_scripts += ' ' + script_tag['src']

# print('third party scripts: ' + third_party_scripts)

for script_tag in first_children:
    first_party_scripts += ' ' + script_tag['src']

# print('first party scripts: ' + first_party_scripts)

# Generate the minified files and move them to the right location
subprocess.call('uglifyjs ' + third_party_scripts + ' -o js/third.min.js', shell=True)
subprocess.call('uglifyjs ' + first_party_scripts + ' -o js/first.min.js -e -m -c', shell=True)

# Replace the script divs with a single script tag for the minified files
new_third_tag = soup.new_tag("script", src='js/third.min.js')
third_party.replace_with(new_third_tag)
new_first_tag = soup.new_tag("script", src='js/first.min.js')
first_party.replace_with(new_first_tag)

# Write out the file
print(soup.prettify())
