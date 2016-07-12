var ZOR = ZOR || {};

ZOR.Sounds = (function ZORSounds() {

    var sounds = {
        sfx: {
            // a chime sound for food capture
            food_capture: new Wad({
                source: 'sine',
                volume: 0.05,
                env: {
                    attack: 0.001,
                    decay: 0.001,
                    sustain: .9,
                    hold: 0.1,
                    release: 0.5
                },
                vibrato : { // A vibrating pitch effect.  Only works for oscillators.
                    shape     : 'square', // shape of the lfo waveform. Possible values are 'sine', 'sawtooth', 'square', and 'triangle'.
                    magnitude : 2,      // how much the pitch changes. Sensible values are from 1 to 10.
                    speed     : 10,      // How quickly the pitch changes, in cycles per second.  Sensible values are from 0.1 to 10.
                    attack    : 0.5       // Time in seconds for the vibrato effect to reach peak magnitude.
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
