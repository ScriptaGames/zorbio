var ZOR = ZOR || {};

ZOR.Sounds = (function ZORSounds() {

    return {

        food_capture: {
            "01": new Howl({
                urls: ['../sfx/58697__arioke__kalimba-lam01-f2-tip-soft.wav'],
            }),
            "02": new Howl({
                urls: ['../sfx/58699__arioke__kalimba-lam02-g2-tip-soft.wav'],
            }),
            "03": new Howl({
                urls: ['../sfx/58701__arioke__kalimba-lam03-bb2-tip-soft.wav'],
            }),
            "04": new Howl({
                urls: ['../sfx/58703__arioke__kalimba-lam04-d3-tip-soft.wav'],
            }),
            "05": new Howl({
                urls: ['../sfx/58705__arioke__kalimba-lam05-e3-tip-soft.wav'],
            }),
            "06": new Howl({
                urls: ['../sfx/58707__arioke__kalimba-lam06-f3-tip-soft.wav'],
            }),
            "07": new Howl({
                urls: ['../sfx/58711__arioke__kalimba-lam08-a3-tip-soft.wav'],
            }),
        },
        music: {
            "background": new Howl({
                urls: ['../music/starfish-oblivion.mp3'],
                autoplay: false,
                loop: true,
                volume: config.VOLUME_MUSIC_INITIAL,
                buffer: true, // don't wait for entire file to download
            }),
        },

    };

})();

