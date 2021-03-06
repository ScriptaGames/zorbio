// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true,
 ZOR:true,
 Modernizr:true,
 Howl:true,
 Wad:true,
 _:true
*/

ZOR.Sounds = (function ZORSounds() {
    /**
     * A simple helper function to avoid repetition when creating Howl objects for our sfx
     * @param {string} path
     * @param {Object} custom
     * @returns {Howl}
     */
    function howlSfx(path, custom) {
        let conf = _.assign({
            src     : ['../sfx/' + path],
            autoplay: false,
            loop    : false,
            volume  : config.VOLUME_SFX_INITIAL,
            buffer  : false,
            preload : true,
        }, custom);
        return new Howl(conf);
    }

    /**
     * A simple helper function for creating Wad sounds.  If Web Audio API
     * isn't supported, returns a mock object which plays no sounds.
     * @param {Object} settings
     * @returns {Object}
     */
    function wadSfx(settings) {
        if (Modernizr.webaudio) {
            return new Wad(settings);
        }
        else {
            return { play: _.noop, stop: _.noop };
        }
    }

    let sounds = {
        musicVolume: function(vol) {
            _.each(sounds.music, function(music) {
                music.volume(vol);
            });
            localStorage.volume_music = vol;
            console.log(`set music volume to ${vol}`);
        },
        sfxVolume: function(vol) {
            sounds.sfx.food_capture.volume(vol);
            sounds.sfx.player_capture.volume(vol);
            sounds.sfx.state_change.volume(vol);
            sounds.sfx.woosh.setVolume(vol);
            sounds.sfx.woosh.stop(); // For some reason woosh starts playing when volume set
            localStorage.volume_sfx = vol;
            console.log(`set sfx volume to ${vol}`);
        },
        playMusic: function(name) {
            sounds.stopMusic();
            sounds.music[name].play();
        },
        stopMusic: function() {
            _.forEach(sounds.music, function(music) {
                music.stop();
            });
        },
        music: {
            menu    : howlSfx('veus/Zorbio_MainMenu.ogg.mp3', { loop: true, volume: config.VOLUME_MUSIC_INITIAL }),
            play    : howlSfx('veus/Zorbio_GamePlay.ogg.mp3', { loop: true, volume: config.VOLUME_MUSIC_INITIAL }),
            gameover: howlSfx('veus/Zorbio_GameOver.ogg.mp3', { loop: true, volume: config.VOLUME_MUSIC_INITIAL }),
        },
        sfx: {
            // Only commented out food capture because it's worth saving the
            // envelope (env) below.
            // food_capture: new Wad({
            //     source: 'sine',
            //     volume: config.VOLUME_FOOD_CAPTURE,
            //     env: {
            //         attack: 0.001,
            //         decay: 0.001,
            //         sustain: .9,
            //         hold: 0.1,
            //         release: 0.5
            //     },
            // }),

            // a chime sound for food capture
            food_capture: howlSfx('veus/Effects/LowPitchLazer.ogg.mp3', { volume: 1.0 }),
            woosh       : wadSfx({
                source: 'noise',
                volume: 0.7,
                env   : {
                    attack : 0.5,
                    decay  : 0.5,
                    sustain: 1,
                    hold   : 3600, // a long time... 1 hour
                    release: .5,
                },
                filter: {
                    type     : 'lowpass',
                    frequency: 300,
                    q        : 1.0,
                },
            }),
            state_change  : howlSfx('state_change.mp3', {}),
            player_capture: howlSfx('veus/Effects/LowPitchDrop.ogg.mp3', {}),
        },
        playFromPos: function ZORSoundsPlayFromPos(sound, earObject, soundPos) {
            let dist = earObject.position.distanceTo(soundPos);
            let pos = earObject.worldToLocal(soundPos).normalize().multiplyScalar(dist/config.VOLUME_FALLOFF_RATE);
            let volume = localStorage.volume_sfx ? localStorage.volume_sfx : config.VOLUME_SFX_INITIAL;

            // Make sure volume is set right
            sound.volume(volume);

            let id = sound.play();
            sound.pos(pos.x, pos.y, pos.z, id);
        },
        playFromDelta: function ZORSoundsPlayFromPos(sound, value1, value2) {
            let pos = { x: 0, y: 0, z: 0 };
            let delta = (value2 - value1) / value1;
            let modifiedVolume = Math.min(1, 1 + delta);  // volume should be between 0-1

            // apply user preference
            modifiedVolume *= localStorage.volume_sfx ? localStorage.volume_sfx : config.VOLUME_SFX_INITIAL;

            console.log('playFromDelta: value1', value1, 'value2', value2);
            console.log('playFromDelta: delta', delta, 'modifiedVolume', modifiedVolume);

            // Set the new volume
            sound.volume(modifiedVolume);

            // Play the sound now at modified volume level
            let id = sound.play();
            sound.pos(pos.x, pos.y, pos.z, id);
        },
    };

    if (!config.MUSIC_ENABLED) {
        sounds.music = {};
    }

    /**
     * Initialize sound fx hacks to deal with weird problems
     */
    function initSfxHacks() {
        // woosh sound from wad needs to be started and stopped
        // otherwise causes an error on mobile devices on death
        // TODO: figure out why this is
        sounds.sfx.woosh.play();
        sounds.sfx.woosh.stop();
    }
    initSfxHacks();

    return sounds;
})();
