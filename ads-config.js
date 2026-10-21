var AdsConfig = (function() {
    'use strict';

    // Revisión / publicación: desactivado por defecto para evitar bloqueos de políticas.
    // Cuando tengas el Publisher ID real de AdMob y la política aprobada, puedes activar los anuncios aquí.
    var config = {
        publisherId: '',
        units: {
            banner: '/XXXXXXXXXXXX/banner',
            interstitial: '/XXXXXXXXXXXX/interstitial',
            rewarded: '/XXXXXXXXXXXX/rewarded'
        },
        frequency: {
            interstitialEveryNLevels: 999,
            bannerInMenus: false,
            rewardedEnabled: false
        },
        testMode: true,
        reviewMode: true
    };

    function isConfigured() {
        return false;
    }

    function getPublisherId() { return config.publisherId; }
    function getUnit(type) { return config.units[type] || null; }
    function shouldShowInterstitial(levelsCompleted) {
        if (!isConfigured()) return false;
        if (levelsCompleted <= 0) return false;
        return (levelsCompleted % config.frequency.interstitialEveryNLevels) === 0;
    }
    function shouldShowBanner() {
        return false;
    }
    function isRewardedEnabled() {
        return false;
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
