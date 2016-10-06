var ZOR = ZOR || {};

ZOR.Sounds = (function ZORSounds() {

    // A simple helper function to avoid repetition when creating Howl objects
    // for our sfx
    function howlSfx(path) {
        return new Howl({
            src: ['../sfx/' + path],
            autoplay: false,
            loop: false,
            volume: config.VOLUME_SFX_INITIAL,
            buffer: false,
            preload: true,
            volume: 0.1,
        })
    }

    var sounds = {
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
            food_capture: {
                A3: howlSfx('food_capture/A3.mp3'),
                A4: howlSfx('food_capture/A4.mp3'),
                B3: howlSfx('food_capture/B3.mp3'),
                B4: howlSfx('food_capture/B4.mp3'),
                D3: howlSfx('food_capture/D3.mp3'),
                D4: howlSfx('food_capture/D4.mp3'),
                E3: howlSfx('food_capture/E3.mp3'),
                E4: howlSfx('food_capture/E4.mp3'),
                G3: howlSfx('food_capture/G3.mp3'),
                G4: howlSfx('food_capture/G4.mp3'),
                Gb3: howlSfx('food_capture/Gb3.mp3'),
            },
            woosh: new Wad({
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
            player_capture: new Wad({
                volume: config.VOLUME_SFX_INITIAL,
                source: 'sfx/player_capture.wav',
            }),
        },
    };

    if (!config.MUSIC_ENABLED) {
        sounds.music = {};
    }

    return sounds;

})();
