// ============================================================================
// map-intro.js - Animacion cinematografica con mapas REALES (Leaflet.js)
// ----------------------------------------------------------------------------
// Secuencia:
//   1. (0-1s)   Mapa real del pais (OpenStreetMap) con marcador en la zona
//   2. (1-3s)   Zoom animado hacia el marcador (flyTo de Leaflet)
//   3. (3-3.5s) Cambio a vista satelital (Esri World Imagery)
//   4. (3.5-4s) Fade out, aparece el tablero de Mahjong
// Total: ~4s. Skipeable con tap.
//
// Requiere: Leaflet.js cargado globalmente (window.L)
// ============================================================================

var MapIntro = (function() {
    'use strict';

    var isActive = false;
    var skipRequested = false;
    var mapInstance = null;

    // Capas de tiles
    var osmLayer = null;
    var satelliteLayer = null;

    function show(zoneId, onComplete) {
        if (isActive) return;

        // Verificar que Leaflet este disponible
        if (typeof L === 'undefined') {
            console.warn('Leaflet no cargado, saltando map intro');
            if (onComplete) onComplete();
            return;
        }

        var zone = MapData.getZone(zoneId);
        if (!zone) {
            if (onComplete) onComplete();
            return;
        }

        var country = MapData.getCountry(zone.country);
        if (!country) {
            if (onComplete) onComplete();
            return;
        }

        // Obtener info de la zona desde ZONES
        var zoneObj = (typeof ZONES !== 'undefined') ? ZONES.find(function(z){ return z.id === zoneId; }) : null;
        var zoneName = zoneObj ? zoneObj.name : zone.name;
        var countryName = country.name;
        var flag = country.flag;

        isActive = true;
        skipRequested = false;

        // Crear overlay
        var overlay = document.createElement('div');
        overlay.id = 'mapIntroOverlay';
        overlay.style.cssText =
            'position:fixed;inset:0;background:#0b1512;z-index:9999;' +
            'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'overflow:hidden;font-family:Outfit,sans-serif;cursor:pointer;';

        // Contenedor del mapa Leaflet (llena todo el overlay)
        var mapContainer = document.createElement('div');
        mapContainer.id = 'mapIntroLeaflet';
        mapContainer.style.cssText =
            'position:absolute;inset:0;width:100%;height:100%;z-index:1;' +
            'background:#0a1a14;';

        // Overlay oscuro para legibilidad (debajo del texto)
        var darkOverlay = document.createElement('div');
        darkOverlay.style.cssText =
            'position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,21,18,0.4) 0%,rgba(11,21,18,0.1) 40%,rgba(11,21,18,0.85) 100%);' +
            'z-index:2;pointer-events:none;';

        // Texto: nombre del pais + zona
        var textLayer = document.createElement('div');
        textLayer.style.cssText =
            'position:absolute;bottom:18%;left:0;right:0;text-align:center;z-index:5;' +
            'opacity:0;transition:opacity 0.6s ease;pointer-events:none;padding:0 20px;';
        textLayer.innerHTML =
            '<div style="font-size:0.7em;color:#f2ca50;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:6px;text-shadow:0 2px 8px rgba(0,0,0,0.8);">' +
            flag + ' ' + countryName + '</div>' +
            '<div style="font-size:1.7em;color:white;font-weight:bold;text-shadow:0 2px 12px rgba(0,0,0,0.9);">' + zoneName + '</div>' +
            '<div style="font-size:0.6em;color:rgba(242,202,80,0.6);margin-top:12px;letter-spacing:0.2em;text-shadow:0 1px 4px rgba(0,0,0,0.8);">📍 ' + zone.lat.toFixed(2) + ', ' + zone.lon.toFixed(2) + '</div>' +
            '<div style="font-size:0.55em;color:rgba(255,255,255,0.4);margin-top:18px;letter-spacing:0.2em;">Toca para saltar</div>';

        overlay.appendChild(mapContainer);
        overlay.appendChild(darkOverlay);
        overlay.appendChild(textLayer);
        document.body.appendChild(overlay);

        // Forzar layout para que mapContainer tenga dimensiones antes de init Leaflet
        void mapContainer.offsetWidth;

        // Inicializar mapa Leaflet centrado en el pais (zoom bajo para ver todo el pais)
        var countryCenter = getCountryCenter(zone.country);
        mapInstance = L.map('mapIntroLeaflet', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            boxZoom: false,
            keyboard: false,
            fadeAnimation: true,
            zoomAnimation: true,
            markerZoomAnimation: true
        }).setView(countryCenter, 4);

        // Capa OSM (mapa politico)
        osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        });
        osmLayer.addTo(mapInstance);

        // Capa satelital Esri (inicialmente no agregada)
        satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: '© Esri'
        });

        // Marcador en la posicion exacta de la zona
        var markerIcon = L.divIcon({
            className: 'map-intro-marker',
            html: '<div style="' +
                'width:24px;height:24px;border-radius:50%;' +
                'background:#f2ca50;border:3px solid white;' +
                'box-shadow:0 0 0 4px rgba(242,202,80,0.4),0 4px 12px rgba(0,0,0,0.6);' +
                'position:relative;' +
                'animation: mapMarkerPulse 1.5s ease-in-out infinite;' +
                '"></div>' +
                '<div style="' +
                'position:absolute;top:100%;left:50%;transform:translateX(-50%);' +
                'width:2px;height:40px;background:linear-gradient(to bottom,rgba(242,202,80,0.8),transparent);' +
                'margin-top:-2px;' +
                '"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        var marker = L.marker([zone.lat, zone.lon], { icon: markerIcon }).addTo(mapInstance);

        // Haptic suave
        if (navigator.vibrate) navigator.vibrate(15);

        // ====== SECUENCIA DE ANIMACION ======

        // Fase 1 (300ms): mostrar texto
        setTimeout(function() {
            if (skipRequested) return;
            textLayer.style.opacity = '1';
        }, 300);

        // Fase 2 (1s): iniciar flyTo hacia la zona (zoom 7-8)
        setTimeout(function() {
            if (skipRequested) return;
            mapInstance.flyTo([zone.lat, zone.lon], 8, {
                duration: 2.0,
                easeLinearity: 0.25
            });
            if (navigator.vibrate) navigator.vibrate(20);
        }, 1000);

        // Fase 3 (3.2s): cuando llega el zoom, cambiar a satelital
        setTimeout(function() {
            if (skipRequested) return;
            // Remover OSM y agregar satelital con fade
            mapInstance.removeLayer(osmLayer);
            satelliteLayer.addTo(mapInstance);
            // Forzar un pequeno zoom in adicional para enfatizar
            mapInstance.zoomIn(1);
            if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
        }, 3200);

        // Fase 4 (4.2s): cerrar overlay y mostrar tablero
        setTimeout(function() {
            finish();
        }, 4200);

        function finish() {
            if (!isActive) return;
            isActive = false;
            overlay.style.transition = 'opacity 0.4s ease';
            overlay.style.opacity = '0';
            setTimeout(function() {
                // Destruir mapa Leaflet para liberar memoria
                if (mapInstance) {
                    mapInstance.remove();
                    mapInstance = null;
                }
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
    // Centro geografico aproximado de cada pais (para vista inicial)
    // ====================================================================
    function getCountryCenter(countryId) {
        var centers = {
            chile: [-35.0, -71.0],     // centro longitudinal de Chile
            argentina: [-38.0, -64.0], // centro de Argentina
            mexico: [23.6, -102.0],    // centro de Mexico
            brasil: [-10.0, -52.0]     // centro de Brasil
        };
        return centers[countryId] || [0, 0];
    }

    return Object.freeze({
        show: show,
        isActive: function() { return isActive; }
    });
})();
