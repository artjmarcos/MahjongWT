// ============================================================================
// map-data.js - Mapas SVG estilizados de cada pais + coordenadas por zona
// ----------------------------------------------------------------------------
// Cada zona tiene coordenadas (x, y) en porcentaje sobre el SVG del pais,
// que representan la ubicacion geografica aproximada donde se encuentran las
// fichas. La animacion de map-intro.js usa esto para hacer zoom a esa zona.
// ============================================================================

var MapData = (function() {
    'use strict';

    // ====================================================================
    // SVG PATHS DE PAISES (simplificados pero reconocibles)
    // viewBox="0 0 100 100" para todos
    // ====================================================================

    var COUNTRIES = {
        chile: {
            name: 'Chile',
            flag: '🇨🇱',
            // Chile es largo y estrecho, baja de norte a sur
            path: 'M 52 8 Q 48 15 50 25 Q 53 35 49 45 Q 46 55 50 65 Q 54 75 48 85 Q 45 92 50 96 L 52 96 Q 50 92 53 85 Q 55 75 50 65 Q 47 55 51 45 Q 54 35 51 25 Q 49 15 53 8 Z',
            // Coordenadas geograficas reales para proyeccion (bbox del pais)
            bbox: { minLat: -56, maxLat: -17, minLon: -76, maxLon: -66 }
        },
        argentina: {
            name: 'Argentina',
            flag: '🇦🇷',
            // Triangulo grande que se estrecha hacia el sur
            path: 'M 20 15 Q 35 12 50 14 Q 70 16 80 22 L 75 35 Q 70 50 65 65 L 55 80 Q 50 90 48 95 L 47 95 Q 45 85 42 75 Q 38 60 32 45 Q 25 30 20 15 Z',
            bbox: { minLat: -55, maxLat: -22, minLon: -74, maxLon: -53 }
        },
        mexico: {
            name: 'México',
            flag: '🇲🇽',
            // Cuerno curvo (north ancho, se estrecha al sureste)
            path: 'M 15 25 Q 30 18 50 20 Q 70 22 85 28 L 80 38 Q 70 45 60 50 Q 55 55 52 62 L 50 70 Q 48 75 52 78 L 55 80 Q 50 82 45 78 L 42 70 Q 40 60 45 52 Q 50 45 40 42 Q 25 38 18 32 Z',
            bbox: { minLat: 14, maxLat: 33, minLon: -118, maxLon: -86 }
        },
        brasil: {
            name: 'Brasil',
            flag: '🇧🇷',
            // Masa continental grande redondeada
            path: 'M 25 30 Q 35 22 50 22 Q 65 22 75 28 L 85 38 Q 88 50 82 60 Q 78 72 70 80 L 60 85 Q 50 88 40 85 L 28 78 Q 18 70 15 58 Q 12 45 18 38 Z',
            bbox: { minLat: -34, maxLat: 5, minLon: -74, maxLon: -34 }
        }
    };

    // ====================================================================
    // ZONAS: lat/lon real + nombre + foto satelital (la primera de la zona)
    // ====================================================================

    var ZONES_GEO = {
        // ===== CHILE =====
        'norte':       { country: 'chile',     lat: -23.65, lon: -70.40, name: 'Norte · Atacama',     photoIdx: 0 },
        'centro':      { country: 'chile',     lat: -33.05, lon: -71.62, name: 'Centro · Valparaíso', photoIdx: 0 },
        'sur':         { country: 'chile',     lat: -39.81, lon: -73.24, name: 'Sur · Valdivia',      photoIdx: 0 },
        'austral':     { country: 'chile',     lat: -51.00, lon: -73.00, name: 'Austral · Patagonia', photoIdx: 0 },

        // ===== ARGENTINA =====
        'argentina-norte':      { country: 'argentina', lat: -23.32, lon: -65.01, name: 'Norte · Jujuy',       photoIdx: 0 },
        'argentina-centro':     { country: 'argentina', lat: -34.60, lon: -58.38, name: 'Centro · Buenos Aires', photoIdx: 0 },
        'argentina-patagonia':  { country: 'argentina', lat: -50.50, lon: -73.15, name: 'Patagonia · Glaciares', photoIdx: 0 },
        'argentina-litoral':    { country: 'argentina', lat: -25.69, lon: -54.44, name: 'Litoral · Iguazú',     photoIdx: 0 },

        // ===== MEXICO =====
        'mexico-norte':  { country: 'mexico', lat: 28.63, lon: -106.07, name: 'Norte · Chihuahua',   photoIdx: 0 },
        'mexico-centro': { country: 'mexico', lat: 19.43, lon: -99.13,  name: 'Centro · CDMX',       photoIdx: 0 },
        'mexico-sur':    { country: 'mexico', lat: 17.07, lon: -96.73,  name: 'Sur · Oaxaca',        photoIdx: 0 },
        'mexico-caribe': { country: 'mexico', lat: 21.16, lon: -86.85,  name: 'Caribe · Cancún',     photoIdx: 0 },

        // ===== BRASIL =====
        'brasil-amazonia':  { country: 'brasil', lat: -3.47,  lon: -62.22, name: 'Amazonia · Manaus',    photoIdx: 0 },
        'brasil-nordeste':  { country: 'brasil', lat: -12.97, lon: -38.48, name: 'Nordeste · Salvador',  photoIdx: 0 },
        'brasil-sudeste':   { country: 'brasil', lat: -22.91, lon: -43.17, name: 'Sudeste · Rio',        photoIdx: 0 },
        'brasil-sul':       { country: 'brasil', lat: -27.59, lon: -48.54, name: 'Sul · Florianópolis',  photoIdx: 0 }
    };

    // ====================================================================
    // API: convertir lat/lon a coordenadas % (x, y) sobre el SVG del pais
    // ====================================================================
    function latLonToPercent(countryId, lat, lon) {
        var country = COUNTRIES[countryId];
        if (!country) return { x: 50, y: 50 };
        var bbox = country.bbox;
        // x: longitud (oeste=min, este=max) → 0% a 100%
        var x = ((lon - bbox.minLon) / (bbox.maxLon - bbox.minLon)) * 100;
        // y: latitud (norte=max, sur=min) → 0% (arriba) a 100% (abajo)
        var y = ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * 100;
        // Clamp por seguridad
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));
        return { x: x, y: y };
    }

    function getCountry(countryId) {
        return COUNTRIES[countryId] || null;
    }

    function getZone(zoneId) {
        return ZONES_GEO[zoneId] || null;
    }

    function getAllCountries() {
        return Object.keys(COUNTRIES);
    }

    return Object.freeze({
        COUNTRIES: COUNTRIES,
        ZONES_GEO: ZONES_GEO,
        latLonToPercent: latLonToPercent,
        getCountry: getCountry,
        getZone: getZone,
        getAllCountries: getAllCountries
    });
})();
