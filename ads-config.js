// ============================================================================
// ads-config.js - Configuracion centralizada de Google AdSense / GPT
// ----------------------------------------------------------------------------
// IMPORTANTE: Para activar anuncios reales, sigue la guia en ADSENSE.md.
// Por defecto, el juego funciona en MODO TEST (sin anuncios reales).
// ============================================================================

var AdsConfig = (function() {
    'use strict';

    var config = {
        publisherId: '',
        units: {
            banner: '/XXXXXXXXXX/mahjong-banner-320x50',
            interstitial: '/XXXXXXXXXX/mahjong-interstitial',
            rewarded: '/XXXXXXXXXX/mahjong-rewarded'
        },
        frequency: {
            interstitialEveryNLevels: 3,
            bannerInMenus: true,
            rewardedEnabled: true
        },
        testMode: true
    };

    function isConfigured() {
        return config.publisherId && config.publisherId.length > 0 && !config.testMode;
    }
    function getPublisherId() { return config.publisherId; }
    function getUnit(type) { return config.units[type] || null; }
    function shouldShowInterstitial(levelsCompleted) {
        if (!isConfigured()) return false;
        if (levelsCompleted <= 0) return false;
        return (levelsCompleted % config.frequency.interstitialEveryNLevels) === 0;
    }
    function shouldShowBanner() {
        if (!isConfigured()) return false;
        return config.frequency.bannerInMenus;
    }
    function isRewardedEnabled() {
        if (!isConfigured()) return false;
        return config.frequency.rewardedEnabled;
    }
    function update(newConfig) {
        for (var key in newConfig) {
            if (newConfig.hasOwnProperty(key)) {
                if (typeof newConfig[key] === 'object' && !Array.isArray(newConfig[key])) {
                    for (var subkey in newConfig[key]) {
                        if (newConfig[key].hasOwnProperty(subkey)) {
                            config[key][subkey] = newConfig[key][subkey];
                        }
                    }
                } else {
                    config[key] = newConfig[key];
                }
            }
        }
    }

    return Object.freeze({
        isConfigured: isConfigured,
        getPublisherId: getPublisherId,
        getUnit: getUnit,
        shouldShowInterstitial: shouldShowInterstitial,
        shouldShowBanner: shouldShowBanner,
        isRewardedEnabled: isRewardedEnabled,
        update: update,
        config: config
    });
})();
