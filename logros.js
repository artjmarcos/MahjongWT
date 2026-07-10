// ========== SISTEMA DE LOGROS (FASE 4) ==========
var Logros = (function() {
    // [FASE 4] Definicion de logros. Cada uno tiene:
    //   id, nombre, desc, icono, categoria, recompensa (monedas), tipo (stat|hito), condicion.
    //   - tipo 'stat': acumulativo, se evalua con un valor numerico contra objetivo.
    //   - tipo 'hito': binario, se desbloquea cuando se recibe el evento correspondiente.
    var LOGROS = [
        // ===== PROGRESION =====
        { id: 'primer_paso', nombre: 'Primer paso', desc: 'Completa tu primer nivel', icono: '🎯', cat: 'Progresión', recompensa: 5, tipo: 'hito', evento: 'levelComplete' },
        { id: 'chile_completo', nombre: 'Conquistador de Chile', desc: 'Completa todas las zonas de Chile', icono: '🇨🇱', cat: 'Progresión', recompensa: 30, tipo: 'stat', stat: 'chileStars', objetivo: 120 },
        { id: 'argentina_completo', nombre: 'Bailarín de Tango', desc: 'Completa todas las zonas de Argentina', icono: '🇦🇷', cat: 'Progresión', recompensa: 30, tipo: 'stat', stat: 'argentinaStars', objetivo: 120 },
        { id: 'mexico_completo', nombre: 'Azteca de honor', desc: 'Completa todas las zonas de México', icono: '🇲🇽', cat: 'Progresión', recompensa: 30, tipo: 'stat', stat: 'mexicoStars', objetivo: 120 },
        { id: 'america_completo', nombre: 'Conquistador de América', desc: 'Completa todos los niveles', icono: '🌎', cat: 'Progresión', recompensa: 100, tipo: 'stat', stat: 'totalStars', objetivo: 360 },

        // ===== COMBOS =====
        { id: 'combo_x2', nombre: 'En racha', desc: 'Alcanza un combo x2', icono: '🔥', cat: 'Combos', recompensa: 5, tipo: 'stat', stat: 'maxCombo', objetivo: 2 },
        { id: 'combo_x3', nombre: 'Imparable', desc: 'Alcanza un combo x3', icono: '⚡', cat: 'Combos', recompensa: 10, tipo: 'stat', stat: 'maxCombo', objetivo: 3 },
        { id: 'combo_x5', nombre: 'Lluvia de estrellas', desc: 'Alcanza un combo x5', icono: '🌟', cat: 'Combos', recompensa: 25, tipo: 'stat', stat: 'maxCombo', objetivo: 5 },
        { id: 'combo_x10', nombre: 'Leyenda viviente', desc: 'Alcanza un combo x10', icono: '👑', cat: 'Combos', recompensa: 100, tipo: 'stat', stat: 'maxCombo', objetivo: 10 },

        // ===== MAESTRIA =====
        { id: 'primera_3estrellas', nombre: 'Perfeccionista', desc: 'Obtén 3 estrellas en un nivel', icono: '⭐', cat: 'Maestría', recompensa: 10, tipo: 'stat', stat: 'levels3Stars', objetivo: 1 },
        { id: 'diez_3estrellas', nombre: 'Estrella en ascenso', desc: 'Obtén 3 estrellas en 10 niveles', icono: '💫', cat: 'Maestría', recompensa: 25, tipo: 'stat', stat: 'levels3Stars', objetivo: 10 },
        { id: 'todas_3estrellas', nombre: 'Maestro del Mahjong', desc: '3 estrellas en TODOS los niveles', icono: '🏅', cat: 'Maestría', recompensa: 200, tipo: 'stat', stat: 'levels3Stars', objetivo: 120 },

        // ===== MINIJUEGOS =====
        { id: 'primer_minijuego', nombre: 'Gamer', desc: 'Completa tu primer minijuego', icono: '🎮', cat: 'Minijuegos', recompensa: 10, tipo: 'hito', evento: 'minigameComplete' },
        { id: 'trivia_experto', nombre: 'Culto viajero', desc: 'Responde 5/5 en una trivia', icono: '🧠', cat: 'Minijuegos', recompensa: 20, tipo: 'stat', stat: 'maxTriviaScore', objetivo: 5 },
        { id: 'memorice_perfecto', nombre: 'Memoria de elefante', desc: 'Completa memorice sin fallar', icono: '🐘', cat: 'Minijuegos', recompensa: 20, tipo: 'hito', evento: 'memoricePerfect' },

        // ===== ESPECIALES =====
        { id: 'primer_bonus', nombre: 'Tocado por el oro', desc: 'Haz tu primer match bonus ✨', icono: '✨', cat: 'Especiales', recompensa: 5, tipo: 'hito', evento: 'bonusMatch' },
        { id: 'cien_matches', nombre: 'Centurión', desc: 'Haz 100 matches en total', icono: '💯', cat: 'Especiales', recompensa: 25, tipo: 'stat', stat: 'totalMatches', objetivo: 100 },
        { id: 'mil_matches', nombre: 'Maestro del match', desc: 'Haz 1000 matches en total', icono: '🏆', cat: 'Especiales', recompensa: 100, tipo: 'stat', stat: 'totalMatches', objetivo: 1000 },
        { id: 'diff_sin_powerups', nombre: 'Puro estilo', desc: 'Completa un nivel difícil sin power-ups', icono: '💪', cat: 'Especiales', recompensa: 30, tipo: 'hito', evento: 'levelHardNoPowerups' },
        { id: 'streak_7', nombre: 'Semana consagrada', desc: 'Mantén una racha de 7 días', icono: '🔥', cat: 'Especiales', recompensa: 50, tipo: 'stat', stat: 'maxStreak', objetivo: 7 }
    ];

    // ===== Persistencia =====
    function loadState() {
        var raw = localStorage.getItem('logros_state');
        if (!raw) return { stats: {}, desbloqueados: {}, totalMonedasGanadas: 0 };
        try { return JSON.parse(raw); } catch (e) { return { stats: {}, desbloqueados: {}, totalMonedasGanadas: 0 }; }
    }
    function saveState(state) {
        localStorage.setItem('logros_state', JSON.stringify(state));
    }

    // ===== Stats =====
    function getStat(name) {
        var state = loadState();
        return state.stats[name] || 0;
    }
    function setStat(name, value) {
        var state = loadState();
        state.stats[name] = value;
        saveState(state);
        return evaluarLogros();
    }
    function incrementStat(name, delta) {
        var state = loadState();
        state.stats[name] = (state.stats[name] || 0) + (delta || 1);
        saveState(state);
        return evaluarLogros();
    }
    function setMaxStat(name, value) {
        var state = loadState();
        var current = state.stats[name] || 0;
        if (value > current) state.stats[name] = value;
        saveState(state);
        return evaluarLogros();
    }

    // ===== Eventos (hito) =====
    function registrarEvento(eventoNombre) {
        var state = loadState();
        // Marcar eventos recibidos (para logros tipo hito).
        state.stats['evt_' + eventoNombre] = 1;
        saveState(state);
        return evaluarLogros();
    }

    // ===== Evaluacion de logros =====
    // Recorre todos los logros y desbloquea los que se cumplan.
    // Retorna la lista de logros recien desbloqueados.
    function evaluarLogros() {
        var state = loadState();
        var recienDesbloqueados = [];
        LOGROS.forEach(function(logro) {
            if (state.desbloqueados[logro.id]) return;  // ya desbloqueado
            var cumplido = false;
            if (logro.tipo === 'hito') {
                cumplido = !!state.stats['evt_' + logro.evento];
            } else if (logro.tipo === 'stat') {
                var val = state.stats[logro.stat] || 0;
                cumplido = (val >= logro.objetivo);
            }
            if (cumplido) {
                state.desbloqueados[logro.id] = true;
                recienDesbloqueados.push(logro);
            }
        });
        if (recienDesbloqueados.length > 0) {
            var totalRecompensa = recienDesbloqueados.reduce(function(s, l) { return s + l.recompensa; }, 0);
            state.totalMonedasGanadas += totalRecompensa;
            saveState(state);
        }
        return recienDesbloqueados;
    }

    // ===== Informacion para la UI =====
    function obtenerTodos() {
        var state = loadState();
        return LOGROS.map(function(l) {
            var desbloqueado = !!state.desbloqueados[l.id];
            var progreso = 0;
            var objetivo = l.objetivo || 1;
            if (l.tipo === 'stat') {
                progreso = Math.min(objetivo, state.stats[l.stat] || 0);
            } else {
                progreso = desbloqueado ? 1 : 0;
            }
            return {
                id: l.id, nombre: l.nombre, desc: l.desc, icono: l.icono,
                cat: l.cat, recompensa: l.recompensa, tipo: l.tipo,
                desbloqueado: desbloqueado, progreso: progreso, objetivo: objetivo
            };
        });
    }
    function obtenerResumen() {
        var state = loadState();
        var total = LOGROS.length;
        var desbloqueados = Object.keys(state.desbloqueados).filter(function(k) { return state.desbloqueados[k]; }).length;
        return { desbloqueados: desbloqueados, total: total, pct: total > 0 ? Math.round(desbloqueados / total * 100) : 0 };
    }

    // ===== Render del panel de logros =====
    function renderPanel() {
        var logros = obtenerTodos();
        var resumen = obtenerResumen();
        var cats = {};
        logros.forEach(function(l) {
            if (!cats[l.cat]) cats[l.cat] = [];
            cats[l.cat].push(l);
        });
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:#0b1512;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">';
        html += '<button onclick="UI.showWorldMain()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button>';
        html += '<span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">🏆 Logros</span>';
        html += '<span style="margin-left:auto;color:rgba(242,202,80,0.8);font-size:0.9em;">' + resumen.desbloqueados + '/' + resumen.total + '</span>';
        html += '</div>';
        // Barra de progreso global
        html += '<div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;margin-bottom:20px;">';
        html += '<div style="height:100%;width:' + resumen.pct + '%;background:linear-gradient(to right,#f2ca50,#ff9f43);border-radius:3px;transition:width 0.6s;"></div>';
        html += '</div>';
        // Logros por categoria
        Object.keys(cats).forEach(function(cat) {
            html += '<div style="margin-bottom:20px;">';
            html += '<h3 style="color:rgba(242,202,80,0.7);font-size:0.8em;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">' + cat + '</h3>';
            cats[cat].forEach(function(l) {
                var pct = l.objetivo > 0 ? Math.round(l.progreso / l.objetivo * 100) : 0;
                html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.04);border-radius:12px;margin-bottom:8px;border:1px solid ' + (l.desbloqueado ? 'rgba(242,202,80,0.4)' : 'rgba(255,255,255,0.05)') + ';"' + (l.desbloqueado ? '' : ' style="opacity:0.85;"') + '>';
                html += '<div style="font-size:1.8em;' + (l.desbloqueado ? '' : 'filter:grayscale(1);opacity:0.5;') + '">' + l.icono + '</div>';
                html += '<div style="flex:1;">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
                html += '<span style="color:' + (l.desbloqueado ? '#f2ca50' : 'white') + ';font-weight:bold;font-size:0.9em;">' + l.nombre + (l.desbloqueado ? ' ✓' : '') + '</span>';
                html += '<span style="color:#4ade80;font-size:0.75em;font-weight:bold;">+' + l.recompensa + ' 🪙</span>';
                html += '</div>';
                html += '<p style="color:rgba(255,255,255,0.6);font-size:0.75em;margin-bottom:6px;">' + l.desc + '</p>';
                if (!l.desbloqueado && l.tipo === 'stat') {
                    html += '<div style="display:flex;align-items:center;gap:8px;">';
                    html += '<div style="flex:1;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">';
                    html += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(to right,#f2ca50,#ff9f43);border-radius:2px;"></div>';
                    html += '</div>';
                    html += '<span style="color:rgba(255,255,255,0.5);font-size:0.7em;">' + l.progreso + '/' + l.objetivo + '</span>';
                    html += '</div>';
                }
                html += '</div></div>';
            });
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    // ===== Limpieza para tests =====
    function reset() {
        localStorage.removeItem('logros_state');
    }

    return Object.freeze({
        LOGROS: LOGROS,
        getStat: getStat,
        setStat: setStat,
        incrementStat: incrementStat,
        setMaxStat: setMaxStat,
        registrarEvento: registrarEvento,
        evaluarLogros: evaluarLogros,
        obtenerTodos: obtenerTodos,
        obtenerResumen: obtenerResumen,
        renderPanel: renderPanel,
        reset: reset
    });
})();
