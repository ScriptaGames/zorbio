/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author mwcz / http://palebluepixel.org
 */
/*global THREE, console */

( function () {

    function cameraRoll(camera) {
        var cameraRollMatrix = new THREE.Matrix4();

        //replace makeFrustum
        var oldMakeFrustum = camera.projectionMatrix.makeFrustum.bind(camera.projectionMatrix);
        camera.projectionMatrix.makeFrustum = function(left, right, bottom, top, near, far) {
            return oldMakeFrustum(left, right, bottom, top, near, far).multiply(cameraRollMatrix);
        };

        //give camera convenient method
        camera.setRoll = function(angle) {
            cameraRollMatrix.makeRotationZ(angle);
            this.updateProjectionMatrix();
        };
    }

    function FollowOrbitConstraint ( object ) {

        this.object = object;

        cameraRoll(this.object);

        // "target" sets the location of focus, where the object orbits around
        // and where it pans with respect to.
        this.target = new THREE.Object3D();

        // Limits to how far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = -Infinity; // radians
        this.maxPolarAngle = Infinity; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle = - Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.enableDamping = false;
        this.dampingFactor = 0.25;

        // Instead of moving our target inside this controller, set up a
        // velocity vector, which essentially means "please apply this velocity
        // to my target"

        this.velocityRequest = new THREE.Vector3();
        this.foobar = 0;

        ////////////
        // internals

        var scope = this;

        var EPS = 0.000001;

        // Current position in spherical coordinate system.
        var theta;
        var phi;

        // Pending changes
        var phiDelta = 0;
        var thetaDelta = 0;
        var scale = 1;
        var zoomChanged = false;

        // API

        this.getPolarAngle = function () {

            return phi;

        };

        this.getAzimuthalAngle = function () {

            return theta;

        };

        this.rotateLeft = function ( angle ) {

            thetaDelta -= angle;

        };

        this.rotateUp = function ( angle ) {

            phiDelta -= angle;

        };

        // pass in distance in world space to move left
        this.panLeft = function() {

            var v = new THREE.Vector3();

            return function panLeft ( distance ) {

                var te = this.object.matrix.elements;

                // get X column of matrix
                v.set( te[ 0 ], te[ 1 ], te[ 2 ] );
                v.multiplyScalar( - distance );

                scope.velocityRequest.add( v );

            };

        }();

        // pass in distance in world space to move up
        this.panUp = function() {

            var v = new THREE.Vector3();

            return function panUp ( distance ) {

                var te = this.object.matrix.elements;

                // get Y column of matrix
                v.set( te[ 4 ], te[ 5 ], te[ 6 ] );
                v.multiplyScalar( distance );

                scope.velocityRequest.add( v );

            };

        }();

        // pass in x,y of change desired in pixel space,
        // right and down are positive
        this.pan = function ( deltaX, deltaY, screenWidth, screenHeight ) {
            // perspective
            var position = scope.object.position;
            var offset = position.clone().sub( scope.target.position );
            var targetDistance = offset.length();
            var dir = scope.upside_down ? 1 : -1;

            // half of the fov is center to top of screen
            targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft( 2 * dir * deltaX * targetDistance / screenHeight );
            scope.panUp( 2 * dir * deltaY * targetDistance / screenHeight );
        };

        this.dollyIn = function ( dollyScale ) {
            scale /= dollyScale;
        };

        this.dollyOut = function ( dollyScale ) {
            scale *= dollyScale;
        };

        this.update = function() {

            var offset = new THREE.Vector3();

            // so camera.up is the orbit axis
            var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
            var quatInverse = quat.clone().inverse();

            var lastPosition = new THREE.Vector3();
            var lastQuaternion = new THREE.Quaternion();

            scope.upside_down = false;

            return function () {

                var position = this.object.position;

                offset.copy( position ).sub( this.target.position );

                // rotate offset to "y-axis-is-up" space
                offset.applyQuaternion( quat );

                // angle from z-axis around y-axis

                theta = Math.atan2( offset.x, offset.z );

                // angle from y-axis

                phi = Math.atan2( Math.sqrt( Math.pow(offset.x, 2) + Math.pow(offset.z, 2) ), offset.y );

                if (scope.upside_down) {
                    if (phi - phiDelta > Math.PI || phi - phiDelta < 0) {
                        theta += Math.PI;
                        phi %= Math.PI;
                        scope.upside_down = false;
                        this.object.setRoll(0);
                    }
                }
                else {
                    if (phi + phiDelta > Math.PI || phi + phiDelta < 0) {
                        console.log('FLIP!');
                        theta += Math.PI;
                        phi %= Math.PI;
                        scope.upside_down = true;
                        this.object.setRoll(Math.PI);
                    }
                }

                if (scope.upside_down) {
                    theta -= thetaDelta;
                    phi -= phiDelta;
                }
                else {
                    theta += thetaDelta;
                    phi += phiDelta;
                }

                // restrict theta to be between desired limits
                // theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

                // restrict phi to be between desired limits
                // phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

                // restrict phi to be between EPS and PI-EPS
                // phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

                var radius = offset.length() * scale;

                // restrict radius to be between desired limits
                radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

                // move target to panned location

                offset.x = radius * Math.sin( phi ) * Math.sin( theta );
                offset.y = radius * Math.cos( phi );
                offset.z = radius * Math.sin( phi ) * Math.cos( theta );

                // rotate offset back to "camera-up-vector-is-up" space
                offset.applyQuaternion( quatInverse );

                position.copy( this.target.position ).add( offset );

                this.object.lookAt( this.target.position );

                if ( this.enableDamping === true ) {

                    thetaDelta *= ( 1 - this.dampingFactor );
                    phiDelta *= ( 1 - this.dampingFactor );

                } else {

                    thetaDelta = 0;
                    phiDelta = 0;

                }

                scale = 1;

                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                if ( zoomChanged ||
                    lastPosition.distanceToSquared( this.object.position ) > EPS ||
                        8 * ( 1 - lastQuaternion.dot( this.object.quaternion ) ) > EPS ) {

                    lastPosition.copy( this.object.position );
                    lastQuaternion.copy( this.object.quaternion );
                    zoomChanged = false;

                    return true;

                }

                return false;

            };

        }();

    }


    // This set of controls performs orbiting, dollying (zooming), and panning. It maintains
    // the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
    // supported.
    //
    //    FollowOrbit - left mouse / touch: one finger move
    //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
    //    Pan - right mouse, or arrow keys / touch: three finter swipe

    THREE.FollowOrbitControls = function ( object, domElement ) {

        var constraint = new FollowOrbitConstraint( object );

        this.domElement = ( domElement !== undefined ) ? domElement : document;

        // API

        Object.defineProperty( this, 'constraint', {

            get: function() {

                return constraint;

            }

        } );

        this.getPolarAngle = function () {

            return constraint.getPolarAngle();

        };

        this.getAzimuthalAngle = function () {

            return constraint.getAzimuthalAngle();

        };

        // Set to false to disable this control
        this.enabled = true;

        // center is old, deprecated; use "target" instead
        this.center = this.target.position;

        // This option actually enables dollying in and out; left as "zoom" for
        // backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;

        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 0.5;

        // Set to false to disable panning
        this.enablePan = true;
        this.keyPanSpeed = 7.0; // pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // Set to false to disable use of the keys
        this.enableKeys = true;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        // Mouse buttons
        this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

        ////////////
        // internals

        var scope = this;

        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();

        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();

        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();

        var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

        var state = STATE.NONE;

        // for reset

        this.target0 = this.target.position.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;

        // events

        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };

        // pass in x,y of change desired in pixel space,
        // right and down are positive
        function pan( deltaX, deltaY ) {

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            constraint.pan( deltaX, deltaY, element.clientWidth, element.clientHeight );

        }

        this.update = function () {

            if ( this.autoRotate && state === STATE.NONE ) {

                constraint.rotateLeft( getAutoRotationAngle() );

            }

            if ( constraint.update() === true ) {

                this.dispatchEvent( changeEvent );

            }

        };

        this.reset = function () {

            state = STATE.NONE;

            this.target.position.copy( this.target0 );
            this.object.position.copy( this.position0 );
            this.object.zoom = this.zoom0;

            this.object.updateProjectionMatrix();
            this.dispatchEvent( changeEvent );

            this.update();

        };

        function getAutoRotationAngle() {

            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

        }

        function getZoomScale() {

            return Math.pow( 0.95, scope.zoomSpeed );

        }

        function onMouseDown( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();

            if ( event.button === scope.mouseButtons.ORBIT ) {

                if ( scope.enableRotate === false ) return;

                state = STATE.ROTATE;

                rotateStart.set( event.clientX, event.clientY );

            } else if ( event.button === scope.mouseButtons.ZOOM ) {

                if ( scope.enableZoom === false ) return;

                state = STATE.DOLLY;

                dollyStart.set( event.clientX, event.clientY );

            } else if ( event.button === scope.mouseButtons.PAN ) {

                if ( scope.enablePan === false ) return;

                state = STATE.PAN;

                panStart.set( event.clientX, event.clientY );

            }

            if ( state !== STATE.NONE ) {

                document.addEventListener( 'mousemove', onMouseMove, false );
                document.addEventListener( 'mouseup', onMouseUp, false );
                scope.dispatchEvent( startEvent );

            }

        }

        function onMouseMove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if ( state === STATE.ROTATE ) {

                if ( scope.enableRotate === false ) return;

                rotateEnd.set( event.clientX, event.clientY );
                rotateDelta.subVectors( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                constraint.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                constraint.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                rotateStart.copy( rotateEnd );

            } else if ( state === STATE.DOLLY ) {

                if ( scope.enableZoom === false ) return;

                dollyEnd.set( event.clientX, event.clientY );
                dollyDelta.subVectors( dollyEnd, dollyStart );

                if ( dollyDelta.y > 0 ) {

                    constraint.dollyIn( getZoomScale() );

                } else if ( dollyDelta.y < 0 ) {

                    constraint.dollyOut( getZoomScale() );

                }

                dollyStart.copy( dollyEnd );

            } else if ( state === STATE.PAN ) {

                if ( scope.enablePan === false ) return;

                panEnd.set( event.clientX, event.clientY );
                panDelta.subVectors( panEnd, panStart );

                pan( panDelta.x, panDelta.y );

                panStart.copy( panEnd );

            }

            if ( state !== STATE.NONE ) scope.update();

        }

        function onMouseUp( /* event */ ) {

            if ( scope.enabled === false ) return;

            document.removeEventListener( 'mousemove', onMouseMove, false );
            document.removeEventListener( 'mouseup', onMouseUp, false );
            scope.dispatchEvent( endEvent );
            state = STATE.NONE;

        }

        function onMouseWheel( event ) {

            if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

            event.preventDefault();
            event.stopPropagation();

            var delta = 0;

            if ( event.wheelDelta !== undefined ) {

                // WebKit / Opera / Explorer 9

                delta = event.wheelDelta;

            } else if ( event.detail !== undefined ) {

                // Firefox

                delta = - event.detail;

            }

            if ( delta > 0 ) {

                constraint.dollyOut( getZoomScale() );

            } else if ( delta < 0 ) {

                constraint.dollyIn( getZoomScale() );

            }

            scope.update();
            scope.dispatchEvent( startEvent );
            scope.dispatchEvent( endEvent );

        }

        function onKeyDown( event ) {

            if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

            switch ( event.keyCode ) {

                case scope.keys.UP:
                    pan( 0, scope.keyPanSpeed );
                scope.update();
                break;

                case scope.keys.BOTTOM:
                    pan( 0, - scope.keyPanSpeed );
                scope.update();
                break;

                case scope.keys.LEFT:
                    pan( scope.keyPanSpeed, 0 );
                scope.update();
                break;

                case scope.keys.RIGHT:
                    pan( - scope.keyPanSpeed, 0 );
                scope.update();
                break;

            }

        }

        function touchstart( event ) {

            if ( scope.enabled === false ) return;

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( scope.enableRotate === false ) return;

                state = STATE.TOUCH_ROTATE;

                rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

                case 2: // two-fingered touch: dolly

                    if ( scope.enableZoom === false ) return;

                state = STATE.TOUCH_DOLLY;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );
                dollyStart.set( 0, distance );
                break;

                case 3: // three-fingered touch: pan

                    if ( scope.enablePan === false ) return;

                state = STATE.TOUCH_PAN;

                panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

                default:

                    state = STATE.NONE;

            }

            if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );

        }

        function touchmove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();
            event.stopPropagation();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( scope.enableRotate === false ) return;
                if ( state !== STATE.TOUCH_ROTATE ) return;

                rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                rotateDelta.subVectors( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                constraint.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                constraint.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                rotateStart.copy( rotateEnd );

                scope.update();
                break;

                case 2: // two-fingered touch: dolly

                    if ( scope.enableZoom === false ) return;
                if ( state !== STATE.TOUCH_DOLLY ) return;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );

                dollyEnd.set( 0, distance );
                dollyDelta.subVectors( dollyEnd, dollyStart );

                if ( dollyDelta.y > 0 ) {

                    constraint.dollyOut( getZoomScale() );

                } else if ( dollyDelta.y < 0 ) {

                    constraint.dollyIn( getZoomScale() );

                }

                dollyStart.copy( dollyEnd );

                scope.update();
                break;

                case 3: // three-fingered touch: pan

                    if ( scope.enablePan === false ) return;
                if ( state !== STATE.TOUCH_PAN ) return;

                panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                panDelta.subVectors( panEnd, panStart );

                pan( panDelta.x, panDelta.y );

                panStart.copy( panEnd );

                scope.update();
                break;

                default:

                    state = STATE.NONE;

            }

        }

        function touchend( /* event */ ) {

            if ( scope.enabled === false ) return;

            scope.dispatchEvent( endEvent );
            state = STATE.NONE;

        }

        function contextmenu( event ) {

            event.preventDefault();

        }

        this.dispose = function() {

            this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
            this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
            this.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
            this.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

            this.domElement.removeEventListener( 'touchstart', touchstart, false );
            this.domElement.removeEventListener( 'touchend', touchend, false );
            this.domElement.removeEventListener( 'touchmove', touchmove, false );

            document.removeEventListener( 'mousemove', onMouseMove, false );
            document.removeEventListener( 'mouseup', onMouseUp, false );

            window.removeEventListener( 'keydown', onKeyDown, false );

        };

        this.domElement.addEventListener( 'contextmenu', contextmenu, false );

        this.domElement.addEventListener( 'mousedown', onMouseDown, false );
        this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
        this.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );

        window.addEventListener( 'keydown', onKeyDown, false );

        // force an update at start
        this.update();

    };

    THREE.FollowOrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
    THREE.FollowOrbitControls.prototype.constructor = THREE.FollowOrbitControls;

    Object.defineProperties( THREE.FollowOrbitControls.prototype, {

        object: {

            get: function () {

                return this.constraint.object;

            }

        },

        velocityRequest: {

            get: function () {

                return this.constraint.velocityRequest;

            }

        },

        target: {

            get: function () {

                return this.constraint.target;

            },

            set: function ( value ) {

                // console.warn( 'THREE.FollowOrbitControls: target is now immutable. Use target.set() instead.' );
                this.constraint.target = value;

            }

        },

        minDistance : {

            get: function () {

                return this.constraint.minDistance;

            },

            set: function ( value ) {

                this.constraint.minDistance = value;

            }

        },

        maxDistance : {

            get: function () {

                return this.constraint.maxDistance;

            },

            set: function ( value ) {

                this.constraint.maxDistance = value;

            }

        },

        minZoom : {

            get: function () {

                return this.constraint.minZoom;

            },

            set: function ( value ) {

                this.constraint.minZoom = value;

            }

        },

        maxZoom : {

            get: function () {

                return this.constraint.maxZoom;

            },

            set: function ( value ) {

                this.constraint.maxZoom = value;

            }

        },

        minPolarAngle : {

            get: function () {

                return this.constraint.minPolarAngle;

            },

            set: function ( value ) {

                this.constraint.minPolarAngle = value;

            }

        },

        maxPolarAngle : {

            get: function () {

                return this.constraint.maxPolarAngle;

            },

            set: function ( value ) {

                this.constraint.maxPolarAngle = value;

            }

        },

        minAzimuthAngle : {

            get: function () {

                return this.constraint.minAzimuthAngle;

            },

            set: function ( value ) {

                this.constraint.minAzimuthAngle = value;

            }

        },

        maxAzimuthAngle : {

            get: function () {

                return this.constraint.maxAzimuthAngle;

            },

            set: function ( value ) {

                this.constraint.maxAzimuthAngle = value;

            }

        },

        enableDamping : {

            get: function () {

                return this.constraint.enableDamping;

            },

            set: function ( value ) {

                this.constraint.enableDamping = value;

            }

        },

        dampingFactor : {

            get: function () {

                return this.constraint.dampingFactor;

            },

            set: function ( value ) {

                this.constraint.dampingFactor = value;

            }

        },

        // backward compatibility

        noZoom: {

            get: function () {

                console.warn( 'THREE.FollowOrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
                return ! this.enableZoom;

            },

            set: function ( value ) {

                console.warn( 'THREE.FollowOrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
                this.enableZoom = ! value;

            }

        },

        noRotate: {

            get: function () {

                console.warn( 'THREE.FollowOrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
                return ! this.enableRotate;

            },

            set: function ( value ) {

                console.warn( 'THREE.FollowOrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
                this.enableRotate = ! value;

            }

        },

        noPan: {

            get: function () {

                console.warn( 'THREE.FollowOrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
                return ! this.enablePan;

            },

            set: function ( value ) {

                console.warn( 'THREE.FollowOrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
                this.enablePan = ! value;

            }

        },

        noKeys: {

            get: function () {

                console.warn( 'THREE.FollowOrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
                return ! this.enableKeys;

            },

            set: function ( value ) {

                console.warn( 'THREE.FollowOrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
                this.enableKeys = ! value;

            }

        },

        staticMoving : {

            get: function () {

                console.warn( 'THREE.FollowOrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
                return ! this.constraint.enableDamping;

            },

            set: function ( value ) {

                console.warn( 'THREE.FollowOrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
                this.constraint.enableDamping = ! value;

            }

        },

        dynamicDampingFactor : {

            get: function () {

                console.warn( 'THREE.FollowOrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
                return this.constraint.dampingFactor;

            },

            set: function ( value ) {

                console.warn( 'THREE.FollowOrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
                this.constraint.dampingFactor = value;

            }

        }

    } );

}() );
