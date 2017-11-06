/*
global ZOR:true
*/

ZOR.SkinFactory = {
    createSkin: function ZORCreateSkin(skinName, playerView) {
        const skinMeta = ZOR.SkinCatalog[skinName];
        let playerSkin;

        if (skinMeta.type === 'standard') {
            playerSkin = ZOR.PlayerSkins.standard(playerView, skinMeta);
        }
        else if (ZOR.PlayerSkins[skinName]) {
            playerSkin = ZOR.PlayerSkins[skinName](playerView);
        }
        else {
            playerSkin = ZOR.PlayerSkins.default(playerView);
        }

        return playerSkin;
    },
};
