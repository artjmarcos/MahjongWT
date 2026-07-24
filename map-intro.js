// ============================================================================
// map-intro.js - Animacion cinematografica: mapa del pais → zoom → satelite → tablero
// ----------------------------------------------------------------------------
// Secuencia:
//   1. (0-1s)   Aparece el mapa SVG del pais con un marcador pulsante en la zona
//   2. (1-2.5s) Zoom progresivo hacia el marcador (transform scale + translate)
//   3. (2.5-3s) Crossfade a la foto satelital de la zona (la primera foto)
//   4. (3-3.5s) Fade out del satelital, aparece el tablero de Mahjong
// Total: ~3.5s. Skipeable con tap (pasa directo al tablero).
// ============================================================================

var MapIntro = (function() {
    'use strict';

    var isActive = false;
    var skipRequested = false;

    function show(zoneId, onComplete) {
        if (isActive) return;
        var zone = MapData.getZone(zoneId);
        if (!zone) { if (onComplete) onComplete(); return; }

        var country = MapData.getCountry(zone.country);
        if (!country) { if (onComplete) onComplete(); return; }

        // Calcular posicion del marcador en el SVG
        var pos = MapData.latLonToPercent(zone.country, zone.lat, zone.lon);

        // Obtener la foto satelital (primera foto de la zona)
        var zoneObj = (typeof ZONES !== 'undefined') ? ZONES.find(function(z){ return z.id === zoneId; }) : null;
        var satelliteUrl = zoneObj && zoneObj.photos && zoneObj.photos.length > zone.photoIdx
            ? zoneObj.photos[zone.photoIdx].url.replace('sz=w400', 'sz=w800')
            : null;
        var zoneName = zoneObj ? zoneObj.name : zone.name;

        isActive = true;
        skipRequested = false;

        // Crear overlay
        var overlay = document.createElement('div');
        overlay.id = 'mapIntroOverlay';
        overlay.style.cssText =
            'position:fixed;inset:0;background:#0b1512;z-index:9999;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'overflow:hidden;font-family:Outfit,sans-serif;cursor:pointer;';

        // Capa 1: mapa SVG del pais (visible al inicio)
        var mapLayer = document.createElement('div');
        mapLayer.style.cssText =
            'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
            'transition:transform 1.5s cubic-bezier(0.4,0,0.2,1),opacity 0.5s ease;';

        // SVG del pais con el marcador
        mapLayer.innerHTML = buildMapSVG(country, pos, zoneName);

        // Capa 2: foto satelital (oculta al inicio, visible en el crossfade)
        var satelliteLayer = document.createElement('div');
        satelliteLayer.style.cssText =
            'position:absolute;inset:0;background-size:cover;background-position:center;' +
            'opacity:0;transition:opacity 0.6s ease;';
        if (satelliteUrl) {
            satelliteLayer.style.backgroundImage = 'url(' + satelliteUrl + ')';
        }

        // Overlay oscuro sobre el satelital para legibilidad
        var darkOverlay = document.createElement('div');
        darkOverlay.style.cssText =
            'position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,21,18,0.5) 0%,rgba(11,21,18,0.85) 100%);' +
            'opacity:0;transition:opacity 0.6s ease;';

        // Texto: nombre de la zona
        var textLayer = document.createElement('div');
        textLayer.style.cssText =
            'position:absolute;bottom:18%;left:0;right:0;text-align:center;z-index:5;' +
            'opacity:0;transition:opacity 0.6s ease;';
        textLayer.innerHTML =
            '<div style="font-size:0.7em;color:#f2ca50;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:6px;">' +
            country.flag + ' ' + country.name + '</div>' +
            '<div style="font-size:1.6em;color:white;font-weight:bold;text-shadow:0 2px 12px rgba(0,0,0,0.8);">' + zoneName + '</div>' +
            '<div style="font-size:0.6em;color:rgba(242,202,80,0.5);margin-top:10px;letter-spacing:0.2em;">Toca para saltar</div>';

        overlay.appendChild(mapLayer);
        overlay.appendChild(satelliteLayer);
        overlay.appendChild(darkOverlay);
        overlay.appendChild(textLayer);
        document.body.appendChild(overlay);

        // Haptic suave al iniciar
        if (navigator.vibrate) navigator.vibrate(15);

        // Secuencia de animacion (todas skipeables)
        // Fase 1 (0-1s): mapa visible, marcador pulsando
        setTimeout(function() { if (skipRequested) return; textLayer.style.opacity = '1'; }, 300);

        // Fase 2 (1-2.5s): zoom hacia el marcador
        setTimeout(function() {
            if (skipRequested) return;
            // Calcular transform para centrar el marcador y hacer zoom 6x
            var tx = 50 - pos.x;  // traslacion X en %
            var ty = 50 - pos.y;
            mapLayer.style.transformOrigin = pos.x + '% ' + pos.y + '%';
            mapLayer.style.transform = 'scale(6) translate(' + tx/6 + '%, ' + ty/6 + '%)';
        }, 1000);

        // Fase 3 (2.5-3s): crossfade al satelital
        setTimeout(function() {
            if (skipRequested) return;
            mapLayer.style.opacity = '0';
            satelliteLayer.style.opacity = '1';
            darkOverlay.style.opacity = '1';
            if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
        }, 2500);

        // Fase 4 (3.5s): cerrar y mostrar tablero
        setTimeout(function() {
            finish();
        }, 3500);

        function finish() {
            if (!isActive) return;
            isActive = false;
            overlay.style.transition = 'opacity 0.4s ease';
            overlay.style.opacity = '0';
            setTimeout(function() {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (onComplete) onComplete();
            }, 400);
        }

        // Skipeable: tap para saltar directo al tablero
        function skip(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!skipRequested) {
                skipRequested = true;
                finish();
            }
        }
        overlay.addEventListener('click', skip);
        overlay.addEventListener('touchend', skip);
    }

    // ====================================================================
    // Construye el SVG del pais con el marcador pulsante en la posicion dada
    // ====================================================================
    function buildMapSVG(country, pos, zoneName) {
        // Color del pais segun el tema
        var countryColors = {
            chile: { fill: 'rgba(45, 106, 142, 0.4)', stroke: '#5fa8c9' },
            argentina: { fill: 'rgba(201, 120, 71, 0.4)', stroke: '#f0b070' },
            mexico: { fill: 'rgba(232, 93, 78, 0.4)', stroke: '#f9c74f' },
            brasil: { fill: 'rgba(45, 164, 78, 0.4)', stroke: '#7fd957' }
        };
        var colors = countryColors[Object.keys(COUNTRY_NAMES).find(function(k) { return COUNTRY_NAMES[k] === country.name; })] || { fill: 'rgba(242,202,80,0.3)', stroke: '#f2ca50' };
        var countryKey = country.flag === '🇨🇱' ? 'chile' : country.flag === '🇦🇷' ? 'argentina' : country.flag === '🇲🇽' ? 'mexico' : 'brasil';
        colors = countryColors[countryKey];

        var svg =
            '<svg viewBox="0 0 100 100" style="width:70%;max-width:380px;height:auto;' +
            'filter:drop-shadow(0 0 30px rgba(242,202,80,0.2));">' +
            // Sombra del pais
            '<path d="' + country.path + '" fill="' + colors.fill + '" stroke="' + colors.stroke + '" stroke-width="0.8" opacity="0.95"/>' +
            // Linea de costa mas brillante
            '<path d="' + country.path + '" fill="none" stroke="' + colors.stroke + '" stroke-width="0.4" opacity="0.6"/>' +
            // Marcador de la zona (pulsante)
            '<g style="transform-origin: ' + pos.x + '% ' + pos.y + '%;">' +
                // Aura pulsante grande
                '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="3" fill="' + colors.stroke + '" opacity="0.3">' +
                    '<animate attributeName="r" values="2;6;2" dur="1.5s" repeatCount="indefinite"/>' +
                    '<animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite"/>' +
                '</circle>' +
                // Punto central fijo
                '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="1.2" fill="#ffffff" stroke="' + colors.stroke + '" stroke-width="0.4"/>' +
                // Linea vertical hasta el borde inferior (estilo Google Maps pin)
                '<line x1="' + pos.x + '" y1="' + pos.y + '" x2="' + pos.x + '" y2="' + (parseFloat(pos.y) + 8) + '" stroke="' + colors.stroke + '" stroke-width="0.3" opacity="0.5" stroke-dasharray="0.5 0.5"/>' +
            '</g>' +
            // Etiqueta del pais (bandera + nombre)
            '<text x="50" y="6" text-anchor="middle" fill="' + colors.stroke + '" font-size="3" font-weight="bold" opacity="0.9">' + country.flag + '</text>' +
            '</svg>';
        return svg;
    }

    // Tabla auxiliar para obtener el country key a partir del nombre
    var COUNTRY_NAMES = {
        chile: 'Chile',
        argentina: 'Argentina',
        mexico: 'México',
        brasil: 'Brasil'
    };

    return Object.freeze({
        show: show,
        isActive: function() { return isActive; }
    });
})();
