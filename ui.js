// ========== INTERFAZ DE USUARIO (UI) ==========
var UI = (function() {
    var currentZone = null, currentLevel = null, coins = parseInt(localStorage.getItem('coins') || '0');
    var tutorialActive = false, tutorialStep = 0, tutorialZoneId = null;
    var rewardCallback = null, adCount = 0;
    var AD_EVERY = 3;  // [FASE 5] Interstitial cada 3 niveles (era 5).
    // [FASE 2] Tracking de eventos para misiones.
    var gameStats = { usedPowerUps: false, usedUndo: false, currentDifficulty: 'normal' };
    // [FASE 5] Stars ganadas en la ultima victoria (para el boton de doble recompensa).
    var lastVictoryStars = 0;
    var memoricePhotos = [], memoriceCards = [], memoriceFlipped = [], memoriceMatched = 0, memoriceLocked = false;
    // [FIX BUG #7] Flag para evitar doble disparo click+touchend.
    var lastTapTime = 0;
    // [FIX BUG #3] Bandera para no mostrar zoom si el match es el final.
    var pendingVictory = false;
    // [FEATURE #3] Indices de pareja hint actual para resalte visual.
    var hintIdxA = null, hintIdxB = null, hintTimer = null;
    // [FEATURE #1] Bandera para mostrar aviso de auto-shuffle solo una vez por evento.
    var autoShuffleNoticeTimer = null;
    // [FASE 1] Haptic feedback toggle (default ON, persistente).
    var hapticEnabled = localStorage.getItem('hapticEnabled') !== '0';
    // [FASE 1] Combo display element (se crea al iniciar juego).
    var comboDisplay = null, comboHideTimer = null;
    // [FASE 1] Screen shake element (el boardContainer).
    var shakeTimer = null;

    function getStars(z, n) { return parseInt(localStorage.getItem('zone_' + z + '_level_' + n) || '0'); }
    function setStars(z, n, s) { localStorage.setItem('zone_' + z + '_level_' + n, s); }
    function isUnlocked(z, n) { return n === 1 || getStars(z, n - 1) >= 1; }
    function addCoins(amount) { coins += amount; localStorage.setItem('coins', coins); }
    function getTotalStarsForCountry(country) {
        return ZONES.filter(function(z) { return z.country === country; }).reduce(function(s, z) {
            return s + z.levels.reduce(function(ss, l) { return ss + getStars(z.id, l.num); }, 0);
        }, 0);
    }

    GameEngine.setOnStateChange(function(event, data) {
        if (event === 'boardChanged') renderBoard();
        else if (event === 'match') {
            // [FASE 1] Efectos visuales y hapticos del match.
            // Calcular posicion del centro del tablero para particulas y puntos.
            var bc = document.getElementById('boardContainer');
            var rect = bc ? bc.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var combo = data.combo || 1;
            // 1. Combo display flotante (solo si combo >= 2).
            showComboDisplay(combo, data.isBonus);
            // 2. Particulas de match.
            spawnMatchParticles(cx, cy, combo, data.isBonus);
            // 3. Texto flotante de puntos.
            spawnFloatingPoints(data.points, cx, cy - 30, data.isBonus);
            // 4. Screen shake en combos x3+ o bonus.
            if (combo >= 3 || data.isBonus) screenShake(data.isBonus ? 6 : combo);
            // 5. Haptic: corto en match normal, patron especial en bonus, fuerte en combo x4+.
            if (data.isBonus) haptic([30, 40, 30, 40, 60]);
            else if (combo >= 4) haptic([40, 30, 40]);
            else if (combo >= 2) haptic(30);
            else haptic(15);
            // [FASE 2] Tracking de eventos para misiones.
            var completadas = [];
            completadas = completadas.concat(Misiones.registrarEvento('matchCount', 1));
            if (data.isBonus) completadas = completadas.concat(Misiones.registrarEvento('bonusMatch', 1));
            if (combo >= 3) completadas = completadas.concat(Misiones.registrarEvento('comboX3', 1));
            if (combo >= 4) completadas = completadas.concat(Misiones.registrarEvento('comboX4', 1));
            // Monedas ganadas por match: estimar (100 + combo*50) * (bonus ? 2 : 1).
            var coinsFromMatch = (100 + combo * 50) * (data.isBonus ? 2 : 1);
            completadas = completadas.concat(Misiones.registrarEvento('coinsEarned', coinsFromMatch));
            mostrarMisionesCompletadas(completadas);
            // [FASE 4] Tracking de logros.
            var logrosDesbloq = [];
            logrosDesbloq = logrosDesbloq.concat(Logros.incrementStat('totalMatches', 1));
            logrosDesbloq = logrosDesbloq.concat(Logros.setMaxStat('maxCombo', combo));
            if (data.isBonus) logrosDesbloq = logrosDesbloq.concat(Logros.registrarEvento('bonusMatch'));
            mostrarLogrosDesbloqueados(logrosDesbloq);
            // [FIX BUG #3] No mostrar zoom si este match completo el tablero (la victoria va a mostrar el modal).
            // [FIX NOTAS] Buscar la foto original por nombre+zone (la URL cambia por sz=w400 vs sz=w600).
            // Si no se encuentra, usar data.a que ahora SI incluye nota.
            if (!data.isFinalMatch && data.a.url && data.b.url && data.a.zone === currentZone.id) {
                var photo = currentZone.photos.find(function(p) { return p.name === data.a.name && p.zone === data.a.zone; }) || data.a;
                showZoomAndNote(photo);
            }
            updateSlotsUI();
        }
        else if (event === 'slotsfull') showMessage('Slots llenos: usa ↩️ Deshacer o 🔀 Mezclar');  // [FIX BUG #6]
        else if (event === 'timer') { var el = document.getElementById('timerDisplay'); if (el) el.textContent = data.timeLeft + 's'; }
        else if (event === 'timeout') { showMessage(I18n.t('msg.tiempo')); setTimeout(function() { showZone(currentZone.id); }, 1500); }
        else if (event === 'victory') {
            var stars = data.score >= 2000 ? 3 : data.score >= 1000 ? 2 : 1;
            setStars(currentZone.id, currentLevel.num, stars);
            addCoins(stars);
            // [FASE 5] Guardar stars para el boton de doble recompensa.
            lastVictoryStars = stars;
            var drStars = document.getElementById('dobleRecompensaStars');
            if (drStars) drStars.textContent = stars;
            // Mostrar/ocultar el boton segun si ya se reclamo.
            var drBtn = document.getElementById('dobleRecompensaBtn');
            if (drBtn) { drBtn.style.display = ''; drBtn.disabled = false; drBtn.style.opacity = '1'; }
            document.getElementById('victoryIcon').textContent = '🏆';
            var vt = document.getElementById('victoryTitle'); if (vt) vt.textContent = I18n.t('victoria.titulo');
            var vdr = document.getElementById('dobleRecompensaLabel'); if (vdr) vdr.textContent = I18n.t('victoria.doble');
            var vbs = document.getElementById('btnSiguienteNivel'); if (vbs) vbs.textContent = I18n.t('victoria.siguiente');
            var vbv = document.getElementById('btnVolver'); if (vbv) vbv.textContent = I18n.t('victoria.volver');
            document.getElementById('victoryName').textContent = currentZone.name + ' · ' + I18n.t('game.nivel') + ' ' + currentLevel.num;
            document.getElementById('starsDisplay').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
            // [FIX BUG #3] Forzar z-index alto para asegurar visibilidad encima de cualquier overlay residual.
            var vm = document.getElementById('victoryModal');
            vm.style.zIndex = '500';
            vm.style.display = 'flex';
            spawnVictoryParticles();
            adCount++;
            if (adCount >= AD_EVERY) { adCount = 0; showInterstitialAd(); }
            // [FASE 2] Tracking de eventos para misiones - levelComplete y variantes.
            var lvlCompletadas = [];
            lvlCompletadas = lvlCompletadas.concat(Misiones.registrarEvento('levelComplete', 1));
            if (!gameStats.usedPowerUps) lvlCompletadas = lvlCompletadas.concat(Misiones.registrarEvento('levelNoPowerups', 1));
            if (!gameStats.usedUndo) lvlCompletadas = lvlCompletadas.concat(Misiones.registrarEvento('levelNoUndo', 1));
            if (gameStats.currentDifficulty === 'dificil') lvlCompletadas = lvlCompletadas.concat(Misiones.registrarEvento('levelHard', 1));
            // Monedas ganadas por victoria (stars).
            lvlCompletadas = lvlCompletadas.concat(Misiones.registrarEvento('coinsEarned', stars));
            mostrarMisionesCompletadas(lvlCompletadas);
            // [FASE 4] Tracking de logros: levelComplete, 3 estrellas, etc.
            var lvlLogros = [];
            lvlLogros = lvlLogros.concat(Logros.registrarEvento('levelComplete'));
            if (stars === 3) lvlLogros = lvlLogros.concat(Logros.incrementStat('levels3Stars', 1));
            // Dificil sin power-ups.
            if (gameStats.currentDifficulty === 'dificil' && !gameStats.usedPowerUps) {
                lvlLogros = lvlLogros.concat(Logros.registrarEvento('levelHardNoPowerups'));
            }
            // Actualizar stats de estrellas por pais y total.
            lvlLogros = lvlLogros.concat(actualizarStatsEstrellas());
            mostrarLogrosDesbloqueados(lvlLogros);
            // [FASE 2] Registrar actividad para el streak diario.
            Misiones.registrarActividad();
            // [FASE 4] Actualizar stat de maxStreak para logros.
            var sActual = Misiones.obtenerStreak();
            Logros.setMaxStat('maxStreak', sActual.count);
            // [FASE 2] Verificar bonus de streak pendientes (lo muestra al cerrar el modal de victoria).
            setTimeout(verificarBonusStreakPendiente, 500);
        }
        else if (event === 'hint') {
            // [FEATURE #3] Si el hint trae indices, resaltar visualmente la pareja.
            if (data && typeof data.idxA === 'number' && typeof data.idxB === 'number') {
                showHintHighlight(data.idxA, data.idxB, data.name);
            } else if (data && data.noPair) {
                // [FEATURE #1] Si no habia pareja libre, se hizo auto-shuffle.
                showMessage('🔀 Tablero mezclado automaticamente');
            } else {
                showMessage('Busca: ' + (data ? data.name : ''));
            }
        }
        else if (event === 'autoshuffle') {
            // [FEATURE #1] Tablero estaba insoluble y se mezclo automaticamente (sin costo).
            renderBoard();
            if (autoShuffleNoticeTimer) clearTimeout(autoShuffleNoticeTimer);
            showMessage('🔀 Sin movimientos · tablero mezclado');
            autoShuffleNoticeTimer = setTimeout(function() {}, 2000);
        }
    });

    // [FASE 1] Haptic feedback: vibracion del dispositivo. Respeta toggle del usuario.
    function haptic(pattern) {
        if (!hapticEnabled) return;
        if (navigator.vibrate) {
            try { navigator.vibrate(pattern); } catch (e) {}
        }
    }
    function setHaptic(enabled) {
        hapticEnabled = !!enabled;
        localStorage.setItem('hapticEnabled', hapticEnabled ? '1' : '0');
        var btn = document.getElementById('hapticToggleBtn');
        if (btn) {
            btn.textContent = hapticEnabled ? '📳' : '📴';
            btn.style.opacity = hapticEnabled ? '1' : '0.5';
        }
        if (hapticEnabled) haptic(20);
    }
    function toggleHaptic() { setHaptic(!hapticEnabled); }

    // [FASE 5] Toggle de musica ambiental.
    function toggleMusica() {
        var on = Musica.toggle();
        var btn = document.getElementById('musicaToggleBtn');
        if (btn) {
            btn.textContent = on ? '🔊' : '🔇';
            btn.style.opacity = on ? '1' : '0.5';
            btn.title = 'Musica: ' + (on ? 'ON' : 'OFF');
        }
        if (on) {
            // Reanudar con la pista correspondiente a la pantalla actual.
            var paisActual = inferirPaisPantallaActual();
            Musica.play(paisActual);
            haptic(20);
        } else {
            Musica.stop();
            haptic(15);
        }
    }

    // [FASE 5] Detecta que pais corresponde a la pantalla actual para elegir la musica.
    function inferirPaisPantallaActual() {
        if (currentZone && currentZone.country) return currentZone.country;
        return 'menu';
    }

    // [FASE 6] Aplica el tema de color segun el pais. Transicion suave de 1s.
    var bgParticlesTimer = null;
    function applyTheme(country) {
        var container = document.getElementById('appRoot');
        if (!container) return;
        // Quitar clases theme-* anteriores (sin tocar app-container).
        var themes = ['theme-menu', 'theme-chile', 'theme-argentina', 'theme-mexico', 'theme-brasil'];
        themes.forEach(function(t) { container.classList.remove(t); });
        container.classList.add('theme-' + (country || 'menu'));
        // Reiniciar particulas de fondo.
        spawnBgParticles(country);
    }

    // [FASE 6] Genera particulas decorativas de fondo segun el pais.
    function spawnBgParticles(country) {
        if (bgParticlesTimer) clearInterval(bgParticlesTimer);
        var container = document.getElementById('bgParticlesContainer');
        if (!container) return;
        container.innerHTML = '';
        var colors = {
            menu: ['#f2ca50', '#ffd700'],
            chile: ['#ffffff', '#b8e0ec', '#5fa8c9'],
            argentina: ['#f0b070', '#ffd700', '#ff9f43'],
            mexico: ['#f9c74f', '#ff6b9d', '#e85d4e'],
            brasil: ['#7fd957', '#ffd700', '#4ade80']
        };
        var palette = colors[country] || colors.menu;
        bgParticlesTimer = setInterval(function() {
            if (document.hidden) return;
            var p = document.createElement('div');
            p.className = 'bg-particle';
            var size = 3 + Math.random() * 5;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.bottom = '-10px';
            p.style.background = palette[Math.floor(Math.random() * palette.length)];
            p.style.boxShadow = '0 0 8px ' + palette[0];
            p.style.animationDuration = (6 + Math.random() * 4) + 's';
            p.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(p);
            setTimeout(function() { if (p.parentNode) p.remove(); }, 12000);
        }, 800);
    }

    // [FASE 6] Flag para saber si es el primer render del tablero (con stagger) o un re-render (instantaneo).
    var boardFirstRender = true;

    // [FASE 6] Voltea visualmente una ficha boca abajo con animacion 3D flip.
    function flipTileVisual(el, t) {
        if (!el) return;
        // Aplicar animacion de volteo.
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'flipReveal 0.5s ease-in-out';
        // A mitad de la animacion (cuando la ficha esta "de canto"), actualizar el contenido.
        setTimeout(function() {
            // Reconstruir el contenido como en renderBoard.
            if (t.type === 'photo') {
                el.style.background = '';
                el.style.backgroundImage = 'url(' + t.url + ')';
                el.style.backgroundSize = 'cover';
                el.innerHTML = '';
            } else {
                el.style.background = 'linear-gradient(180deg, #fff8e8 0%, #f5ecd5 50%, #e8d8b0 100%)';
                var symbolColor = t.color || '#2a1a0a';
                el.innerHTML = '<div class="symbol-text" style="color:' + symbolColor + ';">' + t.symbol + '</div>';
            }
            // Agregar el nombre (ahora que esta revelada).
            var nm = document.createElement('div'); nm.className = 'card-name';
            nm.textContent = t.name || t.symbol;
            el.appendChild(nm);
            // Asegurar que tenga la clase correcta (free o blocked).
            if (t.blocked) { el.classList.remove('free'); el.classList.add('blocked'); }
            else { el.classList.remove('blocked'); el.classList.add('free'); }
        }, 250);  // mitad de 0.5s
        // Quitar la animacion al terminar.
        setTimeout(function() { el.style.animation = ''; }, 550);
    }

    // [FASE 1] Muestra el combo flotante sobre el tablero.
    function showComboDisplay(combo, isBonus) {
        if (!comboDisplay) {
            comboDisplay = document.createElement('div');
            comboDisplay.id = 'comboDisplay';
            comboDisplay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;pointer-events:none;font-weight:bold;text-align:center;opacity:0;';
            var bc = document.getElementById('boardContainer');
            if (bc) bc.appendChild(comboDisplay);
            else { comboDisplay.style.position = 'fixed'; document.body.appendChild(comboDisplay); }
        }
        if (combo < 2) { hideComboDisplay(); return; }
        var colors = ['#f2ca50', '#ff9f43', '#ff6b6b', '#ff4757'];
        var colorIdx = Math.min(combo - 2, colors.length - 1);
        var color = colors[colorIdx];
        var size = 1.5 + Math.min(combo - 1, 6) * 0.2;
        var bonusTxt = isBonus ? ' ✨BONUS✨ ' : '';
        comboDisplay.innerHTML = '<div style="font-size:' + size + 'em;color:' + color + ';text-shadow:0 0 20px ' + color + ',0 2px 4px rgba(0,0,0,0.8);">' + bonusTxt + 'COMBO x' + combo + '</div>';
        comboDisplay.style.animation = 'none';
        // Forzar reflow para reiniciar la animacion.
        void comboDisplay.offsetWidth;
        comboDisplay.style.animation = 'comboPop 0.9s ease-out forwards';
        if (comboHideTimer) clearTimeout(comboHideTimer);
        comboHideTimer = setTimeout(hideComboDisplay, 1000);
    }
    function hideComboDisplay() {
        if (comboDisplay) comboDisplay.style.opacity = '0';
        if (comboHideTimer) { clearTimeout(comboHideTimer); comboHideTimer = null; }
    }

    // [FASE 1] Screen shake del boardContainer para combos x3+.
    function screenShake(intensity) {
        var bc = document.getElementById('boardContainer');
        if (!bc) return;
        if (shakeTimer) clearTimeout(shakeTimer);
        var i = Math.min(intensity || 4, 10);
        bc.style.animation = 'none';
        void bc.offsetWidth;
        bc.style.animation = 'shake' + i + ' 0.35s ease-in-out';
        shakeTimer = setTimeout(function() { bc.style.animation = ''; }, 400);
    }

    // [FASE 1] Texto flotante de puntos (+150) que sube desde la posicion del match.
    function spawnFloatingPoints(points, x, y, isBonus) {
        var el = document.createElement('div');
        el.className = 'floating-points' + (isBonus ? ' bonus' : '');
        el.textContent = (isBonus ? '✨ ' : '+') + points;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        document.body.appendChild(el);
        setTimeout(function() { if (el.parentNode) el.remove(); }, 1200);
    }

    // [FASE 1] Particulas de match mejoradas, color segun combo.
    function spawnMatchParticles(x, y, combo, isBonus) {
        var colors = ['#f2ca50', '#ffd700', '#ff9f43', '#ff6b6b'];
        var baseColor = isBonus ? '#ffd700' : colors[Math.min(combo - 1, colors.length - 1)];
        var count = isBonus ? 20 : Math.min(8 + combo * 2, 18);
        for (var i = 0; i < count; i++) {
            (function(idx) {
                setTimeout(function() {
                    var p = document.createElement('div');
                    p.className = 'particle';
                    p.style.position = 'fixed';
                    p.style.zIndex = '250';
                    p.style.left = x + 'px';
                    p.style.top = y + 'px';
                    p.style.width = '6px'; p.style.height = '6px';
                    p.style.borderRadius = '50%';
                    p.style.background = baseColor;
                    p.style.boxShadow = '0 0 8px ' + baseColor;
                    var angle = (idx / count) * Math.PI * 2;
                    var dist = 60 + Math.random() * 80;
                    p.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
                    p.style.setProperty('--ty', (Math.sin(angle) * dist) + 'px');
                    document.body.appendChild(p);
                    setTimeout(function() { if (p.parentNode) p.remove(); }, 900);
                }, idx * 15);
            })(i);
        }
    }
    function showHintHighlight(idxA, idxB, name) {
        hintIdxA = idxA; hintIdxB = idxB;
        showMessage('💡 Busca: ' + name);
        // Aplicar clase de resalte a las fichas visibles correspondientes.
        var tiles = GameEngine.getTiles();
        var els = document.querySelectorAll('.vita-tile');
        els.forEach(function(el) {
            var di = parseInt(el.getAttribute('data-index'));
            if (di === idxA || di === idxB) {
                el.classList.add('hint-highlight');
            }
        });
        // Auto-quitar el resalte tras 3.5 segundos o al siguiente click.
        if (hintTimer) clearTimeout(hintTimer);
        hintTimer = setTimeout(clearHintHighlight, 3500);
    }
    function clearHintHighlight() {
        hintIdxA = null; hintIdxB = null;
        var els = document.querySelectorAll('.vita-tile.hint-highlight');
        els.forEach(function(el) { el.classList.remove('hint-highlight'); });
        if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    }

    function renderBoard() {
        var c = document.getElementById('boardContainer');
        if (!c) return;
        var tiles = GameEngine.getTiles();
        var vt = tiles.filter(function(t) { return !t.matched && !t.inSlot; });
        if (vt.length === 0) { c.innerHTML = ''; return; }
        // [FASE 6] Auto-escalado: calcula el tamanio de ficha para que TODO quepa en pantalla.
        // El espacio disponible es el alto del boardContainer (que tiene flex:1).
        var w = c.clientWidth - 12, margin = 6;
        var maxRow = vt.length > 0 ? Math.max.apply(null, vt.map(function(t) { return t.row; })) : 0;
        var maxLayer = vt.length > 0 ? Math.max.apply(null, vt.map(function(t) { return t.layer; })) : 0;
        var COLS = 6;  // layout base siempre usa 6 columnas
        var layerOffset = 14;
        // Calcular alto y ancho necesarios con tamanio "ideal" de ficha.
        var availableH = c.clientHeight > 0 ? c.clientHeight : (window.innerHeight * 0.5);
        availableH -= 20;  // padding
        var neededRows = maxRow + 1;
        var neededLayers = maxLayer;
        // Calcular cw maximo para que el alto quepa: (neededRows * ch) + (neededLayers * layerOffset) + margins <= availableH
        // ch = cw * 1.45, despejando: cw <= (availableH - margins - layers*offset) / (neededRows * 1.45)
        var maxCwByHeight = (availableH - margin * 2 - neededLayers * layerOffset - 20) / (neededRows * 1.45);
        var maxCwByWidth = (w - margin * 2) / COLS;
        // Usar el menor de los dos para que quepa tanto en alto como en ancho.
        var cw = Math.min(maxCwByWidth, maxCwByHeight);
        // Limitar: no mas grande que el ideal por ancho, no mas chico que 28px (legible).
        cw = Math.max(28, Math.min(cw, maxCwByWidth));
        var ch = cw * 1.45;
        var nh = (maxRow + 1) * ch + margin * 2 + (maxLayer * layerOffset) + 20;
        // [FASE 6] No forzar minHeight mayor que el container: dejar que flex:1 controle el alto.
        c.style.minHeight = '0'; c.innerHTML = '';
        var inner = document.createElement('div');
        inner.style.cssText = 'position:relative;width:100%;display:flex;align-items:center;justify-content:center;height:' + nh + 'px;';
        var grid = document.createElement('div');
        grid.style.cssText = 'position:relative;width:' + (COLS * cw) + 'px;height:' + ((maxRow + 1) * ch + maxLayer * layerOffset) + 'px;';
        vt.forEach(function(t, vidx) {
            var el = document.createElement('div'); el.className = 'vita-tile';
            if (t.bonus) el.classList.add('bonus-tile');
            el.style.left = (t.col * cw + margin) + 'px';
            el.style.top = (t.row * ch + margin + t.layer * layerOffset) + 'px';
            el.style.width = (cw - 4) + 'px'; el.style.height = (ch - 4) + 'px';
            el.style.zIndex = t.layer * 100 + Math.floor(t.row * 2);
            // [FASE 6] Stagger SOLO en el primer render del tablero. En re-renders (tras match), sin delay = instantaneo.
            if (boardFirstRender) {
                el.style.animationDelay = Math.min(vidx * 0.02, 0.5) + 's';
            } else {
                el.style.animation = 'none';
            }
            var td = tiles.indexOf(t);
            var isSel = (GameEngine.getSelectedTileIdx() === td);
            el.setAttribute('data-index', td);
            el.setAttribute('data-pid', t.pid);
            if (t.faceDown && !t.revealed) {
                // [FASE 6] Ficha boca abajo: patron decorativo, SIN nombre.
                el.style.background = 'linear-gradient(145deg, #1a3a2a 0%, #0d2518 50%, #1a3a2a 100%)';
                el.innerHTML = '<div style="position:absolute;inset:6px;border:1.5px solid rgba(242,202,80,0.35);border-radius:8px;display:flex;align-items:center;justify-content:center;">' +
                    '<div style="font-size:1.8em;color:rgba(242,202,80,0.5);filter:drop-shadow(0 0 4px rgba(242,202,80,0.3));">🪭</div>' +
                    '</div>' +
                    '<div style="position:absolute;top:4px;left:4px;width:6px;height:6px;border-top:1.5px solid rgba(242,202,80,0.4);border-left:1.5px solid rgba(242,202,80,0.4);"></div>' +
                    '<div style="position:absolute;top:4px;right:4px;width:6px;height:6px;border-top:1.5px solid rgba(242,202,80,0.4);border-right:1.5px solid rgba(242,202,80,0.4);"></div>' +
                    '<div style="position:absolute;bottom:4px;left:4px;width:6px;height:6px;border-bottom:1.5px solid rgba(242,202,80,0.4);border-left:1.5px solid rgba(242,202,80,0.4);"></div>' +
                    '<div style="position:absolute;bottom:4px;right:4px;width:6px;height:6px;border-bottom:1.5px solid rgba(242,202,80,0.4);border-right:1.5px solid rgba(242,202,80,0.4);"></div>';
            } else if (t.type === 'photo') {
                el.style.backgroundImage = 'url(' + t.url + ')';
                el.style.backgroundSize = 'cover';
            } else {
                // [FASE 6] Ficha ceramica con simbolo colorido.
                el.style.background = 'linear-gradient(180deg, #fff8e8 0%, #f5ecd5 50%, #e8d8b0 100%)';
                var symbolColor = t.color || '#2a1a0a';
                el.innerHTML = '<div class="symbol-text" style="color:' + symbolColor + ';">' + t.symbol + '</div>';
            }
            // [FASE 6] Solo mostrar nombre si la ficha esta revelada (no boca abajo).
            if (!t.faceDown || t.revealed) {
                var nm = document.createElement('div'); nm.className = 'card-name';
                nm.textContent = t.name || t.symbol; el.appendChild(nm);
            }
            if (t.blocked) el.classList.add('blocked'); else el.classList.add('free');
            if (isSel) el.classList.add('selected-card');
            el.style.touchAction = 'manipulation';
            // [FIX BUG #7] Handler unificado con deduplicacion click+touchend.
            // [FASE 6] Verificacion explicita de bloqueo antes de llamar al motor.
            function handleTileTap(e) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                var now = Date.now();
                if (now - lastTapTime < 300) return;
                lastTapTime = now;
                clearHintHighlight();
                var idx = parseInt(el.getAttribute('data-index'));
                var allTiles = GameEngine.getTiles();
                if (idx < 0 || idx >= allTiles.length || allTiles[idx] !== t) return;
                // [FASE 6] Verificar bloqueo explicitamente: si esta bloqueada, feedback de error.
                if (t.blocked) {
                    haptic(20);
                    el.style.animation = 'none';
                    void el.offsetWidth;
                    el.style.animation = 'shakeBlocked 0.3s ease';
                    setTimeout(function() { el.style.animation = ''; }, 350);
                    showMessage('🔒 Ficha bloqueada');
                    return;
                }
                // [FASE 6] Si la ficha esta boca abajo, PRIMERO revelarla (no mandar al slot).
                // El segundo click (ya revelada) recien la manda al slot.
                if (t.faceDown && !t.revealed) {
                    t.revealed = true;
                    haptic(15);
                    GameEngine.playRevealSound();
                    // Animar el volteo y actualizar el contenido de la ficha.
                    flipTileVisual(el, t);
                    return;
                }
                GameEngine.onTileClick(idx);
                if (tutorialActive) advanceTutorial();
            }
            el.addEventListener('click', handleTileTap);
            el.addEventListener('touchend', handleTileTap);
            grid.appendChild(el);
        });
        inner.appendChild(grid); c.appendChild(inner);
        updateSlotsUI();
        document.getElementById('pairsLeft').textContent = (vt.length / 2) + ' pares';
        // [FASE 6] Marcar que el primer render ya paso (los siguientes seran instantaneos).
        boardFirstRender = false;
        // [FEATURE #3] Re-aplicar resalte de hint si seguia activo tras el re-render.
        if (hintIdxA !== null || hintIdxB !== null) {
            var els2 = document.querySelectorAll('.vita-tile');
            els2.forEach(function(el2) {
                var di2 = parseInt(el2.getAttribute('data-index'));
                if (di2 === hintIdxA || di2 === hintIdxB) el2.classList.add('hint-highlight');
            });
        }
    }

    function updateSlotsUI() {
        var slots = GameEngine.getSlots();
        for (var i = 0; i < 4; i++) {
            var el = document.getElementById('slot-' + i); if (!el) continue;
            el.innerHTML = ''; el.style.backgroundImage = '';
            if (i < slots.length) {
                var t = slots[i];
                el.className = 'rounded-lg border-2 border-primary flex items-center justify-center text-xl font-bold slot-item overflow-hidden';
                el.style.width = '52px'; el.style.height = '72px';
                if (t.url) { el.style.backgroundImage = 'url(' + t.url + ')'; el.style.backgroundSize = 'cover'; }
                else {
                    el.style.background = 'linear-gradient(180deg, #fff8e8 0%, #f5ecd5 50%, #e8d8b0 100%)';
                    el.innerHTML = '<span style="font-size:1.6em;color:' + (t.color || '#2a1a0a') + ';">' + t.symbol + '</span>';
                }
            } else {
                el.className = 'rounded-lg slot-empty';
                el.style.width = '52px'; el.style.height = '72px';
                el.textContent = '+';
            }
        }
    }

    function showMessage(msg) { var el = document.getElementById('message'); if (el) { el.textContent = msg; el.style.opacity = '1'; setTimeout(function() { el.style.opacity = '0'; }, 1800); } }

    function showZoomAndNote(photo) {
        var overlay = document.createElement('div'); overlay.className = 'zoom-overlay';
        overlay.innerHTML = '<img src="' + photo.url + '" class="zoom-image" alt="' + photo.name + '" onerror="this.style.display=\'none\'">' +
            '<div class="zoom-note">' +
                '<h3 style="color:#f2ca50;font-size:1.4em;font-weight:bold;margin-bottom:12px;text-shadow:0 2px 8px rgba(242,202,80,0.4);">' + photo.name + '</h3>' +
                '<p style="color:white;font-size:1.05em;line-height:1.5;font-style:italic;">' + (photo.nota || 'Un rincon magico.') + '</p>' +
            '</div>' +
            '<button onclick="this.parentElement.remove()" style="margin-top:20px;padding:10px 32px;border-radius:12px;background:linear-gradient(180deg,#f2ca50 0%,#d4af37 100%);color:#241a00;font-weight:bold;font-size:1em;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(242,202,80,0.3);">Cerrar</button>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function spawnVictoryParticles() {
        var colors = ['#f2ca50','#ffd700','#ff9f43','#4ade80','#c084fc'];
        for (var i = 0; i < 30; i++) {
            (function(idx) {
                setTimeout(function() {
                    var p = document.createElement('div'); p.className = 'particle';
                    p.textContent = ['🏆','⭐','✨','🎉'][Math.floor(Math.random()*4)];
                    p.style.left = (20 + Math.random()*60) + '%'; p.style.top = (30 + Math.random()*30) + '%';
                    p.style.setProperty('--tx', ((Math.random()-0.5)*200) + 'px');
                    p.style.setProperty('--ty', ((Math.random()-0.5)*200-50) + 'px');
                    p.style.color = colors[Math.floor(Math.random()*colors.length)];
                    p.style.position = 'fixed'; p.style.zIndex = '600';
                    document.body.appendChild(p);
                    setTimeout(function() { p.remove(); }, 1000);
                }, idx * 30);
            })(i);
        }
    }

    function showZone(zid) {
        currentZone = ZONES.find(function(z) { return z.id === zid; });
        // [FASE 5] Cambiar musica segun el pais de la zona.
        if (currentZone && currentZone.country) Musica.play(currentZone.country);
        // [FASE 6] Aplicar tema de color del pais.
        if (currentZone && currentZone.country) applyTheme(currentZone.country);
        var totalStars = currentZone.levels.reduce(function(s, l) { return s + getStars(zid, l.num); }, 0);
        var maxStars = currentZone.levels.length * 3;
        var backFn = currentZone.country === 'argentina' ? 'UI.showArgentineZones()' : currentZone.country === 'mexico' ? 'UI.showMexicanZones()' : currentZone.country === 'brasil' ? 'UI.showBrasilZones()' : 'UI.showChileZones()';
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:transparent;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">';
        html += '<button onclick="' + backFn + '" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button>';
        html += '<span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">' + currentZone.icon + ' ' + currentZone.name + '</span>';
        html += '<button onclick="UI.showWorldMain()" style="margin-left:auto;color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button>';
        html += '</div><div>';
        currentZone.levels.forEach(function(l) {
            var u = isUnlocked(zid, l.num), s = getStars(zid, l.num);
            var miniKey = zid + '-' + l.num, mini = MINIGAMES[miniKey];
            // [FASE 6] Si hay un minijuego en este nivel, mostrarlo ARRIBA del nivel normal (no reemplazarlo).
            if (mini) {
                // Tarjeta del minijuego (siempre desbloqueada si el nivel esta desbloqueado).
                if (u) {
                    html += '<div style="padding:14px;border-radius:12px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.05));border:1px solid rgba(168,85,247,0.35);">';
                    html += '<div><span style="color:white;font-weight:bold;font-size:0.95em;">' + mini.icon + ' ' + mini.name + '</span><p style="font-size:0.7em;color:rgba(168,85,247,0.8);margin-top:2px;">🎮 Minijuego especial</p></div>';
                    html += '<button onclick="event.stopPropagation();UI.showRewardedVideo(function(){UI.startMinigame(\'' + zid + '\',' + l.num + ');})" class="btn-video" style="padding:8px 16px;border-radius:12px;font-size:0.85em;">🎬 Jugar</button>';
                    html += '</div>';
                } else {
                    // Minijuego bloqueado.
                    html += '<div style="padding:14px;border-radius:12px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;opacity:0.4;background:rgba(168,85,247,0.05);border:1px solid rgba(168,85,247,0.15);">';
                    html += '<div><span style="color:rgba(255,255,255,0.6);font-weight:bold;font-size:0.95em;">' + mini.icon + ' ' + mini.name + '</span><p style="font-size:0.7em;color:rgba(168,85,247,0.5);margin-top:2px;">🔒 Completa el nivel anterior</p></div>';
                    html += '</div>';
                }
            }
            // Nivel normal (siempre se muestra, incluso si hay minijuego).
            if (u) {
                html += '<div style="padding:16px;border-radius:12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);cursor:pointer;" onclick="UI.selectLevel(' + l.num + ')">';
                html += '<div><span style="color:white;font-weight:bold;">Nivel ' + l.num + '</span><p style="font-size:0.75em;color:rgba(255,255,255,0.5);">' + l.pairs + ' pares</p></div>';
                html += '<div style="color:#f2ca50;">' + (s > 0 ? '⭐'.repeat(s) + '☆'.repeat(3 - s) : '🔓') + '</div>';
            } else {
                html += '<div style="padding:16px;border-radius:12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;opacity:0.4;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);">';
                html += '<div><span style="color:white;font-weight:bold;">Nivel ' + l.num + '</span><p style="font-size:0.75em;color:rgba(255,255,255,0.5);">' + l.pairs + ' pares</p></div>';
                html += '<div style="color:#f2ca50;">🔒</div>';
            }
            html += '</div>';
        });
        html += '</div></div>';
        document.getElementById('appContent').innerHTML = html;
    }

    function selectLevel(n) {
        if (shouldStartTutorial() && n === 1 && currentZone.id === 'norte') { startTutorial(currentZone.id); return; }
        var originalLevel = currentZone.levels.find(function(l) { return l.num === n; });
        currentLevel = { num: originalLevel.num, pairs: originalLevel.pairs, zoneId: currentZone.id };
        document.getElementById('appContent').innerHTML = '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:transparent;text-align:center;padding:32px;">' +
            '<div style="font-size:3em;margin-bottom:16px;">' + currentZone.icon + '</div>' +
            '<h2 style="color:#f2ca50;font-size:1.5em;font-weight:bold;margin-bottom:8px;">Nivel ' + currentLevel.num + '</h2>' +
            '<p style="color:rgba(255,255,255,0.5);margin-bottom:16px;">' + currentLevel.pairs + ' pares base</p>' +
            '<div style="display:flex;gap:12px;margin-bottom:16px;justify-content:center;">' +
            '<button onclick="UI.startGameWithDifficulty(\'facil\')" style="padding:8px 16px;border-radius:12px;background:rgba(74,222,128,0.2);border:1px solid rgba(74,222,128,0.4);color:rgb(74,222,128);font-weight:bold;">🌱 Facil</button>' +
            '<button onclick="UI.startGameWithDifficulty(\'normal\')" style="padding:8px 16px;border-radius:12px;background:rgba(242,202,80,0.2);border:1px solid rgba(242,202,80,0.4);color:#f2ca50;font-weight:bold;">⚡ Normal</button>' +
            '<button onclick="UI.startGameWithDifficulty(\'dificil\')" style="padding:8px 16px;border-radius:12px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:rgb(239,68,68);font-weight:bold;">🔥 Dificil</button>' +
            '</div><button onclick="UI.showZone(\'' + currentZone.id + '\')" style="color:rgba(255,255,255,0.5);background:none;border:none;font-size:0.9em;cursor:pointer;">← Volver</button></div>';
    }

    function startGameWithDifficulty(difficulty) {
        var pairs = currentLevel.pairs, hintUses = 3, shuffleUses = 3, undoUses = 3;
        if (difficulty === 'facil') { pairs = Math.max(4, pairs - 2); hintUses = 5; shuffleUses = 5; undoUses = 5; }
        else if (difficulty === 'dificil') { pairs = pairs + 2; hintUses = 1; shuffleUses = 1; undoUses = 1; }
        tutorialActive = false;
        // [FASE 2] Resetear stats de tracking para el nuevo nivel.
        gameStats = { usedPowerUps: false, usedUndo: false, currentDifficulty: difficulty };
        startGame({ num: currentLevel.num, pairs: pairs, zoneId: currentLevel.zoneId, difficulty: difficulty, hintUses: hintUses, shuffleUses: shuffleUses, undoUses: undoUses });
    }

    function startGame(config) {
        GameEngine.init(config, currentZone.photos, traditionalTiles);
        // [FASE 6] Mantener tema del pais durante el juego.
        if (currentZone && currentZone.country) applyTheme(currentZone.country);
        var timeLeft = GameEngine.getTimeLeft(), pu = GameEngine.getPowerUps();
        // [FASE 6] Layout compacto: padding y margenes reducidos para que entren los power-ups.
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:transparent;padding:8px;">';
        // Header mas compacto
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-shrink:0;">';
        html += '<button onclick="UI.goBackFromGame()" style="color:white;background:none;border:none;font-size:1.4em;cursor:pointer;">←</button>';
        html += '<span style="color:#f2ca50;font-weight:bold;font-size:0.95em;" id="pairsLeft">' + config.pairs + ' pares</span>';
        if (timeLeft > 0) html += '<span style="color:white;font-weight:bold;font-size:0.95em;" id="timerDisplay">' + timeLeft + 's</span>';
        html += '</div>';
        // Slots mas pequenos
        html += '<div style="display:flex;gap:4px;margin-bottom:6px;justify-content:center;flex-shrink:0;" id="slotsContainer">';
        for (var i = 0; i < 4; i++) html += '<div class="slot-empty" id="slot-' + i + '" style="width:52px;height:72px;font-size:1.2em;">+</div>';
        html += '</div>';
        // Board con flex:1 y overflow auto para scroll si hay muchas fichas
        html += '<div style="flex:1;background:rgba(0,0,0,0.2);border-radius:12px;overflow:auto;border:1px solid rgba(255,255,255,0.05);display:flex;align-items:flex-start;justify-content:center;min-height:120px;" id="boardContainer"></div>';
        // Power-ups siempre visibles, flex-shrink:0 para que no se oculten
        if (!tutorialActive) {
            html += '<div style="display:flex;justify-content:center;gap:10px;margin-top:8px;flex-shrink:0;">';
            html += '<button onclick="UI.useHint()" class="power-up-btn">💡<span class="power-up-badge" id="hintBadge">' + pu.hintUses + '</span></button>';
            html += '<button onclick="UI.useShuffle()" class="power-up-btn">🔀<span class="power-up-badge" id="shuffleBadge">' + pu.shuffleUses + '</span></button>';
            html += '<button onclick="UI.undoLastSelection()" class="power-up-btn">↩️<span class="power-up-badge" id="undoBadge">' + pu.undoUses + '</span></button>';
            html += '<button onclick="UI.toggleHaptic()" class="power-up-btn" id="hapticToggleBtn" title="Vibracion: ' + (hapticEnabled ? 'ON' : 'OFF') + '" style="font-size:0.9em;opacity:' + (hapticEnabled ? '1' : '0.5') + ';">' + (hapticEnabled ? '📳' : '📴') + '</button>';
            html += '<button onclick="UI.toggleMusica()" class="power-up-btn" id="musicaToggleBtn" title="Musica: ' + (Musica.isEnabled() ? 'ON' : 'OFF') + '" style="font-size:0.9em;opacity:' + (Musica.isEnabled() ? '1' : '0.5') + ';">' + (Musica.isEnabled() ? '🔊' : '🔇') + '</button>';
            html += '</div>';
        }
        html += '<div style="text-align:center;margin-top:6px;height:16px;flex-shrink:0;"><span id="message" style="font-size:0.75em;color:rgba(242,202,80,0.8);transition:opacity 0.3s;"></span></div></div>';
        document.getElementById('appContent').innerHTML = html;
        boardFirstRender = true;  // [FASE 6] Nuevo nivel: aplicar stagger en el primer render.
        renderBoard();
        if (tutorialActive) showTutorialOverlay();
    }

    function goBackFromGame() { GameEngine.stopTimer(); Musica.play(currentZone ? currentZone.country : 'menu'); showZone(currentZone.id); }

    // [FASE 5] Doble recompensa: ver rewarded video para duplicar las monedas ganadas en la victoria.
    function dobleRecompensaVictoria() {
        showRewardedVideo(function() {
            // Callback tras "ver el video": duplicar las stars ganadas.
            var extra = lastVictoryStars;  // misma cantidad que ya se dio
            addCoins(extra);
            showMessage('🎬 +' + extra + ' monedas extra!');
            // Tracking de misiones/logros.
            Misiones.registrarEvento('coinsEarned', extra);
            Logros.incrementStat('totalMatches', 0);  // solo para evaluar logros pendientes
            // Deshabilitar el boton para no reclamar 2 veces.
            var drBtn = document.getElementById('dobleRecompensaBtn');
            if (drBtn) { drBtn.disabled = true; drBtn.style.opacity = '0.4'; drBtn.textContent = '✓ Recompensa reclamada'; }
            haptic([30, 50, 30]);
        }, 'Duplica tus monedas viendo un video');
    }
    function useShuffle() { gameStats.usedPowerUps = true; GameEngine.useShuffle(); updatePowerBadges(); }
    function useHint() { gameStats.usedPowerUps = true; GameEngine.useHint(); updatePowerBadges(); }
    function undoLastSelection() { gameStats.usedPowerUps = true; gameStats.usedUndo = true; GameEngine.undoLastSelection(); updatePowerBadges(); }
    function updatePowerBadges() { var pu = GameEngine.getPowerUps(); var hb = document.getElementById('hintBadge'); var sb = document.getElementById('shuffleBadge'); var ub = document.getElementById('undoBadge'); if (hb) hb.textContent = pu.hintUses; if (sb) sb.textContent = pu.shuffleUses; if (ub) ub.textContent = pu.undoUses; }

    function shouldStartTutorial() { return localStorage.getItem('tutorialCompleted') !== '1'; }
    function startTutorial(zoneId) {
        tutorialActive = true; tutorialStep = 0; tutorialZoneId = zoneId;
        var zone = ZONES.find(function(z) { return z.id === zoneId; });
        currentZone = zone;
        currentLevel = { num: 1, pairs: 4, zoneId: zoneId };
        startGame({ num: 1, pairs: 4, zoneId: zoneId, difficulty: 'facil', hintUses: 99, shuffleUses: 99, undoUses: 99 });
    }
    // [FIX BUG #12] Tutorial ahora muestra mensajes distintos en cada paso.
    var TUTORIAL_MESSAGES = [
        'Bienvenido!<br><br>Toca una ficha y luego su pareja identica para eliminarlas.',
        'Las fichas brillantes estan libres.<br><br>Las oscuras estan bloqueadas.',
        'Las parejas van a los slots inferiores.<br><br>Si no coinciden, usa ↩️ para deshacer.',
        'Bonus: las fichas con ✨ dan x2 puntos!',
        'Usa 💡 si necesitas ayuda para encontrar una pareja.',
        'Casi listo! Completa todos los pares para ganar el nivel.'
    ];
    function showTutorialOverlay() {
        var board = document.getElementById('boardContainer'); if (!board) return;
        var prev = document.querySelector('.tutorial-overlay'); if (prev) prev.remove();
        var overlay = document.createElement('div'); overlay.className = 'tutorial-overlay';
        var msg = document.createElement('div'); msg.className = 'tutorial-message';
        msg.id = 'tutorialMessage';
        var stepMsg = TUTORIAL_MESSAGES[Math.min(tutorialStep, TUTORIAL_MESSAGES.length - 1)];
        msg.innerHTML = '<p style="font-size:0.9em;">' + stepMsg + '</p><p style="font-size:0.7em;color:rgba(255,255,255,0.4);margin-top:8px;">Paso ' + (tutorialStep + 1) + '/' + TUTORIAL_MESSAGES.length + '</p><button onclick="UI.skipTutorial()" style="margin-top:12px;padding:8px 16px;background:rgba(242,202,80,0.2);color:#f2ca50;border:none;border-radius:8px;font-weight:bold;">Entendido</button>';
        overlay.appendChild(msg); board.appendChild(overlay);
    }
    function advanceTutorial() {
        if (!tutorialActive) return;
        tutorialStep++;
        if (tutorialStep >= TUTORIAL_MESSAGES.length) { completeTutorial(); }
        else {
            // Actualizar el mensaje sin re-crear el overlay.
            var msgEl = document.getElementById('tutorialMessage');
            if (msgEl) {
                var stepMsg = TUTORIAL_MESSAGES[tutorialStep];
                msgEl.innerHTML = '<p style="font-size:0.9em;">' + stepMsg + '</p><p style="font-size:0.7em;color:rgba(255,255,255,0.4);margin-top:8px;">Paso ' + (tutorialStep + 1) + '/' + TUTORIAL_MESSAGES.length + '</p><button onclick="UI.skipTutorial()" style="margin-top:12px;padding:8px 16px;background:rgba(242,202,80,0.2);color:#f2ca50;border:none;border-radius:8px;font-weight:bold;">Entendido</button>';
            } else {
                showTutorialOverlay();
            }
        }
    }
    function skipTutorial() { completeTutorial(); }
    function completeTutorial() { tutorialActive = false; localStorage.setItem('tutorialCompleted', '1'); showZone(tutorialZoneId || 'norte'); showMessage('Tutorial completado!'); }

    function showRewardedVideo(cb, msg) { rewardCallback = cb; document.getElementById('rewardText').textContent = msg || 'Mira el video'; document.getElementById('rewardModal').style.display = 'flex'; }
    function closeRewardModal() { document.getElementById('rewardModal').style.display = 'none'; }
    function simulateRewardedVideo() { setTimeout(function() { document.getElementById('rewardModal').style.display = 'none'; if (rewardCallback) rewardCallback(); }, 2000); }
    // [FIX BUG #5] Validacion defensiva antes de llamar a googletag.display.
    function showInterstitialAd() {
        if (typeof googletag === 'undefined' || !interstitialSlot) return;
        googletag.cmd.push(function() {
            try { if (interstitialSlot) googletag.display(interstitialSlot); } catch (e) { console.warn('Ad display failed:', e); }
        });
    }

    function closeVictory() {
        document.getElementById('victoryModal').style.display = 'none';
        showZone(currentZone.id);
    }

    function nextLevel() {
        document.getElementById('victoryModal').style.display = 'none';
        var nextNum = currentLevel.num + 1;
        var zoneId = currentZone.id;
        if (nextNum <= 10) {
            var originalLevel = currentZone.levels.find(function(l) { return l.num === nextNum; });
            if (originalLevel) {
                currentLevel = { num: originalLevel.num, pairs: originalLevel.pairs, zoneId: zoneId };
                document.getElementById('appContent').innerHTML =
                    '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:transparent;text-align:center;padding:32px;">' +
                    '<div style="font-size:3em;margin-bottom:16px;">' + currentZone.icon + '</div>' +
                    '<h2 style="color:#f2ca50;font-size:1.5em;font-weight:bold;margin-bottom:8px;">Nivel ' + currentLevel.num + '</h2>' +
                    '<p style="color:rgba(255,255,255,0.5);margin-bottom:16px;">' + currentLevel.pairs + ' pares base</p>' +
                    '<div style="display:flex;gap:12px;margin-bottom:16px;justify-content:center;">' +
                    '<button onclick="UI.startGameWithDifficulty(\'facil\')" style="padding:8px 16px;border-radius:12px;background:rgba(74,222,128,0.2);border:1px solid rgba(74,222,128,0.4);color:rgb(74,222,128);font-weight:bold;">🌱 Facil</button>' +
                    '<button onclick="UI.startGameWithDifficulty(\'normal\')" style="padding:8px 16px;border-radius:12px;background:rgba(242,202,80,0.2);border:1px solid rgba(242,202,80,0.4);color:#f2ca50;font-weight:bold;">⚡ Normal</button>' +
                    '<button onclick="UI.startGameWithDifficulty(\'dificil\')" style="padding:8px 16px;border-radius:12px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:rgb(239,68,68);font-weight:bold;">🔥 Dificil</button>' +
                    '</div>' +
                    '<button onclick="UI.showZone(\'' + zoneId + '\')" style="color:rgba(255,255,255,0.5);background:none;border:none;font-size:0.9em;cursor:pointer;">← Volver a la zona</button>' +
                    '</div>';
            }
        } else {
            showZone(zoneId);
            showMessage('🎉 Zona completada!');
        }
    }

    // [FASE 3] Dispatcher de minijuegos segun tipo.
    function startMinigame(zoneId, levelNum) {
        var mini = MINIGAMES[zoneId + '-' + levelNum];
        if (!mini) return;
        if (mini.type === 'trivia') startTriviaMinigame(zoneId, levelNum);
        else if (mini.type === 'memorice') startMemoriceMinigame(zoneId, levelNum);
    }

    // [FASE 3] Minijuego de Trivia Cultural.
    var triviaState = { questions: [], currentIdx: 0, correctCount: 0, locked: false };
    function startTriviaMinigame(zoneId, levelNum) {
        var mini = MINIGAMES[zoneId + '-' + levelNum];
        if (!mini || mini.type !== 'trivia') return;
        var allQuestions = (TRIVIA[mini.zone] || []).slice();
        // Mezclar preguntas y tomar 5.
        for (var i = allQuestions.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = allQuestions[i]; allQuestions[i] = allQuestions[j]; allQuestions[j] = tmp;
        }
        triviaState = { questions: allQuestions.slice(0, 5), currentIdx: 0, correctCount: 0, locked: false };
        if (!document.getElementById('triviaModal')) {
            var modal = document.createElement('div'); modal.id = 'triviaModal';
            modal.className = 'memorice-modal';  // reutiliza estilos
            modal.innerHTML = '<div style="max-width:360px;width:100%;background:linear-gradient(145deg,rgba(23,34,30,0.95),rgba(11,21,18,0.95));border-radius:16px;border:1px solid rgba(168,85,247,0.4);padding:20px;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
                '<span style="color:#c084fc;font-weight:bold;font-size:1em;" id="triviaTitle">Trivia</span>' +
                '<button onclick="UI.closeTrivia()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">✕</button></div>' +
                '<div id="triviaProgress" style="font-size:0.75em;color:rgba(255,255,255,0.5);margin-bottom:12px;"></div>' +
                '<div id="triviaContent"></div></div>';
            document.body.appendChild(modal);
        }
        document.getElementById('triviaModal').style.display = 'flex';
        document.getElementById('triviaTitle').textContent = mini.icon + ' ' + mini.name;
        renderTriviaQuestion();
    }

    function renderTriviaQuestion() {
        var content = document.getElementById('triviaContent');
        if (!content) return;
        if (triviaState.currentIdx >= triviaState.questions.length) {
            // Resultado final.
            var ok = triviaState.correctCount;
            var total = triviaState.questions.length;
            var passed = ok >= 3;
            var msg = passed ? '🎉 ¡Excelente!' : '😅 ¡Sigue practicando!';
            var reward = passed ? 10 : 0;
            content.innerHTML = '<div style="text-align:center;padding:16px 0;">' +
                '<div style="font-size:3em;margin-bottom:8px;">' + (passed ? '🏆' : '📚') + '</div>' +
                '<h3 style="color:' + (passed ? '#4ade80' : '#f2ca50') + ';font-size:1.3em;margin-bottom:8px;">' + msg + '</h3>' +
                '<p style="color:white;font-size:1.5em;font-weight:bold;margin-bottom:8px;">' + ok + '/' + total + ' correctas</p>' +
                (reward > 0 ? '<p style="color:#4ade80;margin-bottom:16px;">+' + reward + ' 🪙</p>' : '<p style="color:rgba(255,255,255,0.5);margin-bottom:16px;">Sin recompensa</p>') +
                '<button onclick="UI.closeTrivia()" class="btn-primary" style="padding:10px 24px;border-radius:12px;">Cerrar</button>' +
                '</div>';
            if (passed && reward > 0) {
                addCoins(reward);
                // [FASE 2] Tracking de misiones.
                var triviaCompletadas = Misiones.registrarEvento('minigameComplete', 1);
                triviaCompletadas = triviaCompletadas.concat(Misiones.registrarEvento('coinsEarned', reward));
                mostrarMisionesCompletadas(triviaCompletadas);
                Misiones.registrarActividad();
                // [FASE 4] Tracking de logros: minigameComplete, maxTriviaScore.
                var trLogros = [];
                trLogros = trLogros.concat(Logros.registrarEvento('minigameComplete'));
                trLogros = trLogros.concat(Logros.setMaxStat('maxTriviaScore', ok));
                mostrarLogrosDesbloqueados(trLogros);
            }
            triviaState.locked = true;
            return;
        }
        var q = triviaState.questions[triviaState.currentIdx];
        var prog = document.getElementById('triviaProgress');
        if (prog) prog.textContent = 'Pregunta ' + (triviaState.currentIdx + 1) + ' de ' + triviaState.questions.length + '  ·  Aciertos: ' + triviaState.correctCount;
        var html = '<div style="margin-bottom:16px;">';
        html += '<p style="color:white;font-size:1em;font-weight:bold;margin-bottom:16px;line-height:1.4;">' + q.q + '</p>';
        html += '<div id="triviaOptions" style="display:flex;flex-direction:column;gap:8px;">';
        q.opts.forEach(function(opt, idx) {
            html += '<button onclick="UI.answerTrivia(' + idx + ')" style="padding:12px 16px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:white;text-align:left;cursor:pointer;font-size:0.9em;transition:all 0.2s;" onmouseover="this.style.background=\'rgba(168,85,247,0.2)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.05)\'">' + opt + '</button>';
        });
        html += '</div></div>';
        html += '<div id="triviaFeedback" style="min-height:60px;"></div>';
        content.innerHTML = html;
    }

    function answerTrivia(idx) {
        if (triviaState.locked) return;
        var q = triviaState.questions[triviaState.currentIdx];
        var isCorrect = (idx === q.correct);
        if (isCorrect) triviaState.correctCount++;
        // Bloquear opciones y colorear.
        var optsContainer = document.getElementById('triviaOptions');
        if (optsContainer) {
            var btns = optsContainer.querySelectorAll('button');
            btns.forEach(function(btn, i) {
                btn.disabled = true;
                btn.style.cursor = 'default';
                btn.onmouseover = null; btn.onmouseout = null;
                if (i === q.correct) {
                    btn.style.background = 'rgba(74,222,128,0.25)';
                    btn.style.borderColor = '#4ade80';
                    btn.style.color = '#4ade80';
                } else if (i === idx && !isCorrect) {
                    btn.style.background = 'rgba(239,68,68,0.25)';
                    btn.style.borderColor = '#ef4444';
                    btn.style.color = '#ef4444';
                } else {
                    btn.style.opacity = '0.4';
                }
            });
        }
        // Feedback con explicacion.
        var fb = document.getElementById('triviaFeedback');
        if (fb) {
            fb.innerHTML = '<div style="padding:12px;background:' + (isCorrect ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)') + ';border-radius:10px;border-left:3px solid ' + (isCorrect ? '#4ade80' : '#ef4444') + ';">' +
                '<p style="color:' + (isCorrect ? '#4ade80' : '#ef4444') + ';font-weight:bold;font-size:0.9em;margin-bottom:6px;">' + (isCorrect ? '✓ Correcto!' : '✗ Incorrecto') + '</p>' +
                '<p style="color:rgba(255,255,255,0.85);font-size:0.85em;line-height:1.4;">' + q.exp + '</p>' +
                '<button onclick="UI.nextTriviaQuestion()" class="btn-primary" style="margin-top:10px;padding:8px 20px;border-radius:10px;font-size:0.85em;">' + (triviaState.currentIdx + 1 < triviaState.questions.length ? 'Siguiente →' : 'Ver resultado') + '</button>' +
                '</div>';
        }
    }
    function nextTriviaQuestion() {
        triviaState.currentIdx++;
        renderTriviaQuestion();
    }
    function closeTrivia() { var m = document.getElementById('triviaModal'); if (m) m.style.display = 'none'; }

    // [FASE 6] Memorice mejorado: 8 parejas, 3D flip, contador, pantalla de finalizacion.
    var memoriceAttempts = 0;
    function startMemoriceMinigame(zoneId, levelNum) {
        var mini = MINIGAMES[zoneId + '-' + levelNum]; if (!mini || !mini.photos) return;
        var shuffled = mini.photos.slice().sort(function() { return Math.random() - 0.5; });
        // 8 parejas si hay suficientes fotos, sino 6.
        var numPairs = shuffled.length >= 8 ? 8 : 6;
        memoricePhotos = shuffled.slice(0, numPairs);
        memoriceCards = [];
        memoricePhotos.forEach(function(photo, idx) {
            memoriceCards.push({ url: photo.url, name: photo.name, nota: photo.nota, pairId: idx, matched: false });
            memoriceCards.push({ url: photo.url, name: photo.name, nota: photo.nota, pairId: idx, matched: false });
        });
        for (var i = memoriceCards.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var temp = memoriceCards[i]; memoriceCards[i] = memoriceCards[j]; memoriceCards[j] = temp; }
        memoriceFlipped = []; memoriceMatched = 0; memoriceLocked = false; memoriceAttempts = 0;
        var totalPairs = numPairs;
        if (!document.getElementById('memoriceModal')) {
            var modal = document.createElement('div'); modal.id = 'memoriceModal'; modal.className = 'memorice-modal';
            modal.innerHTML = '<div style="max-width:380px;width:100%;background:linear-gradient(145deg,rgba(23,34,30,0.95),rgba(11,21,18,0.95));border-radius:18px;border:1px solid rgba(242,202,80,0.35);padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
                '<span style="color:#f2ca50;font-weight:bold;font-size:1.1em;" id="memoriceTitle">Memorice</span>' +
                '<button onclick="UI.closeMemorice()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">✕</button></div>' +
                '<div id="memoriceProgress" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding:8px 12px;background:rgba(0,0,0,0.25);border-radius:10px;">' +
                '<span style="color:rgba(242,202,80,0.7);font-size:0.75em;">Parejas: <span id="memPairsFound" style="color:#4ade80;font-weight:bold;">0</span>/' + totalPairs + '</span>' +
                '<span style="color:rgba(255,255,255,0.4);font-size:0.7em;">Intentos: <span id="memAttempts" style="color:white;">0</span></span>' +
                '</div>' +
                '<div class="memorice-board" id="memoriceBoard"></div>' +
                '<div id="memoriceResult" style="display:none;margin-top:16px;"></div>' +
                '</div>';
            document.body.appendChild(modal);
        }
        // Resetear el total de parejas en el contador.
        var progressEl = document.getElementById('memoriceProgress');
        if (progressEl) {
            var spans = progressEl.querySelectorAll('span');
            if (spans[0]) spans[0].innerHTML = 'Parejas: <span id="memPairsFound" style="color:#4ade80;font-weight:bold;">0</span>/' + totalPairs;
        }
        document.getElementById('memoriceModal').style.display = 'flex';
        document.getElementById('memoriceTitle').textContent = mini.icon + ' ' + mini.name;
        document.getElementById('memoriceResult').style.display = 'none';
        renderMemoriceBoard();
    }

    function renderMemoriceBoard() {
        var board = document.getElementById('memoriceBoard'); if (!board) return; board.innerHTML = '';
        // Determinar el icono del reverso segun la zona.
        var mini = currentZone ? MINIGAMES[currentZone.id + '-' + (currentLevel ? currentLevel.num : '')] : null;
        var backIcon = (mini && mini.icon) ? mini.icon : '🪭';
        memoriceCards.forEach(function(card, index) {
            var el = document.createElement('div'); el.className = 'memorice-card';
            if (memoriceFlipped.indexOf(index) !== -1 || card.matched) el.classList.add('flipped');
            if (card.matched) el.classList.add('matched');
            // Estructura 3D flip: back + front
            el.innerHTML = '<div class="memorice-card-inner">' +
                '<div class="memorice-card-face memorice-card-back">' +
                    '<span class="memorice-card-back-pattern">' + backIcon + '</span>' +
                '</div>' +
                '<div class="memorice-card-face memorice-card-front">' +
                    '<img src="' + card.url + '" alt="' + card.name + '" onerror="this.style.display=\'none\'">' +
                    (card.matched ? '<div class="card-name-mini">' + card.name + '</div>' : '') +
                '</div>' +
            '</div>';
            el.onclick = function() { flipMemoriceCard(index); };
            board.appendChild(el);
        });
        // Actualizar contador.
        var pf = document.getElementById('memPairsFound');
        var at = document.getElementById('memAttempts');
        if (pf) pf.textContent = memoriceMatched;
        if (at) at.textContent = memoriceAttempts;
    }

    function flipMemoriceCard(index) {
        if (memoriceLocked || memoriceFlipped.indexOf(index) !== -1 || memoriceCards[index].matched) return;
        memoriceFlipped.push(index);
        GameEngine.playRevealSound();  // sonido de flip
        haptic(10);
        renderMemoriceBoard();
        if (memoriceFlipped.length === 2) {
            memoriceLocked = true;
            memoriceAttempts++;
            var a = memoriceFlipped[0], b = memoriceFlipped[1];
            if (memoriceCards[a].pairId === memoriceCards[b].pairId) {
                // Match!
                setTimeout(function() {
                    memoriceCards[a].matched = true; memoriceCards[b].matched = true;
                    memoriceMatched++; memoriceFlipped = []; memoriceLocked = false;
                    GameEngine.playRevealSound();  // sonido de match
                    haptic([20, 30, 20]);
                    renderMemoriceBoard();
                    var totalPairs = memoricePhotos.length;
                    if (memoriceMatched === totalPairs) {
                        setTimeout(function() { showMemoriceResult(); }, 600);
                    }
                }, 400);
            } else {
                // No match
                setTimeout(function() {
                    memoriceFlipped = []; memoriceLocked = false;
                    renderMemoriceBoard();
                }, 900);
            }
        }
    }

    // [FASE 6] Pantalla de finalizacion del memorice.
    function showMemoriceResult() {
        var totalPairs = memoricePhotos.length;
        var perfect = memoriceAttempts === totalPairs;  // sin fallos
        var baseReward = 15;
        var bonus = perfect ? 10 : 0;
        var totalReward = baseReward + bonus;

        var resultEl = document.getElementById('memoriceResult');
        var boardEl = document.getElementById('memoriceBoard');
        if (boardEl) boardEl.style.display = 'none';
        if (resultEl) {
            resultEl.style.display = 'block';
            var html = '<div style="text-align:center;padding:12px 0;">';
            html += '<div style="font-size:3em;margin-bottom:8px;">' + (perfect ? '🏆' : '🎉') + '</div>';
            html += '<h3 style="color:' + (perfect ? '#fbbf24' : '#4ade80') + ';font-size:1.3em;font-weight:bold;margin-bottom:8px;">' + (perfect ? '¡Perfecto! Sin fallos!' : '¡Memorice completado!') + '</h3>';
            html += '<p style="color:white;font-size:0.95em;margin-bottom:4px;">' + memoriceMatched + '/' + totalPairs + ' parejas en ' + memoriceAttempts + ' intentos</p>';
            html += '<p style="color:#4ade80;font-size:1.1em;font-weight:bold;margin-bottom:16px;">+' + totalReward + ' 🪙' + (bonus > 0 ? ' (incl. bonus perfección!)' : '') + '</p>';
            // Galeria de fotos descubiertas
            html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px;">';
            memoricePhotos.forEach(function(p) {
                html += '<div style="aspect-ratio:1;border-radius:8px;overflow:hidden;border:1px solid rgba(242,202,80,0.3);position:relative;">';
                html += '<img src="' + p.url + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">';
                html += '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);color:#f2ca50;font-size:0.45em;text-align:center;padding:1px;">' + p.name + '</div>';
                html += '</div>';
            });
            html += '</div>';
            html += '<button onclick="UI.closeMemorice()" class="btn-primary" style="width:100%;padding:10px;border-radius:12px;font-size:1em;">Cerrar</button>';
            html += '</div>';
            resultEl.innerHTML = html;
        }

        addCoins(totalReward);
        // Tracking de misiones y logros.
        var mgCompletadas = Misiones.registrarEvento('minigameComplete', 1);
        mgCompletadas = mgCompletadas.concat(Misiones.registrarEvento('coinsEarned', totalReward));
        mostrarMisionesCompletadas(mgCompletadas);
        Misiones.registrarActividad();
        var mgLogros = [];
        mgLogros = mgLogros.concat(Logros.registrarEvento('minigameComplete'));
        if (perfect) mgLogros = mgLogros.concat(Logros.registrarEvento('memoricePerfect'));
        mostrarLogrosDesbloqueados(mgLogros);
        haptic([30, 50, 30, 50, 80]);
    }

    function closeMemorice() { document.getElementById('memoriceModal').style.display = 'none'; }

    function showWorldMain() {
        // [FASE 5] Musica ambiental del menu.
        Musica.play('menu');
        // [FASE 6] Tema de color del menu.
        applyTheme('menu');
        var ts = ZONES.reduce(function(s, z) { return s + z.levels.reduce(function(ss, l) { return ss + getStars(z.id, l.num); }, 0); }, 0);
        var cpChile = Math.round((getTotalStarsForCountry('chile') / 120) * 100);
        var cpArgentina = Math.round((getTotalStarsForCountry('argentina') / 120) * 100);
        var cpMexico = Math.round((getTotalStarsForCountry('mexico') / 120) * 100);
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:transparent;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="height:192px;overflow:hidden;position:relative;background:linear-gradient(to bottom, transparent, #0b1512), url(https://drive.google.com/thumbnail?id=1hsx1UaDia9i7oOLdeslGtGLwl0tqUP71&sz=w800) center/cover no-repeat;">';
        html += '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
        html += '<span style="font-size:3em;">🌎</span>';
        html += '<h1 class="text-glow" style="font-size:1.5em;font-weight:bold;color:#f2ca50;">WORLD TOUR</h1>';
        html += '<div style="background:rgba(242,202,80,0.1);padding:4px 12px;border-radius:16px;margin-top:8px;"><span style="color:#f2ca50;font-size:0.9em;font-weight:bold;">⭐ ' + ts + ' ' + I18n.t('menu.stars') + '</span></div>';
        html += '</div></div><div style="padding:16px;">';
        // [FASE 2] Panel de misiones diarias + streak.
        html += Misiones.renderPanel();
        html += countryCard('🇨🇱','Chile',cpChile,'UI.showChileZones()');
        html += countryCard('🇦🇷','Argentina',cpArgentina,'UI.showArgentineZones()');
        html += countryCard('🇲🇽','Mexico',cpMexico,'UI.showMexicanZones()');
        var cpBrasil = Math.round((getTotalStarsForCountry('brasil') / 120) * 100);
        html += countryCard('🇧🇷','Brasil',cpBrasil,'UI.showBrasilZones()');
        html += '<button onclick="UI.showAlbum()" style="width:100%;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-weight:bold;margin-bottom:8px;">📸 ' + I18n.t('menu.album') + '</button>';
        // [FASE 4] Boton de logros con contador.
        var logrosResumen = Logros.obtenerResumen();
        html += '<button onclick="UI.showLogros()" style="width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,rgba(242,202,80,0.15),rgba(255,159,67,0.1));border:1px solid rgba(242,202,80,0.3);color:#f2ca50;font-weight:bold;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">' +
            '<span>🏆 ' + I18n.t('menu.logros') + '</span>' +
            '<span style="font-size:0.8em;color:rgba(242,202,80,0.7);">' + logrosResumen.desbloqueados + '/' + logrosResumen.total + '</span>' +
            '</button>';
        html += '<button onclick="UI.showTienda()" style="width:100%;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-weight:bold;margin-bottom:8px;">🛒 ' + I18n.t('menu.tienda') + '</button>';
        html += '<button onclick="UI.showAjustes()" style="width:100%;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-weight:bold;margin-bottom:8px;">⚙️ ' + I18n.t('menu.ajustes') + '</button>';
        html += '<button onclick="UI.despedida()" style="width:100%;padding:12px;border-radius:12px;background:rgba(242,202,80,0.1);border:1px solid rgba(242,202,80,0.2);color:#f2ca50;font-weight:bold;">👋 ' + I18n.t('menu.salir') + '</button>';
        html += '</div></div>';
        document.getElementById('appContent').innerHTML = html;
    }

    function countryCard(flag, name, progress, onclick) {
        return '<div onclick="' + onclick + '" style="border-radius:16px;overflow:hidden;border:2px solid rgba(242,202,80,0.3);background:linear-gradient(135deg, rgba(242,202,80,0.1), rgba(11,21,18,0.9));margin-bottom:12px;cursor:pointer;">' +
            '<div style="padding:16px;display:flex;align-items:center;gap:16px;"><span style="font-size:2.5em;">' + flag + '</span><div style="flex:1;"><h3 style="color:white;font-weight:bold;font-size:1.1em;">' + name + '</h3><p style="font-size:0.75em;color:rgba(242,202,80,0.7);">' + I18n.t('menu.regiones_niveles') + '</p><div style="width:100%;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:8px;overflow:hidden;"><div style="height:100%;background:linear-gradient(to right, #f2ca50, #ff9f43);border-radius:2px;width:' + progress + '%;"></div></div><p style="font-size:0.75em;color:rgba(255,255,255,0.5);margin-top:4px;">' + progress + '% ' + I18n.t('menu.completado') + '</p></div><span style="color:rgba(255,255,255,0.3);font-size:1.5em;">→</span></div></div>';
    }

    function showChileZones() { showCountryZones('chile','🇨🇱 CHILE'); }
    function showArgentineZones() { showCountryZones('argentina','🇦🇷 ARGENTINA'); }
    function showMexicanZones() { showCountryZones('mexico','🇲🇽 MEXICO'); }
    function showBrasilZones() { showCountryZones('brasil','🇧🇷 BRASIL'); }

    function showCountryZones(country, title) {
        var zones = ZONES.filter(function(z) { return z.country === country; });
        // [FASE 6] Aplicar tema del pais.
        applyTheme(country);
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:transparent;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><button onclick="UI.showWorldMain()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button><span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">' + title + '</span><button onclick="UI.showWorldMain()" style="margin-left:auto;color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        zones.forEach(function(z) {
            html += '<div onclick="UI.showZone(\'' + z.id + '\')" style="height:128px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);background:linear-gradient(135deg, rgba(255,255,255,0.05), transparent);display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;">';
            html += '<span style="font-size:2em;">' + z.icon + '</span><span style="color:white;font-weight:bold;font-size:0.9em;">' + z.name + '</span></div>';
        });
        html += '</div></div>';
        document.getElementById('appContent').innerHTML = html;
    }

    function showAlbum() {
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:transparent;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;"><button onclick="UI.showWorldMain()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button><span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">' + I18n.t('album.titulo') + '</span><button onclick="UI.showWorldMain()" style="margin-left:auto;color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button></div>';
        var countries = [
            { flag:'🇨🇱', name:'Chile', zones:['norte','centro','sur','austral'] },
            { flag:'🇦🇷', name:'Argentina', zones:['argentina-norte','argentina-centro','argentina-patagonia','argentina-litoral'] },
            { flag:'🇲🇽', name:'Mexico', zones:['mexico-norte','mexico-centro','mexico-sur','mexico-caribe'] },
            { flag:'🇧🇷', name:'Brasil', zones:['brasil-amazonia','brasil-nordeste','brasil-sudeste','brasil-sul'] }
        ];
        countries.forEach(function(country) {
            html += '<div style="margin-bottom:16px;"><h3 style="color:white;font-weight:bold;font-size:1.1em;margin-bottom:8px;">' + country.flag + ' ' + country.name + '</h3><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
            country.zones.forEach(function(zid) {
                var zone = ZONES.find(function(z) { return z.id === zid; });
                if (!zone) return;
                zone.photos.forEach(function(photo, idx) {
                    var stars = getStars(zid, idx + 1), unlocked = stars >= 1;
                    html += '<div style="aspect-ratio:1;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;overflow:hidden;">';
                    if (unlocked) html += '<img src="' + photo.url + '" style="width:100%;height:100%;object-fit:cover;" title="' + photo.name + '" onerror="this.style.display=\'none\'">';
                    else html += '<span style="color:rgba(255,255,255,0.3);font-size:1.5em;">?</span>';
                    html += '</div>';
                });
            });
            html += '</div></div>';
        });
        html += '</div>';
        document.getElementById('appContent').innerHTML = html;
    }

    function showTienda() {
        document.getElementById('appContent').innerHTML = '<div style="height:100%;display:flex;flex-direction:column;background:transparent;padding:16px;overflow-y:auto;padding-bottom:70px;">' +
            '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><button onclick="UI.showWorldMain()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button><span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">' + I18n.t('tienda.titulo') + '</span><span style="margin-left:auto;font-size:0.9em;color:rgba(242,202,80,0.8);">💰 ' + coins + ' ' + I18n.t('tienda.monedas') + '</span><button onclick="UI.showWorldMain()" style="color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button></div>' +
            '<p style="font-size:0.75em;color:rgba(255,255,255,0.5);margin-bottom:16px;">' + I18n.t('tienda.ayuda') + '</p>' +
            '<div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div><span style="color:white;font-weight:bold;">' + I18n.t('tienda.pista') + '</span></div><button onclick="UI.comprarPowerUp(\'hint\')" style="padding:8px 16px;border-radius:8px;background:rgba(242,202,80,0.2);color:#f2ca50;font-weight:bold;border:none;cursor:pointer;">10 🪙</button></div>' +
            '<div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div><span style="color:white;font-weight:bold;">' + I18n.t('tienda.mezclar') + '</span></div><button onclick="UI.comprarPowerUp(\'shuffle\')" style="padding:8px 16px;border-radius:8px;background:rgba(242,202,80,0.2);color:#f2ca50;font-weight:bold;border:none;cursor:pointer;">10 🪙</button></div>' +
            '<div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;"><div><span style="color:white;font-weight:bold;">' + I18n.t('tienda.deshacer') + '</span></div><button onclick="UI.comprarPowerUp(\'undo\')" style="padding:8px 16px;border-radius:8px;background:rgba(242,202,80,0.2);color:#f2ca50;font-weight:bold;border:none;cursor:pointer;">10 🪙</button></div></div>';
    }

    function comprarPowerUp(tipo) { if (coins < 10) { showMessage(I18n.t('msg.monedas_insuf')); return; } coins -= 10; localStorage.setItem('coins', coins); GameEngine.addPowerUp(tipo, 1); showTienda(); }

    // [FASE 2] Muestra un toast por cada mision completada.
    function mostrarMisionesCompletadas(completadas) {
        if (!completadas || completadas.length === 0) return;
        completadas.forEach(function(m, idx) {
            setTimeout(function() {
                spawnFloatingMissionToast(m.icono + ' ¡Misión completada!', '+10 🪙');
            }, idx * 600);
        });
    }
    function spawnFloatingMissionToast(text, sub) {
        var el = document.createElement('div');
        el.className = 'mission-toast';
        el.innerHTML = '<div style="font-size:0.95em;font-weight:bold;">' + text + '</div><div style="font-size:0.8em;color:#4ade80;margin-top:2px;">' + sub + '</div>';
        document.body.appendChild(el);
        setTimeout(function() { if (el.parentNode) el.remove(); }, 2800);
    }

    // [FASE 4] Calcula las estrellas totales por pais y actualiza los stats de logros.
    function actualizarStatsEstrellas() {
        var desbloqueados = [];
        var chileTotal = 0, argTotal = 0, mxTotal = 0, brTotal = 0, grandTotal = 0;
        ZONES.forEach(function(z) {
            var zoneTotal = 0;
            z.levels.forEach(function(l) {
                var s = getStars(z.id, l.num);
                zoneTotal += s;
                grandTotal += s;
            });
            if (z.country === 'chile') chileTotal += zoneTotal;
            else if (z.country === 'argentina') argTotal += zoneTotal;
            else if (z.country === 'mexico') mxTotal += zoneTotal;
            else if (z.country === 'brasil') brTotal += zoneTotal;
        });
        desbloqueados = desbloqueados.concat(Logros.setStat('chileStars', chileTotal));
        desbloqueados = desbloqueados.concat(Logros.setStat('argentinaStars', argTotal));
        desbloqueados = desbloqueados.concat(Logros.setStat('mexicoStars', mxTotal));
        desbloqueados = desbloqueados.concat(Logros.setStat('brasilStars', brTotal));
        desbloqueados = desbloqueados.concat(Logros.setStat('totalStars', grandTotal));
        return desbloqueados;
    }

    // [FASE 4] Muestra un toast dorado por cada logro desbloqueado.
    function mostrarLogrosDesbloqueados(logros) {
        if (!logros || logros.length === 0) return;
        logros.forEach(function(l, idx) {
            setTimeout(function() {
                spawnFloatingAchievementToast(l);
                // Sumar monedas de recompensa.
                addCoins(l.recompensa);
            }, idx * 800 + 200);  // delay mayor que misiones para no pisarlas
        });
    }
    function spawnFloatingAchievementToast(logro) {
        var el = document.createElement('div');
        el.className = 'achievement-toast';
        el.innerHTML =
            '<div style="display:flex;align-items:center;gap:12px;">' +
                '<div style="font-size:2em;">' + logro.icono + '</div>' +
                '<div>' +
                    '<div style="font-size:0.7em;color:#f2ca50;letter-spacing:0.15em;text-transform:uppercase;">Logro desbloqueado</div>' +
                    '<div style="font-size:1em;font-weight:bold;color:white;margin-top:2px;">' + logro.nombre + '</div>' +
                    '<div style="font-size:0.75em;color:#4ade80;margin-top:2px;">+' + logro.recompensa + ' 🪙</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(el);
        // Haptic especial para logros.
        haptic([30, 50, 30, 50, 80]);
        setTimeout(function() { if (el.parentNode) el.remove(); }, 3500);
    }

    // [FASE 4] Pantalla de logros.
    function showLogros() {
        document.getElementById('appContent').innerHTML = Logros.renderPanel();
    }

    // [FASE 6] Pantalla de Ajustes estilo Vita.
    function showAjustes() {
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:transparent;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        // Header
        html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:12px;background:linear-gradient(135deg,rgba(242,202,80,0.15),rgba(255,159,67,0.08));border-radius:12px;border:1px solid rgba(242,202,80,0.3);">';
        html += '<button onclick="UI.showWorldMain()" style="color:#f2ca50;background:none;border:none;font-size:1.3em;cursor:pointer;padding:4px;">←</button>';
        html += '<span style="font-size:1.15em;font-weight:bold;color:#f2ca50;">' + I18n.t('ajustes.titulo') + '</span>';
        html += '</div>';
        // Seccion de audio
        html += '<div style="margin-bottom:16px;padding:14px;background:rgba(0,0,0,0.25);border-radius:12px;border:1px solid rgba(242,202,80,0.15);">';
        html += '<h3 style="color:rgba(242,202,80,0.7);font-size:0.7em;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">' + I18n.t('ajustes.audio') + '</h3>';
        // Toggle musica
        html += renderToggle('🎵', I18n.t('ajustes.musica'), 'musicaEnabled', 'UI.toggleMusica()');
        // Toggle sonido (efectos)
        html += renderToggle('🔊', I18n.t('ajustes.efectos'), 'sonidoEnabled', 'UI.toggleSonido()');
        // Toggle vibracion
        html += renderToggle('📳', I18n.t('ajustes.vibracion'), 'hapticEnabled', 'UI.toggleHaptic()');
        html += '</div>';
        // Seccion de preferencias
        html += '<div style="margin-bottom:16px;padding:14px;background:rgba(0,0,0,0.25);border-radius:12px;border:1px solid rgba(242,202,80,0.15);">';
        html += '<h3 style="color:rgba(242,202,80,0.7);font-size:0.7em;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">' + I18n.t('ajustes.prefencias') + '</h3>';
        // Idioma - AHORA INTERACTIVO
        html += '<div onclick="UI.showIdiomas()" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;">';
        html += '<span style="color:white;font-size:0.9em;display:flex;align-items:center;gap:10px;">' + I18n.t('ajustes.idioma') + '</span>';
        html += '<span style="color:rgba(242,202,80,0.8);font-size:0.85em;background:rgba(242,202,80,0.1);padding:4px 12px;border-radius:8px;display:flex;align-items:center;gap:6px;">' + I18n.getCurrentLabel() + ' <span style="color:rgba(255,255,255,0.4);">›</span></span>';
        html += '</div>';
        // Acerca de
        html += '<div onclick="UI.showAcercaDe()" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;">';
        html += '<span style="color:white;font-size:0.9em;display:flex;align-items:center;gap:10px;">' + I18n.t('ajustes.acerca') + '</span>';
        html += '<span style="color:rgba(255,255,255,0.4);font-size:1em;">›</span>';
        html += '</div>';
        // Compartir
        html += '<div onclick="UI.compartirJuego()" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;cursor:pointer;">';
        html += '<span style="color:white;font-size:0.9em;display:flex;align-items:center;gap:10px;">' + I18n.t('ajustes.compartir') + '</span>';
        html += '<span style="color:rgba(255,255,255,0.4);font-size:1em;">›</span>';
        html += '</div>';
        html += '</div>';
        // Boton reset progreso
        html += '<button onclick="UI.resetProgreso()" style="width:100%;padding:12px;border-radius:12px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;font-weight:bold;font-size:0.9em;cursor:pointer;margin-top:8px;">' + I18n.t('ajustes.reset') + '</button>';
        // Footer con version
        html += '<p style="text-align:center;color:rgba(242,202,80,0.4);font-size:0.7em;margin-top:24px;">Mahjong World Tour v7.0<br>' + I18n.t('ajustes.version') + '</p>';
        html += '</div>';
        document.getElementById('appContent').innerHTML = html;
    }

    // [i18n] Modal selector de idioma.
    function showIdiomas() {
        var modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;';
        var current = I18n.getCurrent();
        var optionsHTML = '';
        I18n.getSupported().forEach(function(lang) {
            var selected = lang.code === current;
            var bg = selected ? 'background:linear-gradient(135deg,rgba(242,202,80,0.25),rgba(255,159,67,0.15));border:1px solid rgba(242,202,80,0.6);' : 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);';
            var checkMark = selected ? '<span style="color:#4ade80;font-size:1.2em;">✓</span>' : '<span style="color:rgba(255,255,255,0.3);font-size:1em;">›</span>';
            optionsHTML += '<div onclick="UI.seleccionarIdioma(\'' + lang.code + '\')" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:12px;' + bg + 'margin-bottom:10px;cursor:pointer;transition:transform 0.15s;">' +
                '<span style="color:white;font-size:1em;display:flex;align-items:center;gap:12px;"><span style="font-size:1.5em;">' + lang.flag + '</span>' + lang.label + '</span>' +
                checkMark +
                '</div>';
        });
        modal.innerHTML = '<div style="background:linear-gradient(145deg,rgba(23,34,30,0.95),rgba(11,21,18,0.95));padding:24px;border-radius:20px;border:1px solid rgba(242,202,80,0.3);max-width:340px;width:100%;">' +
            '<h2 style="color:#f2ca50;font-size:1.2em;font-weight:bold;margin-bottom:6px;text-align:center;">' + I18n.t('idioma.titulo') + '</h2>' +
            '<p style="color:rgba(255,255,255,0.5);font-size:0.7em;text-align:center;margin-bottom:20px;line-height:1.4;">' + I18n.t('idioma.nota') + '</p>' +
            optionsHTML +
            '<button onclick="this.parentElement.parentElement.remove()" class="btn-primary" style="width:100%;padding:10px;border-radius:12px;font-size:1em;margin-top:8px;">' + I18n.t('acerca.cerrar') + '</button>' +
            '</div>';
        document.body.appendChild(modal);
    }

    // [i18n] Cambia el idioma y refresca ajustes.
    function seleccionarIdioma(code) {
        I18n.setLang(code);
        // Cerrar modal (busca cualquier modal z-index 600 abierto)
        var modals = document.querySelectorAll('div[style*="z-index:600"]');
        modals.forEach(function(m) { if (m.parentNode) m.parentNode.removeChild(m); });
        // Refrescar pantalla de ajustes para mostrar nuevo idioma
        showAjustes();
        if (navigator.vibrate) navigator.vibrate(20);
    }

    // [FASE 6] Renderiza un toggle switch estilo Vita.
    function renderToggle(icono, label, storageKey, onclickFn) {
        var enabled = localStorage.getItem(storageKey) !== '0';
        // Casos especiales: musicaEnabled default OFF, hapticEnabled default ON
        if (storageKey === 'musicaEnabled') enabled = localStorage.getItem(storageKey) === '1';
        if (storageKey === 'sonidoEnabled') enabled = localStorage.getItem(storageKey) !== '0';
        var toggleBg = enabled ? 'background:linear-gradient(180deg,#4ade80,#22c55e);' : 'background:rgba(255,255,255,0.15);';
        var knobPos = enabled ? 'transform:translateX(22px);' : 'transform:translateX(0);';
        var html = '<div onclick="' + onclickFn + '" style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;">';
        html += '<span style="color:white;font-size:0.9em;display:flex;align-items:center;gap:10px;">' + icono + ' ' + label + '</span>';
        html += '<div style="width:48px;height:26px;border-radius:13px;' + toggleBg + 'position:relative;transition:background 0.3s;">';
        html += '<div style="width:22px;height:22px;background:white;border-radius:50%;position:absolute;top:2px;left:2px;' + knobPos + 'transition:transform 0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>';
        html += '</div></div>';
        return html;
    }

    // [FASE 6] Toggle de efectos de sonido (separado de musica).
    var sonidoEnabled = localStorage.getItem('sonidoEnabled') !== '0';
    function toggleSonido() {
        sonidoEnabled = !sonidoEnabled;
        localStorage.setItem('sonidoEnabled', sonidoEnabled ? '1' : '0');
        // Refrescar pantalla de ajustes
        showAjustes();
        if (sonidoEnabled) haptic(20);
    }
    function isSonidoEnabled() { return sonidoEnabled; }

    // [FASE 6] Modal "Acerca de".
    function showAcercaDe() {
        var modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;';
        modal.innerHTML = '<div style="background:linear-gradient(145deg,rgba(23,34,30,0.95),rgba(11,21,18,0.95));padding:32px;border-radius:20px;text-align:center;border:1px solid rgba(242,202,80,0.3);max-width:320px;">' +
            '<div style="font-size:3em;margin-bottom:12px;">🌎</div>' +
            '<h2 style="color:#f2ca50;font-size:1.4em;font-weight:bold;margin-bottom:8px;">' + I18n.t('acerca.titulo') + '</h2>' +
            '<p style="color:rgba(242,202,80,0.6);font-size:0.8em;letter-spacing:0.2em;margin-bottom:16px;">WORLD TOUR</p>' +
            '<p style="color:white;font-size:0.9em;line-height:1.6;margin-bottom:16px;">' + I18n.t('acerca.desc') + '</p>' +
            '<p style="color:rgba(242,202,80,0.5);font-size:0.75em;margin-bottom:20px;">' + I18n.t('acerca.version') + ' 7.0 · ' + I18n.t('ajustes.version') + '</p>' +
            '<button onclick="this.parentElement.parentElement.remove()" class="btn-primary" style="width:100%;padding:10px;border-radius:12px;font-size:1em;">' + I18n.t('acerca.cerrar') + '</button>' +
            '</div>';
        document.body.appendChild(modal);
    }

    // [FASE 6] Compartir juego (Web Share API).
    function compartirJuego() {
        if (navigator.share) {
            navigator.share({ title: 'Descubre América · Mahjong World Tour', text: '¡Juega Mahjong viajando por Chile, Argentina, México y Brasil!', url: window.location.href })
                .catch(function() { showMessage(I18n.t('msg.compartir_no')); });
        } else {
            // Fallback: copiar URL
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                showMessage(I18n.t('msg.enlace_copiado'));
            } else {
                showMessage('Comparte: ' + window.location.href);
            }
        }
    }

    // [FASE 6] Reiniciar progreso (con confirmacion).
    function resetProgreso() {
        if (!confirm(I18n.t('msg.reset_confirma'))) return;
        localStorage.removeItem('coins');
        localStorage.removeItem('tutorialCompleted');
        localStorage.removeItem('misiones_state');
        localStorage.removeItem('streak_state');
        localStorage.removeItem('logros_state');
        Object.keys(localStorage).forEach(function(key) {
            if (key.indexOf('zone_') === 0) localStorage.removeItem(key);
        });
        coins = 0;
        showMessage('✓ Progreso reiniciado');
        setTimeout(function() { showWorldMain(); }, 1000);
    }

    // [FASE 6] Saludo de despedida con frase aleatoria.
    function despedida() {
        // Usar las frases traducidas (primeras 4) + fallback a las originales en español.
        var frase = I18n.t('despedida.' + (Math.floor(Math.random() * 4) + 1));
        var overlay = document.createElement('div');
        overlay.id = 'despedidaOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center,#0d2018 0%,#050a08 100%);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;animation:despedidaFade 0.8s ease-out;';
        overlay.innerHTML = '<div style="font-size:4em;margin-bottom:20px;animation:despedidaWave 2s ease-in-out infinite;">🫶</div>' +
            '<p style="color:#f2ca50;font-size:1.5em;font-weight:bold;text-align:center;max-width:320px;line-height:1.4;text-shadow:0 0 24px rgba(242,202,80,0.5);">' + frase + '</p>' +
            '<div style="margin-top:24px;width:80px;height:2px;background:linear-gradient(to right,transparent,#f2ca50,transparent);"></div>' +
            '<p style="color:rgba(242,202,80,0.4);font-size:0.7em;margin-top:20px;letter-spacing:0.25em;">' + I18n.t('despedida.footer') + '</p>' +
            '<p style="color:rgba(242,202,80,0.3);font-size:0.6em;margin-top:8px;">' + I18n.t('ajustes.version') + '</p>' +
            '<button onclick="document.getElementById(\'despedidaOverlay\').remove()" style="margin-top:32px;padding:10px 28px;border-radius:12px;background:rgba(242,202,80,0.15);border:1px solid rgba(242,202,80,0.3);color:#f2ca50;font-weight:bold;cursor:pointer;font-size:0.9em;">← Seguir jugando</button>';
        document.body.appendChild(overlay);
        haptic([20, 40, 20]);
    }

    // [FASE 2] Reclama todas las recompensas pendientes.
    function reclamarMisiones() {
        var r = Misiones.reclamarPendientes();
        if (r.total > 0) {
            addCoins(r.total);
            showMessage('🎁 +' + r.total + ' monedas' + (r.bonus > 0 ? ' (incl. bonus x3!)' : ''));
            // Refrescar el panel visualmente.
            showWorldMain();
        } else {
            showMessage('No hay recompensas pendientes');
        }
    }

    // [FASE 2] Verifica si hay bonus de streak pendientes y los muestra.
    function verificarBonusStreakPendiente() {
        var bonus = Misiones.verificarBonusStreak();
        if (!bonus) return;
        // Mostrar modal de bonus.
        var modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;';
        modal.innerHTML = '<div style="background:linear-gradient(145deg,rgba(23,34,30,0.95),rgba(11,21,18,0.95));padding:32px;border-radius:24px;text-align:center;border:2px solid #ff9f43;max-width:320px;">' +
            '<div style="font-size:4em;">🔥</div>' +
            '<h2 style="color:#ff9f43;font-size:1.4em;font-weight:bold;margin:8px 0;">¡Racha de ' + bonus.dias + ' días!</h2>' +
            '<p style="color:white;margin-bottom:16px;">' + bonus.msg + '</p>' +
            '<button onclick="UI.reclamarBonusStreak(' + bonus.dias + ',this)" class="btn-reward" style="width:100%;padding:12px;border-radius:12px;font-size:1.1em;">Reclamar</button>' +
            '</div>';
        document.body.appendChild(modal);
    }
    function reclamarBonusStreak(dias, btn) {
        var bonus = Misiones.reclamarBonus(dias);
        if (bonus) {
            addCoins(bonus.monedas);
            // Cerrar el modal (subir al abuelo: el overlay).
            var modal = btn ? btn.closest('div[style*="z-index:600"]') : null;
            // Mas simple: buscar el overlay que contiene el boton.
            var overlay = btn;
            while (overlay && overlay.tagName !== 'BODY' && overlay.style.position !== 'fixed') overlay = overlay.parentNode;
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            showMessage('+' + bonus.monedas + ' monedas 🔥');
        }
    }

    // [FASE 4] Splash animado: avion recorre America destacando Chile (cuna del proyecto).
    function showSplash() {
        var splash = document.createElement('div');
        splash.id = 'splashAnimado';
        splash.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center, #0d2018 0%, #050a08 100%);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;';

        // Estrellas de fondo (zen)
        var starsHTML = '';
        for (var i = 0; i < 35; i++) {
            var sx = Math.random() * 100;
            var sy = Math.random() * 100;
            var sd = 1 + Math.random() * 2;
            var sdelay = Math.random() * 3;
            starsHTML += '<div class="splash-star" style="left:' + sx + '%;top:' + sy + '%;width:' + sd + 'px;height:' + sd + 'px;animation-delay:' + sdelay + 's;"></div>';
        }
        splash.innerHTML = '<div style="position:absolute;inset:0;pointer-events:none;">' + starsHTML + '</div>';

        // Mapa SVG: avion parte en Mexico, baja a Brasil (noreste), Argentina (este),
        // cruza a Chile centro (cuna del proyecto, destacado) y termina en la Patagonia.
        // La parada en Chile es mas larga para destacarlo como origen del juego.
        var svgMap = '' +
            '<svg viewBox="0 0 300 440" style="width:280px;height:auto;max-width:80vw;filter:drop-shadow(0 0 20px rgba(242,202,80,0.2));">' +
                '<path d="M 80 30 Q 100 20 130 35 Q 160 25 180 45 Q 200 60 195 90 Q 210 110 200 140 Q 215 170 200 200 Q 210 230 195 260 Q 200 290 180 320 Q 170 360 150 400 Q 130 420 110 410 Q 90 390 85 360 Q 70 330 80 300 Q 65 270 75 240 Q 60 210 70 180 Q 55 150 70 120 Q 60 90 75 60 Q 70 40 80 30 Z" ' +
                    'fill="none" stroke="rgba(242,202,80,0.15)" stroke-width="1.5" stroke-dasharray="2 4"/>' +
                '<path id="flightPath" d="M 130 55 Q 200 80 220 130 Q 200 170 175 210 Q 140 240 95 260 Q 100 330 130 400" ' +
                    'fill="none" stroke="url(#trailGrad)" stroke-width="2.5" stroke-linecap="round" ' +
                    'stroke-dasharray="900" stroke-dashoffset="900" class="splash-trail"/>' +
                '<defs>' +
                    '<linearGradient id="trailGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
                        '<stop offset="0%" stop-color="#f2ca50" stop-opacity="0.15"/>' +
                        '<stop offset="40%" stop-color="#f2ca50" stop-opacity="0.7"/>' +
                        '<stop offset="70%" stop-color="#ff9f43" stop-opacity="0.9"/>' +
                        '<stop offset="100%" stop-color="#ff6b6b" stop-opacity="1"/>' +
                    '</linearGradient>' +
                    '<radialGradient id="cityGlow">' +
                        '<stop offset="0%" stop-color="#f2ca50" stop-opacity="1"/>' +
                        '<stop offset="100%" stop-color="#f2ca50" stop-opacity="0"/>' +
                    '</radialGradient>' +
                    '<radialGradient id="brasilGlow">' +
                        '<stop offset="0%" stop-color="#7fd957" stop-opacity="1"/>' +
                        '<stop offset="100%" stop-color="#7fd957" stop-opacity="0"/>' +
                    '</radialGradient>' +
                    '<radialGradient id="chileGlow">' +
                        '<stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>' +
                        '<stop offset="40%" stop-color="#f2ca50" stop-opacity="0.95"/>' +
                        '<stop offset="100%" stop-color="#f2ca50" stop-opacity="0"/>' +
                    '</radialGradient>' +
                '</defs>' +
                // Mexico (inicio)
                '<circle cx="130" cy="55" r="4" fill="#f2ca50" class="splash-city" style="animation-delay:0.3s;"/>' +
                '<circle cx="130" cy="55" r="10" fill="url(#cityGlow)" class="splash-city-pulse" style="animation-delay:0.3s;"/>' +
                '<text x="130" y="42" class="splash-label" style="animation-delay:0.5s;" text-anchor="middle">Mexico</text>' +
                // Brasil (noreste) - verde caracteristico
                '<circle cx="220" cy="130" r="4" fill="#7fd957" class="splash-city" style="animation-delay:1.6s;"/>' +
                '<circle cx="220" cy="130" r="10" fill="url(#brasilGlow)" class="splash-city-pulse" style="animation-delay:1.6s;"/>' +
                '<text x="240" y="134" class="splash-label" style="animation-delay:1.8s;" text-anchor="start">Brasil</text>' +
                // Argentina
                '<circle cx="175" cy="210" r="4" fill="#f2ca50" class="splash-city" style="animation-delay:2.9s;"/>' +
                '<circle cx="175" cy="210" r="10" fill="url(#cityGlow)" class="splash-city-pulse" style="animation-delay:2.9s;"/>' +
                '<text x="195" y="214" class="splash-label" style="animation-delay:3.1s;" text-anchor="start">Argentina</text>' +
                // Chile (destacado, cuna del proyecto)
                '<circle cx="95" cy="260" r="7" fill="url(#chileGlow)" class="splash-city-chile-pulse" style="animation-delay:4.0s;"/>' +
                '<circle cx="95" cy="260" r="6" fill="#ffffff" class="splash-city-chile" style="animation-delay:4.0s;"/>' +
                '<circle cx="95" cy="260" r="14" fill="url(#chileGlow)" class="splash-city-chile-aura" style="animation-delay:4.0s;"/>' +
                '<text x="95" y="285" class="splash-label-chile" style="animation-delay:4.2s;" text-anchor="middle">CHILE</text>' +
                '<text x="95" y="300" class="splash-label-sub" style="animation-delay:4.4s;" text-anchor="middle">' + I18n.t('splash.cuna') + '</text>' +
                // Patagonia (final austral)
                '<circle cx="130" cy="400" r="4" fill="#f2ca50" class="splash-city" style="animation-delay:5.8s;"/>' +
                '<circle cx="130" cy="400" r="10" fill="url(#cityGlow)" class="splash-city-pulse" style="animation-delay:5.8s;"/>' +
                '<text x="130" y="420" class="splash-label" style="animation-delay:6.0s;" text-anchor="middle">Patagonia</text>' +
                '<g class="splash-plane">' +
                    '<g transform="translate(-8,-8)">' +
                        '<path d="M 8 0 L 14 6 L 14 10 L 9 8 L 7 14 L 5 14 L 6 8 L 1 10 L 1 7 L 6 4 Z" ' +
                            'fill="#f2ca50" stroke="#d4af37" stroke-width="0.4"/>' +
                    '</g>' +
                '</g>' +
            '</svg>';
        splash.innerHTML += '<div style="position:relative;z-index:2;">' + svgMap + '</div>';

        splash.innerHTML += '<div style="position:relative;z-index:2;margin-top:20px;">' +
            '<span class="splash-text-outfit" style="display:block;font-size:0.85em;color:rgba(242,202,80,0.7);letter-spacing:0.35em;margin-bottom:8px;">' + I18n.t('splash.outfit') + '</span>' +
            '<h1 class="splash-title text-glow" style="font-size:2.6em;font-weight:700;color:#f2ca50;line-height:1.1;letter-spacing:0.02em;">' + I18n.t('splash.title') + '</h1>' +
            '<div class="splash-divider"></div>' +
            '<p class="splash-subtitle" style="font-size:0.9em;color:rgba(255,255,255,0.55);letter-spacing:0.4em;font-weight:300;">' + I18n.t('splash.subtitle') + '</p>' +
            '<p class="splash-tagline" style="font-size:0.7em;color:rgba(242,202,80,0.5);margin-top:18px;letter-spacing:0.15em;">' + I18n.t('splash.tagline') + '</p>' +
            '<p class="splash-made" style="font-size:0.65em;color:rgba(242,202,80,0.45);margin-top:10px;letter-spacing:0.1em;">' + I18n.t('splash.made') + '</p>' +
            '</div>';

        document.body.appendChild(splash);

        var plane = splash.querySelector('.splash-plane');
        var pathEl = splash.querySelector('#flightPath');
        if (plane && pathEl) {
            var animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            // [Brasil splash] Duracion aumentada a 5.5s para acomodar 5 ciudades (Mexico, Brasil, Argentina, Chile, Patagonia).
            animateMotion.setAttribute('dur', '5.5s');
            animateMotion.setAttribute('fill', 'freeze');
            animateMotion.setAttribute('rotate', 'auto');
            animateMotion.setAttribute('begin', '0.3s');
            // keyPoints: 0 (Mexico) -> 0.22 (Brasil) -> 0.45 (Argentina) -> 0.65 (Chile) -> 0.65 (hover Chile) -> 1.0 (Patagonia)
            animateMotion.setAttribute('keyPoints', '0;0.22;0.45;0.65;0.65;1');
            animateMotion.setAttribute('keyTimes',  '0;0.22;0.45;0.65;0.78;1');
            animateMotion.setAttribute('calcMode', 'spline');
            // 5 splines para 6 puntos (el 4to es "0 0 1 1" = lineal para el hover en Chile).
            animateMotion.setAttribute('keySplines', '0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0 0 1 1; 0.4 0 0.6 1');
            var mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#flightPath');
            animateMotion.appendChild(mpath);
            plane.appendChild(animateMotion);
        }

        // [FASE 5] Al terminar el splash del avion, mostrar segunda pantalla con frase inspiradora rotativa.
        // Tiempo total ampliado a 6.5s para que el avion (5.5s + 0.3s inicio) termine y se lea la ultima etiqueta.
        setTimeout(function() {
            splash.style.transition = 'opacity 0.5s ease';
            splash.style.opacity = '0';
            setTimeout(function() {
                if (splash.parentNode) splash.parentNode.removeChild(splash);
                showSplashFrase();
            }, 500);
        }, 6500);
    }

    // [FASE 5] Segunda pantalla splash: frase inspiradora grande rotativa (estilo hashtag).
    var SPLASH_FRASES = [
        I18n.t('splash.frase.1'),
        I18n.t('splash.frase.2'),
        I18n.t('splash.frase.3'),
        I18n.t('splash.frase.4'),
        I18n.t('splash.frase.5'),
        I18n.t('splash.frase.6'),
        I18n.t('splash.frase.7'),
        I18n.t('splash.frase.8')
    ];
    function showSplashFrase() {
        var splash = document.createElement('div');
        splash.id = 'splashFrase';
        splash.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center, #0d2018 0%, #050a08 100%);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;padding:32px;';

        // Estrellas de fondo suaves
        var starsHTML = '';
        for (var i = 0; i < 25; i++) {
            var sx = Math.random() * 100;
            var sy = Math.random() * 100;
            var sd = 1 + Math.random() * 2;
            var sdelay = Math.random() * 2;
            starsHTML += '<div class="splash-star" style="left:' + sx + '%;top:' + sy + '%;width:' + sd + 'px;height:' + sd + 'px;animation-delay:' + sdelay + 's;animation-duration:4s;"></div>';
        }
        splash.innerHTML = '<div style="position:absolute;inset:0;pointer-events:none;">' + starsHTML + '</div>';

        // Elegir frase aleatoria
        var frase = SPLASH_FRASES[Math.floor(Math.random() * SPLASH_FRASES.length)];

        // Linea decorativa superior
        splash.innerHTML += '<div class="splash-frase-line-top"></div>';

        // Frase principal en grande
        splash.innerHTML += '<h1 class="splash-frase-text text-glow" style="font-size:1.7em;font-weight:700;color:#f2ca50;line-height:1.3;letter-spacing:0.01em;max-width:340px;position:relative;z-index:2;font-family:Outfit,sans-serif;">' + frase + '</h1>';

        // Linea decorativa inferior
        splash.innerHTML += '<div class="splash-frase-line-bot"></div>';

        // Pequeno indicador "Desliza para comenzar"
        splash.innerHTML += '<div class="splash-frase-tap" style="position:absolute;bottom:48px;left:50%;transform:translateX(-50%);color:rgba(242,202,80,0.5);font-size:0.7em;letter-spacing:0.2em;text-transform:uppercase;z-index:2;">Toca para comenzar</div>';

        document.body.appendChild(splash);

        // Auto-transicion despues de 3.5s, o si el usuario toca la pantalla antes.
        var transicionada = false;
        function transicionar() {
            if (transicionada) return;
            transicionada = true;
            splash.style.transition = 'opacity 0.6s ease';
            splash.style.opacity = '0';
            setTimeout(function() {
                if (splash.parentNode) splash.parentNode.removeChild(splash);
                showWorldMain();
            }, 600);
        }
        splash.addEventListener('click', transicionar);
        splash.addEventListener('touchend', function(e) { e.preventDefault(); transicionar(); });
        setTimeout(transicionar, 3500);
    }

    return Object.freeze({
        showSplash: showSplash, showWorldMain: showWorldMain, showChileZones: showChileZones,
        showArgentineZones: showArgentineZones, showMexicanZones: showMexicanZones,
        showBrasilZones: showBrasilZones,
        showZone: showZone, selectLevel: selectLevel, startGameWithDifficulty: startGameWithDifficulty,
        goBackFromGame: goBackFromGame, useShuffle: useShuffle, useHint: useHint, undoLastSelection: undoLastSelection,
        showTienda: showTienda, showAlbum: showAlbum,
        showLogros: showLogros,
        showAjustes: showAjustes, showAcercaDe: showAcercaDe,
        showIdiomas: showIdiomas, seleccionarIdioma: seleccionarIdioma,
        toggleSonido: toggleSonido, compartirJuego: compartirJuego,
        resetProgreso: resetProgreso, despedida: despedida,
        showRewardedVideo: showRewardedVideo, closeRewardModal: closeRewardModal,
        simulateRewardedVideo: simulateRewardedVideo,
        closeVictory: closeVictory, nextLevel: nextLevel,
        startMemoriceMinigame: startMemoriceMinigame, closeMemorice: closeMemorice,
        startMinigame: startMinigame,
        startTriviaMinigame: startTriviaMinigame, closeTrivia: closeTrivia,
        answerTrivia: answerTrivia, nextTriviaQuestion: nextTriviaQuestion,
        skipTutorial: skipTutorial,
        toggleHaptic: toggleHaptic,
        toggleMusica: toggleMusica,
        dobleRecompensaVictoria: dobleRecompensaVictoria,
        reclamarMisiones: reclamarMisiones,
        reclamarBonusStreak: reclamarBonusStreak
    });
})();

UI.showSplash();

// [FASE 6] Saludo de despedida al salir del juego.
var DESPEDIDA_FRASES = [
    '¡Hasta pronto, viajero! 🌎',
    '¡Te esperamos de vuelta! 🎴',
    '¡Vuelve a descubrir América! 🗺️',
    '¡Tu aventura Mahjong continúa mañana! ⭐',
    '¡Gracias por jugar! Nos vemos pronto 🇨🇱',
    '¡El mundo te espera! Regresa cuando quieras 🌄',
    '¡Buen viaje! Tu Mahjong estará aquí esperándote ✨',
    '¡Descansa, maestro! Las fichas te esperan 🧘',
    '¡Nos vemos en la próxima parada! ✈️',
    '¡Tu racha diaria cuenta! Vuelve mañana 🔥'
];
window.addEventListener('beforeunload', function(e) {
    // Solo mostrar despedida si el usuario estuvo jugando (no en splash inicial).
    if (document.getElementById('appContent') && document.getElementById('appContent').innerHTML.length > 100) {
        var frase = I18n.t('despedida.' + (Math.floor(Math.random() * 4) + 1));
        // Crear overlay de despedida.
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:radial-gradient(ellipse at center,#0d2018 0%,#050a08 100%);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;';
        overlay.innerHTML = '<div style="font-size:3em;margin-bottom:16px;">🫶</div>' +
            '<p style="color:#f2ca50;font-size:1.3em;font-weight:bold;text-align:center;max-width:300px;line-height:1.4;text-shadow:0 0 20px rgba(242,202,80,0.4);">' + frase + '</p>' +
            '<div style="margin-top:20px;width:60px;height:2px;background:linear-gradient(to right,transparent,#f2ca50,transparent);"></div>' +
            '<p style="color:rgba(242,202,80,0.4);font-size:0.7em;margin-top:16px;letter-spacing:0.2em;">' + I18n.t('despedida.footer') + '</p>';
        document.body.appendChild(overlay);
    }
});
