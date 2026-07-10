// ========== MUSICA AMBIENTAL PROCEDURAL (FASE 5) ==========
// Genera musica relajante con Web Audio API, sin archivos externos.
// Cada pais tiene su propio "caracter" sonoro:
//   - Chile: tonos andinos (zampoña - onda sinusoidal con vibrato lento)
//   - Argentina: guitarra acústica (onda triangular con arpegios)
//   - México: marimba suave (onda cuadrada con envelope rapido)
//   - Menu principal: pad ambiental (acordes largos)
var Musica = (function() {
    var audioCtx = null;
    var masterGain = null;
    var isPlaying = false;
    var currentTrack = null;
    var scheduler = null;
    var nextNoteTime = 0;
    var noteIndex = 0;
    var enabled = localStorage.getItem('musicaEnabled') !== '0';  // default ON

    // Volumen bajo para no molestar.
    var VOLUMEN = 0.18;

    // [FASE 5] Escalas y patrones por pais. Notas en Hz.
    // Usamos escalas pentatonicas para que suenen bien sin importar el orden.
    var TRACKS = {
        menu: {
            nombre: 'Ambiental',
            // Pad ambiental: acordes largos en escala mayor.
            escala: [261.63, 329.63, 392.00, 523.25, 659.25],  // C E G C E (do mayor)
            tipoOnda: 'sine',
            duracionNota: 4.0,
            vibrato: 0.5,
            patron: [0, 2, 4, 1, 3, 0]  // indices en la escala
        },
        chile: {
            nombre: 'Andina',
            // Zampoña: escala pentatonica menor (estilo andino).
            escala: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00],  // A C D E A A
            tipoOnda: 'sine',
            duracionNota: 1.8,
            vibrato: 0.8,  // vibrato mas pronunciado
            patron: [0, 2, 4, 3, 5, 4, 2, 0]
        },
        argentina: {
            nombre: 'Guitarra',
            // Guitarra acustica: arpegios en mi menor.
            escala: [164.81, 196.00, 246.94, 329.63, 392.00, 493.88],  // E G B E G B
            tipoOnda: 'triangle',
            duracionNota: 1.2,
            vibrato: 0.2,
            patron: [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 5]
        },
        mexico: {
            nombre: 'Marimba',
            // Marimba: escala mayor alegre pero suave.
            escala: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],  // do mayor
            tipoOnda: 'square',
            duracionNota: 0.8,
            vibrato: 0,
            patron: [0, 2, 4, 6, 4, 2, 5, 3, 1, 0, 2, 4]
        }
    };

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0;
            masterGain.connect(audioCtx.destination);
        } catch (e) {
            console.warn('Web Audio API no disponible:', e);
        }
    }

    // Reproduce una sola nota con envelope ADSR simplificado.
    function tocarNota(freq, startTime, duracion, tipoOnda, vibrato) {
        if (!audioCtx) return;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = tipoOnda || 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Vibrato: LFO que modula la frecuencia.
        if (vibrato && vibrato > 0) {
            var lfo = audioCtx.createOscillator();
            var lfoGain = audioCtx.createGain();
            lfo.frequency.value = 5 + vibrato * 3;  // 5-8 Hz
            lfoGain.gain.value = freq * 0.008 * vibrato;  // profundidad del vibrato
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(startTime);
            lfo.stop(startTime + duracion + 0.1);
        }

        // Envelope ADSR: Attack suave, sustain medio, release largo.
        var vol = VOLUMEN;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.15);  // attack
        gain.gain.linearRampToValueAtTime(vol * 0.6, startTime + 0.3);  // decay -> sustain
        gain.gain.setValueAtTime(vol * 0.6, startTime + duracion - 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duracion);  // release

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + duracion + 0.1);
    }

    // Scheduler: programa las notas siguientes con lookahead de 0.5s.
    function schedulerTick() {
        if (!isPlaying || !audioCtx) return;
        var track = TRACKS[currentTrack];
        if (!track) return;
        while (nextNoteTime < audioCtx.currentTime + 0.5) {
            var notaIdx = track.patron[noteIndex % track.patron.length];
            var freq = track.escala[notaIdx];
            tocarNota(freq, nextNoteTime, track.duracionNota, track.tipoOnda, track.vibrato);
            // A veces tocar una segunda nota (tercera o quinta) para dar riqueza.
            if (Math.random() < 0.35 && track.escala.length > 3) {
                var segunda = track.escala[(notaIdx + 2) % track.escala.length];
                tocarNota(segunda * 0.5, nextNoteTime, track.duracionNota * 0.8, track.tipoOnda, track.vibrato * 0.5);
            }
            nextNoteTime += track.duracionNota * 0.9;  // 90% para overlap suave
            noteIndex++;
        }
    }

    function play(trackName) {
        if (!enabled) return;
        if (!TRACKS[trackName]) trackName = 'menu';
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (isPlaying && currentTrack === trackName) return;  // ya sonando
        stop();
        currentTrack = trackName;
        isPlaying = true;
        nextNoteTime = audioCtx.currentTime + 0.1;
        noteIndex = 0;
        // Fade in del master gain.
        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);
        // Scheduler cada 100ms.
        scheduler = setInterval(schedulerTick, 100);
        schedulerTick();
    }

    function stop() {
        if (!isPlaying || !audioCtx) return;
        isPlaying = false;
        if (scheduler) { clearInterval(scheduler); scheduler = null; }
        // Fade out suave.
        try {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
        } catch (e) {}
        currentTrack = null;
    }

    function pause() { stop(); }

    function setEnabled(on) {
        enabled = !!on;
        localStorage.setItem('musicaEnabled', enabled ? '1' : '0');
        if (enabled) {
            // Reanudar con la pista actual (si la habia).
            // La UI debe llamar a play() con el track correspondiente.
            if (currentTrack) play(currentTrack);
        } else {
            stop();
        }
    }
    function toggle() {
        setEnabled(!enabled);
        return enabled;
    }
    function isEnabled() { return enabled; }
    function isCurrentlyPlaying() { return isPlaying; }
    function getCurrentTrack() { return currentTrack; }

    return Object.freeze({
        play: play,
        stop: stop,
        pause: pause,
        setEnabled: setEnabled,
        toggle: toggle,
        isEnabled: isEnabled,
        isCurrentlyPlaying: isCurrentlyPlaying,
        getCurrentTrack: getCurrentTrack,
        TRACKS: TRACKS
    });
})();
