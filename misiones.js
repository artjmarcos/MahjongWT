// ========== SISTEMA DE MISIONES DIARIAS + STREAK ==========
// FASE 2 - Engagement y retencion
var Misiones = (function() {
    // [FASE 2] Pool de misiones posibles. Cada dia se eligen 3 al azar.
    var MISIONES_POOL = [
        { id: 'comp_2_niveles',   desc: 'Completa 2 niveles',              icono: '🎯', objetivo: 2, tipo: 'levelComplete' },
        { id: 'comp_5_bonus',     desc: 'Haz 5 matches bonus ✨',           icono: '✨', objetivo: 5, tipo: 'bonusMatch' },
        { id: 'combo_x3',         desc: 'Haz un combo x3',                 icono: '🔥', objetivo: 1, tipo: 'comboX3' },
        { id: 'minijuego',        desc: 'Completa 1 minijuego',            icono: '🎮', objetivo: 1, tipo: 'minigameComplete' },
        { id: 'sin_powerups',     desc: 'Completa 1 nivel sin power-ups',  icono: '💪', objetivo: 1, tipo: 'levelNoPowerups' },
        { id: 'dificil',          desc: 'Completa 1 nivel en Difícil',     icono: '🔥', objetivo: 1, tipo: 'levelHard' },
        { id: 'matches_10',       desc: 'Haz 10 matches en total',         icono: '⚡', objetivo: 10, tipo: 'matchCount' },
        { id: 'combo_x4',         desc: 'Haz un combo x4',                 icono: '🚀', objetivo: 1, tipo: 'comboX4' },
        { id: 'monedas_50',       desc: 'Gana 50 monedas',                 icono: '💰', objetivo: 50, tipo: 'coinsEarned' },
        { id: 'sin_deshacer',     desc: 'Completa 1 nivel sin ↩️',          icono: '🚫', objetivo: 1, tipo: 'levelNoUndo' }
    ];

    var RECOMPENSA_INDIVIDUAL = 10;  // monedas por mision
    var RECOMPENSA_TRIPLE = 25;      // bonus por completar las 3

    // [FASE 2] Bonus por hitos de racha diaria.
    var STREAK_BONUSES = [
        { dias: 3,  monedas: 20,  msg: '¡3 días seguidos! +20 monedas' },
        { dias: 7,  monedas: 50,  msg: '¡Una semana! +50 monedas 🔥' },
        { dias: 14, monedas: 100, msg: '¡2 semanas! +100 monedas 🔥🔥' },
        { dias: 30, monedas: 500, msg: '¡UN MES! +500 monedas 🏆' }
    ];

    // ===== Persistencia =====
    function hoy() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function ayer() {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function loadState() {
        var raw = localStorage.getItem('misiones_state');
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }
    function saveState(state) {
        localStorage.setItem('misiones_state', JSON.stringify(state));
    }
    function loadStreak() {
        var raw = localStorage.getItem('streak_state');
        if (!raw) return { count: 0, lastDay: null, claimed: {} };
        try { return JSON.parse(raw); } catch (e) { return { count: 0, lastDay: null, claimed: {} }; }
    }
    function saveStreak(s) {
        localStorage.setItem('streak_state', JSON.stringify(s));
    }

    // Genera 3 misiones para hoy usando la fecha como seed (deterministico)
    function seedRandom(seed) {
        var x = 0;
        for (var i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0;
        return function() {
            x = (x * 1103515245 + 12345) & 0x7fffffff;
            return x / 0x7fffffff;
        };
    }
    function generarMisionesDeHoy() {
        var rng = seedRandom(hoy());
        var pool = MISIONES_POOL.slice();
        // Fisher-Yates con el rng sembrado
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1));
            var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
        }
        return pool.slice(0, 3).map(function(m) {
            return { id: m.id, desc: m.desc, icono: m.icono, objetivo: m.objetivo, tipo: m.tipo, progreso: 0, completada: false, reclamoPendiente: true };
        });
    }

    // ===== Estado de misiones =====
    function obtenerEstado() {
        var state = loadState();
        var h = hoy();
        if (!state || state.fecha !== h) {
            // Nuevo dia: generar nuevas misiones y resetear progreso
            state = { fecha: h, misiones: generarMisionesDeHoy() };
            saveState(state);
        }
        return state;
    }

    // ===== Streak =====
    function obtenerStreak() {
        var s = loadStreak();
        var h = hoy();
        // Si ya registro hoy, no hacer nada
        if (s.lastDay === h) return s;
        // Si ultimo registro fue ayer, incrementar
        if (s.lastDay === ayer()) {
            s.count++;
        } else if (s.lastDay !== h) {
            // Roto (o primer uso)
            s.count = 1;
        }
        s.lastDay = h;
        saveStreak(s);
        return s;
    }
    function registrarActividad() {
        // Llama a obtenerStreak para actualizar la racha si es un nuevo dia.
        var s = obtenerStreak();
        return s;
    }
    function obtenerBonusPendientes() {
        var s = loadStreak();
        var pendientes = [];
        STREAK_BONUSES.forEach(function(b) {
            if (s.count >= b.dias && !s.claimed['d' + b.dias]) {
                pendientes.push(b);
            }
        });
        return pendientes;
    }
    function reclamarBonus(dias) {
        var s = loadStreak();
        if (s.count >= dias && !s.claimed['d' + dias]) {
            s.claimed['d' + dias] = true;
            saveStreak(s);
            var b = STREAK_BONUSES.find(function(x) { return x.dias === dias; });
            return b;
        }
        return null;
    }

    // ===== Tracking de eventos =====
    // Llamado por la UI cuando ocurre un evento relevante.
    // Retorna la lista de misiones que se completaron en este evento (para mostrar toast).
    function registrarEvento(tipo, valor) {
        var state = obtenerEstado();
        var recienCompletadas = [];
        valor = valor || 1;
        state.misiones.forEach(function(m) {
            if (m.completada) return;
            if (m.tipo !== tipo) return;
            // Para eventos de conteo (matches, monedas), sumar valor.
            // Para eventos de hito (combo x3, levelHard, etc), solo marcar si se alcanza el objetivo.
            if (tipo === 'comboX3' || tipo === 'comboX4' || tipo === 'levelComplete' ||
                tipo === 'levelNoPowerups' || tipo === 'levelHard' || tipo === 'levelNoUndo' ||
                tipo === 'minigameComplete') {
                // Eventos binarios/hito: progreso = objetivo al recibir el evento
                if (valor >= m.objetivo) {
                    m.progreso = m.objetivo;
                } else {
                    m.progreso = Math.max(m.progreso, valor);
                }
            } else {
                // Eventos acumulativos (matchCount, coinsEarned, bonusMatch)
                m.progreso = Math.min(m.objetivo, m.progreso + valor);
            }
            if (!m.completada && m.progreso >= m.objetivo) {
                m.completada = true;
                recienCompletadas.push(m);
            }
        });
        saveState(state);
        return recienCompletadas;
    }

    // Reclama las recompensas de misiones completadas no reclamadas.
    // Retorna { monedasIndividuales, todasCompletadas, bonusTriple }
    function reclamarPendientes() {
        var state = obtenerEstado();
        var monedas = 0;
        var completadasSinReclamar = 0;
        state.misiones.forEach(function(m) {
            if (m.completada && m.reclamoPendiente) {
                monedas += RECOMPENSA_INDIVIDUAL;
                m.reclamoPendiente = false;
                completadasSinReclamar++;
            }
        });
        var todasCompletas = state.misiones.every(function(m) { return m.completada; });
        var bonus = 0;
        if (todasCompletas && completadasSinReclamar > 0 && !state.bonusTripleReclamado) {
            bonus = RECOMPENSA_TRIPLE;
            state.bonusTripleReclamado = true;
        }
        saveState(state);
        return { monedas: monedas, bonus: bonus, total: monedas + bonus, completadas: completadasSinReclamar, todasCompletas: todasCompletas };
    }

    // Render del panel de misiones para el menu principal.
    // Retorna HTML string.
    function renderPanel() {
        var state = obtenerEstado();
        var s = obtenerStreak();
        var html = '<div style="margin-bottom:16px;background:rgba(23,34,30,0.6);border-radius:16px;padding:16px;border:1px solid rgba(242,202,80,0.2);">';
        // Header con streak
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
        html += '<span style="color:#f2ca50;font-weight:bold;font-size:1em;">📋 Misiones del día</span>';
        html += '<span style="color:#ff9f43;font-weight:bold;font-size:0.85em;">🔥 ' + s.count + ' día' + (s.count !== 1 ? 's' : '') + '</span>';
        html += '</div>';
        // Lista de misiones
        state.misiones.forEach(function(m) {
            var pct = Math.min(100, Math.round((m.progreso / m.objetivo) * 100));
            var done = m.completada;
            html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;' + (done ? 'opacity:0.6;' : '') + '">';
            html += '<span style="font-size:1.3em;">' + m.icono + '</span>';
            html += '<div style="flex:1;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
            html += '<span style="color:' + (done ? '#4ade80' : 'white') + ';font-size:0.8em;font-weight:bold;">' + m.desc + (done ? ' ✓' : '') + '</span>';
            html += '<span style="color:rgba(255,255,255,0.5);font-size:0.7em;">' + Math.min(m.progreso, m.objetivo) + '/' + m.objetivo + '</span>';
            html += '</div>';
            // Barra de progreso
            html += '<div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;">';
            html += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(to right,' + (done ? '#4ade80,#22c55e' : '#f2ca50,#ff9f43') + ');border-radius:2px;transition:width 0.4s;"></div>';
            html += '</div></div></div>';
        });
        // Boton reclamar (si hay algo pendiente)
        var hayPendiente = state.misiones.some(function(m) { return m.completada && m.reclamoPendiente; });
        if (hayPendiente) {
            html += '<button onclick="UI.reclamarMisiones()" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:linear-gradient(180deg,#4ade80 0%,#22c55e 100%);color:#052e16;font-weight:bold;border:none;cursor:pointer;font-size:0.9em;">🎁 Reclamar recompensas</button>';
        }
        html += '</div>';
        return html;
    }

    // Verifica bonus de streak pendientes y retorna el primero (si hay).
    function verificarBonusStreak() {
        var pendientes = obtenerBonusPendientes();
        return pendientes.length > 0 ? pendientes[0] : null;
    }

    // Limpia el estado (para tests / debug).
    function reset() {
        localStorage.removeItem('misiones_state');
        localStorage.removeItem('streak_state');
    }

    return Object.freeze({
        obtenerEstado: obtenerEstado,
        obtenerStreak: obtenerStreak,
        registrarActividad: registrarActividad,
        registrarEvento: registrarEvento,
        reclamarPendientes: reclamarPendientes,
        reclamarBonus: reclamarBonus,
        obtenerBonusPendientes: obtenerBonusPendientes,
        verificarBonusStreak: verificarBonusStreak,
        renderPanel: renderPanel,
        RECOMPENSA_INDIVIDUAL: RECOMPENSA_INDIVIDUAL,
        RECOMPENSA_TRIPLE: RECOMPENSA_TRIPLE,
        STREAK_BONUSES: STREAK_BONUSES,
        reset: reset
    });
})();
