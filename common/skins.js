/**
 * Zorbio Game Client
 */

// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global ZOR:true
*/

const NODEJS_SKINS = typeof module !== 'undefined' && module.exports;

ZOR.SkinCatelog = {
    default: {
        name         : 'default',
        type         : 'custom',
        friendly_name: 'Smooth Shade',
        preview      : 'skins/default/thumb.jpg',
        sort         : 1,
    },
    earth: {
        name         : 'earth',
        type         : 'standard',
        friendly_name: 'Planet Earth',
        color        : '#B9D5EB',
        trail        : 'particle',
        capture      : 'fire',
        preview      : 'skins/earth/thumb.jpg',
        texture      : 'skins/earth/earth-sphere-map.jpg',
        sort         : 2,
    },
    jupiter: {
        name         : 'jupiter',
        type         : 'standard',
        friendly_name: 'Planet Jupiter',
        color        : '#F8FF38',
        trail        : 'particle',
        capture      : 'fire',
        preview      : 'skins/images/jupiter_thumb.jpg',
        texture      : 'skins/images/jupiter_texture.jpg',
        sort         : 5,
    },

};

if (NODEJS_SKINS) module.exports = ZOR.SkinCatelog;
