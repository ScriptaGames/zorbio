let config        = require( '../common/config.js' );
let Zorbio        = require( '../common/zorbio.js' );
let UTIL          = require( '../common/util.js' );
let _             = require( 'lodash' );
let datasets      = require( 'datasets' );
let THREE         = require( 'three' );
let SkinCatalog   = require( '../common/SkinCatalog' );
let BotCurvePaths = require( './BotCurvePaths.js' );

let Bot = function(scale, model) {
    //  Scope
    let self = this;
    self.model = model;

    // Array of skins in the catalog
    let skins = _.filter( _.values(SkinCatalog), function(o) {
        return !o.unlock_url;  // Don't include hidden skins that have an unlock_url defined
    });

    // initialized player properties
    self.colorCode = UTIL.getRandomIntInclusive(0, config.COLORS.length - 1);
    self.skin_name = skins[UTIL.getRandomIntInclusive(0, skins.length - 1)].name;
    self.id = Zorbio.IdGenerator.get_next_id();
    self.name = 'AI ' + _.sample(Bot.prototype.names);
    self.scale = scale || UTIL.getRandomIntInclusive(config.INITIAL_PLAYER_RADIUS, config.MAX_PLAYER_RADIUS);
    self.chaseTarget = {
        position: new THREE.Vector3(),
    };

    // self.curve = new Curves.HeartCurve(10);
    // self.curve = new Curves.TorusKnot(100);
    // self.curve = new Curves.CinquefoilKnot(100);
    // self.curve = new Curves.FigureEightPolynomialKnot(2);
    // self.curve = new Curves.HelixCurve();
    // self.curve = new Curves.KnotCurve();
    // self.curve1 = new Curves.VivianiCurve(200);
    // self.curvePoints1 = self.curve1.getPoints(100);
    //
    // self.curve2 = new Curves.GrannyKnot(150);
    // self.curvePoints2 = self.curve2.getPoints(100);
    //
    // let glueCurve1 = new THREE.CubicBezierCurve3(
    //     self.curvePoints1[self.curvePoints1.length - 1].clone(),
    //     UTIL.randomWorldPosition(3),
    //     UTIL.randomWorldPosition(3),
    //     self.curvePoints2[0].clone()
    // );
    // // glueCurve1.curveType = 'chordal';
    // // glueCurve1.closed = false;
    // self.gluePoints1 = glueCurve1.getPoints(50);
    //
    // let glueCurve2 = new THREE.CubicBezierCurve3(
    //     self.curvePoints2[self.curvePoints2.length - 1].clone(),
    //     UTIL.randomWorldPosition(3),
    //     UTIL.randomWorldPosition(3),
    //     self.curvePoints1[0].clone()
    // );
    // // glueCurve2.curveType = 'chordal';
    // // glueCurve2.closed = false;
    // self.gluePoints2 = glueCurve2.getPoints(50);
    //
    //
    // // Create a closed wavey loop
    // let catCurve = new THREE.CatmullRomCurve3( self.curvePoints1.concat( self.curvePoints2 ) );
    // catCurve.curveType = 'catmullrom';
    // catCurve.closed = true;

    // self.curvePoints = self.curvePoints1.concat(self.gluePoints1, self.curvePoints2, self.gluePoints2);
    self.curvePoints = _.sample(BotCurvePaths);

    // TODO: Figure out what to do with span points
    // let position = self.model.getSafeSpawnPosition(10);

    self.nextCurvePoint = 1;

    let position = self.curvePoints[0];

    // Create the player model
    self.player = new Zorbio.Player(
        self.id,
        self.name,
        self.colorCode,
        Zorbio.PlayerTypes.BOT,
        position,
        self.scale,
        null,
        self.skin_name
    );

    self.movementPaterns = {

        // hold still
        hold: function moveHold() {
            let sphere = self.player.sphere;
            self.player.sphere.pushRecentPosition({
                position: sphere.position,
                radius  : sphere.scale,
                time    : Date.now(),
            });
        },

        // move the bot to 0, 0, 0
        center: function moveCenter() {
            let sphere = self.player.sphere;

            let centerPos = new THREE.Vector3(0, 0, 0).clone();
            centerPos.sub(sphere.position);
            centerPos.normalize();

            let speed = self.player.getSpeed();
            centerPos.multiplyScalar( speed );

            sphere.position.add(centerPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },

        // chase a target actor
        chase: function moveChase() {
            if (!self.chaseTarget || !self.chaseTarget.position) return;

            let sphere = self.player.sphere;

            let targetPos = self.chaseTarget.position.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            let speed = self.player.getSpeed();
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },

        // move to a random points
        randomPoint: function moveRandomPoint() {
            let sphere = self.player.sphere;

            if (!self.moveToPoint) {
                self.moveToPoint = UTIL.randomWorldPosition();
            }

            let dist = sphere.position.distanceTo(self.moveToPoint);

            if (dist < 5) {
                // reached point, generate a new one
                self.moveToPoint = UTIL.randomWorldPosition();
            }

            let targetPos = self.moveToPoint.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            let speed = self.player.getSpeed() * (config.TICK_FAST_INTERVAL / (1000/60)); // convert speed multiplier from fps to tick fast
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },

        curve: function moveCurve() {
            let sphere = self.player.sphere;
            let nextPoint = self.curvePoints[self.nextCurvePoint];

            // Check the distance
            if (sphere.position.distanceTo(nextPoint) < 5) {
                // reached the point, go to next
                self.nextCurvePoint++;


                // See if we've reached the end of the points and reset
                if (self.nextCurvePoint === self.curvePoints.length) {
                    self.nextCurvePoint = 1;
                }

                nextPoint = self.curvePoints[self.nextCurvePoint];
            }

            // TODO: put this in a fuction, it's duplicated from randomPoint
            let targetPos = nextPoint.clone();

            targetPos.sub(sphere.position);
            targetPos.normalize();

            let speed = self.player.getSpeed() * (config.TICK_FAST_INTERVAL / (1000/60)); // convert speed multiplier from fps to tick fast
            targetPos.multiplyScalar( speed );

            sphere.position.add(targetPos);

            sphere.pushRecentPosition({ position: sphere.position, radius: sphere.scale, time: Date.now() });
        },
    };

    self.setChaseTarget = function botChaseTarget(actor_id) {
        self.chaseTarget = self.model.getActorById(actor_id);
    };

    self.move = self.movementPaterns.curve;
};

Bot.prototype.names = datasets['male-first-names-en'].concat(datasets['female-first-names-en']);

module.exports = Bot;

