// ========== MUSICA CON MP3 REALES (FASE 7) ==========
// Musica tematica por pais usando archivos MP3 reales.
var Musica = (function() {
    var audioElements = {};
    var currentTrack = null;
    var enabled = localStorage.getItem('musicaEnabled') === '1';
    var VOLUMEN = 0.4;

    // [FASE 7] Pistas MP3 reales por pais.
    var TRACKS = {
        menu: { file: 'Cumbres_bajo_el_Sol.mp3', nombre: 'Cumbres bajo el Sol' },
        chile: { file: 'Cumbres_bajo_el_Sol.mp3', nombre: 'Cumbres bajo el Sol' },
        argentina: { file: 'Cortes_de_Medianoche.mp3', nombre: 'Cortes de Medianoche' },
        mexico: { file: 'La_Senda_del_Honor.mp3', nombre: 'La Senda del Honor' },
        brasil: { file: 'Shadows_in_the_Palms.mp3', nombre: 'Shadows in the Palms' }
    };

    // Pre-carga los elementos de audio.
    function initAudio() {
        if (Object.keys(audioElements).length > 0) return;
        Object.keys(TRACKS).forEach(function(key) {
            var audio = new Audio(TRACKS[key].file);
            audio.loop = true;
            audio.volume = 0;
            audio.preload = 'auto';
            audioElements[key] = audio;
        });
    }

    function play(trackName) {
        if (!enabled) return;
        if (!TRACKS[trackName]) trackName = 'menu';
        initAudio();
        // Si ya esta sonando la misma pista, no hacer nada.
        if (currentTrack === trackName) return;
        // Detener pista anterior con fade out.
        stop();
        currentTrack = trackName;
        var audio = audioElements[trackName];
        if (!audio) return;
        audio.currentTime = 0;
        audio.volume = 0;
        audio.play().then(function() {
            // Fade in suave.
            var vol = 0;
            var fadeIn = setInterval(function() {
                vol += 0.04;
                if (vol >= VOLUMEN) { vol = VOLUMEN; clearInterval(fadeIn); }
                audio.volume = vol;
            }, 80);
        }).catch(function(e) {
            // Autoplay bloqueado: se reanudara en el primer click del usuario.
            console.warn('Audio autoplay bloqueado:', e);
        });
    }

    function stop() {
        if (!currentTrack) return;
        var audio = audioElements[currentTrack];
        if (audio) {
            // Fade out suave.
            var vol = audio.volume;
            var fadeOut = setInterval(function() {
                vol -= 0.05;
                if (vol <= 0) {
                    vol = 0;
                    clearInterval(fadeOut);
                    audio.pause();
                    audio.currentTime = 0;
                }
                audio.volume = vol;
            }, 50);
        }
        currentTrack = null;
    }

    function pause() { stop(); }

    function setEnabled(on) {
        enabled = !!on;
        localStorage.setItem('musicaEnabled', enabled ? '1' : '0');
        if (enabled) { if (currentTrack) play(currentTrack); }
        else { stop(); }
    }
    function toggle() { setEnabled(!enabled); return enabled; }
    function isEnabled() { return enabled; }
    function isCurrentlyPlaying() { return currentTrack !== null; }
    function getCurrentTrack() { return currentTrack; }

    return Object.freeze({
        play: play, stop: stop, pause: pause,
        setEnabled: setEnabled, toggle: toggle,
        isEnabled: isEnabled, isCurrentlyPlaying: isCurrentlyPlaying,
        getCurrentTrack: getCurrentTrack, TRACKS: TRACKS
    });
})();
