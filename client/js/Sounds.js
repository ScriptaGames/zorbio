var ZOR = ZOR || {};

ZOR.Sounds = (function ZORSounds() {

    // A simple helper function to avoid repetition when creating Howl objects
    // for our sfx
    function howlSfx(path, custom) {
        var conf = _.assign({
            src: ['../sfx/' + path],
            autoplay: false,
            loop: false,
            volume: config.VOLUME_SFX_INITIAL,
            buffer: false,
            preload: true,
            volume: 0.3,
        }, custom);
        return new Howl(conf);
    }

    // A simple helper function for creating Wad sounds.  If Web Audio API
    // isn't supported, returns a mock object which plays no sounds.
    function wadSfx(settings) {
        if (Modernizr.webaudio) {
            return new Wad(settings);
        }
        else {
            return { play: _.noop, stop: _.noop };
        }
    }

    var sounds = {
        musicVolume: function (vol) {
            _.each(sounds.music, function (music) { music.volume(vol); });
            localStorage.volume_music = vol;
            console.log(`set music volume to ${vol}`);
        },
        sfxVolume: function (vol) {
            _.each(
                sounds.sfx,
                _.partial( _.invoke, _, 'setVolume', vol )
            );
            localStorage.volume_sfx = vol;
            console.log(`set sfx volume to ${vol}`);
        },
        playMusic: function (name) {
            sounds.stopMusic();
            sounds.music[name].play();
        },
        stopMusic: function () {
            _.forEach(sounds.music, function (music) { music.stop(); });
        },
        music: {
            menu     : howlSfx('veus/Zorbio_MainMenu.ogg.mp3', { loop : true, volume : config.VOLUME_MUSIC_INITIAL }),
            play     : howlSfx('veus/Zorbio_GamePlay.ogg.mp3', { loop : true, volume : config.VOLUME_MUSIC_INITIAL }),
            gameover : howlSfx('veus/Zorbio_GameOver.ogg.mp3', { loop : true, volume : config.VOLUME_MUSIC_INITIAL }),
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
            food_capture: howlSfx('veus/Effects/LowPitchLazer.ogg.mp3'),
            woosh: wadSfx({
                source: 'noise',
                volume: 0.35,
                env: {
                    attack: 0.5,
                    decay: 0.5,
                    sustain: 1,
                    hold: 3600, // a long time... 1 hour
                    release: .5
                },
                filter: {
                    type: 'lowpass',
                    frequency: 300,
                    q: 1.0
                },
            }),
            state_change: howlSfx('food_capture/D3.mp3'),
            player_capture: howlSfx('veus/Effects/LowPitchDrop.ogg.mp3'),
        },
        playFromPos: function ZORSoundsPlayFromPos(sound, earObject, soundPos) {
            var dist = earObject.position.distanceTo(soundPos);
            var pos = earObject.worldToLocal(soundPos).normalize().multiplyScalar(dist/config.VOLUME_FALLOFF_RATE);
            var id = sound.play();
            sound.pos(pos.x, pos.y, pos.z, id);
        },
    };

    if (!config.MUSIC_ENABLED) {
        sounds.music = {};
    }

    function initSfxHacks() {
        // The Howler sfx seem to be delayed and sound glitchy the first time
        // they're played.  This function attempts to fix that by playing them
        // once, at zero volume.
        var sound = sounds.sfx.food_capture;
        var id = sound.play();
        sound.mute(true, id);
        sound.volume(0, id);
        sound.pos(1,1,1,id);

        // woosh sound from wad needs to be started and stopped
        sounds.sfx.woosh.play();
        sounds.sfx.woosh.stop();
    }
    initSfxHacks();

    return sounds;

})();
