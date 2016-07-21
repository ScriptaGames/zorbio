var ZOR = ZOR || {};

ZOR.Sounds = (function ZORSounds() {

    var sounds = {
        sfx: {
            // a chime sound for food capture
            food_capture: new Wad({
                source: 'sine',
                volume: config.VOLUME_FOOD_CAPTURE,
                env: {
                    attack: 0.001,
                    decay: 0.001,
                    sustain: .9,
                    hold: 0.1,
                    release: 0.5
                },
            }),
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
        },
        music: {
            background: new Howl({
                urls: ['../music/starfish-oblivion.mp3'],
                autoplay: false,
                loop: true,
                volume: config.VOLUME_MUSIC_INITIAL,
                buffer: true, // don't wait for entire file to download
            }),
        },
    };

    if (!config.MUSIC_ENABLED) {
        sounds.music = {};
    }

    return sounds;

})();
