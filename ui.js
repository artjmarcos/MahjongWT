// ========== INTERFAZ DE USUARIO (UI) ==========
var UI = (function() {
    var currentZone = null, currentLevel = null, coins = parseInt(localStorage.getItem('coins') || '0');
    var tutorialActive = false, tutorialStep = 0, tutorialZoneId = null;
    var rewardCallback = null, adCount = 0;
    var AD_EVERY = 5;
    // [FASE 2] Tracking de eventos para misiones.
    var gameStats = { usedPowerUps: false, usedUndo: false, currentDifficulty: 'normal' };
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
        else if (event === 'timeout') { showMessage('Tiempo agotado'); setTimeout(function() { showZone(currentZone.id); }, 1500); }
        else if (event === 'victory') {
            var stars = data.score >= 2000 ? 3 : data.score >= 1000 ? 2 : 1;
            setStars(currentZone.id, currentLevel.num, stars);
            addCoins(stars);
            document.getElementById('victoryIcon').textContent = '🏆';
            document.getElementById('victoryName').textContent = currentZone.name + ' Nivel ' + currentLevel.num;
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
            // [FASE 2] Registrar actividad para el streak diario.
            Misiones.registrarActividad();
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
        var w = c.clientWidth - 16, margin = 10, COLS = 6, cw = (w - margin * 2) / COLS, ch = cw * 1.45;
        var maxRow = vt.length > 0 ? Math.max.apply(null, vt.map(function(t) { return t.row; })) : 0;
        var maxLayer = vt.length > 0 ? Math.max.apply(null, vt.map(function(t) { return t.layer; })) : 0;
        var nh = Math.max((maxRow + 1) * ch + margin * 2 + (maxLayer * 15) + 20, 300);
        c.style.minHeight = nh + 'px'; c.innerHTML = '';
        var inner = document.createElement('div');
        inner.style.cssText = 'position:relative;width:100%;display:flex;align-items:center;justify-content:center;height:' + nh + 'px;';
        var grid = document.createElement('div');
        grid.style.cssText = 'position:relative;width:' + (COLS * cw) + 'px;height:' + ((maxRow + 1) * ch + maxLayer * 15) + 'px;';
        vt.forEach(function(t) {
            var el = document.createElement('div'); el.className = 'vita-tile';
            if (t.bonus) el.classList.add('bonus-tile');
            el.style.left = (t.col * cw + margin) + 'px';
            el.style.top = (t.row * ch + margin + t.layer * 12) + 'px';
            el.style.width = (cw - 4) + 'px'; el.style.height = (ch - 4) + 'px';
            el.style.zIndex = t.layer * 100 + Math.floor(t.row * 2);
            var td = tiles.indexOf(t);
            var isSel = (GameEngine.getSelectedTileIdx() === td);
            el.setAttribute('data-index', td);
            el.setAttribute('data-pid', t.pid);
            if (t.faceDown && !t.revealed) {
                el.style.background = 'linear-gradient(145deg, #1a3a2a, #0d2518)';
                el.innerHTML = '<div style="font-size:2em;color:rgba(242,202,80,0.4);">🪭</div>';
            } else if (t.type === 'photo') {
                el.style.backgroundImage = 'url(' + t.url + ')';
                el.style.backgroundSize = 'cover';
            } else {
                el.style.background = 'linear-gradient(145deg, #faf5eb, #b8a880)';
                el.style.fontSize = '1.6em'; el.style.color = '#2a1a0a';
                el.textContent = t.symbol;
            }
            var nm = document.createElement('div'); nm.className = 'card-name';
            nm.textContent = t.name || t.symbol; el.appendChild(nm);
            if (t.blocked) el.classList.add('blocked'); else el.classList.add('free');
            if (isSel) el.classList.add('selected-card');
            el.style.touchAction = 'manipulation';
            // [FIX BUG #7] Handler unificado con deduplicacion click+touchend.
            function handleTileTap(e) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                var now = Date.now();
                if (now - lastTapTime < 300) return;
                lastTapTime = now;
                // [FEATURE #3] Al hacer click en cualquier ficha, limpiar resalte de hint.
                clearHintHighlight();
                var idx = parseInt(el.getAttribute('data-index'));
                var allTiles = GameEngine.getTiles();
                if (idx >= 0 && idx < allTiles.length && allTiles[idx] === t) {
                    GameEngine.onTileClick(idx);
                }
                if (tutorialActive) advanceTutorial();
            }
            el.addEventListener('click', handleTileTap);
            el.addEventListener('touchend', handleTileTap);
            grid.appendChild(el);
        });
        inner.appendChild(grid); c.appendChild(inner);
        updateSlotsUI();
        document.getElementById('pairsLeft').textContent = (vt.length / 2) + ' pares';
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
                el.className = 'w-14 h-20 rounded-lg border-2 border-primary flex items-center justify-center text-xl font-bold slot-item overflow-hidden';
                if (t.url) { el.style.backgroundImage = 'url(' + t.url + ')'; el.style.backgroundSize = 'cover'; }
                else { el.style.background = 'linear-gradient(145deg, #f5f0e8, #d4c4a8)'; el.textContent = t.symbol; el.style.color = '#2a1a0a'; }
            } else { el.className = 'w-14 h-20 rounded-lg slot-empty'; el.textContent = '+'; }
        }
    }

    function showMessage(msg) { var el = document.getElementById('message'); if (el) { el.textContent = msg; el.style.opacity = '1'; setTimeout(function() { el.style.opacity = '0'; }, 1800); } }

    function showZoomAndNote(photo) {
        var overlay = document.createElement('div'); overlay.className = 'zoom-overlay';
        overlay.innerHTML = '<img src="' + photo.url + '" class="zoom-image" alt="' + photo.name + '" onerror="this.style.display=\'none\'"><div class="zoom-note"><h3 style="color:#f2ca50;font-size:1.2em;font-weight:bold;margin-bottom:8px;">' + photo.name + '</h3><p style="color:white;">' + (photo.nota || 'Un rincon magico.') + '</p></div><button onclick="this.parentElement.remove()" style="margin-top:16px;padding:8px 24px;border-radius:12px;background:rgba(255,255,255,0.1);color:white;">Cerrar</button>';
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
        var totalStars = currentZone.levels.reduce(function(s, l) { return s + getStars(zid, l.num); }, 0);
        var maxStars = currentZone.levels.length * 3;
        var backFn = currentZone.country === 'argentina' ? 'UI.showArgentineZones()' : currentZone.country === 'mexico' ? 'UI.showMexicanZones()' : 'UI.showChileZones()';
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:#0b1512;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">';
        html += '<button onclick="' + backFn + '" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button>';
        html += '<span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">' + currentZone.icon + ' ' + currentZone.name + '</span>';
        html += '<button onclick="UI.showWorldMain()" style="margin-left:auto;color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button>';
        html += '</div><div>';
        currentZone.levels.forEach(function(l) {
            var u = isUnlocked(zid, l.num), s = getStars(zid, l.num);
            var miniKey = zid + '-' + l.num, mini = MINIGAMES[miniKey];
            html += '<div style="padding:16px;border-radius:12px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;';
            if (mini) {
                html += 'background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);">';
                html += '<div><span style="color:white;font-weight:bold;">' + mini.icon + ' ' + mini.name + '</span><p style="font-size:0.75em;color:rgba(168,85,247,0.8);">Minijuego especial</p></div>';
                // [FASE 3] Dispatcher de minijuego segun tipo.
                html += '<button onclick="event.stopPropagation();UI.showRewardedVideo(function(){UI.startMinigame(\'' + zid + '\',' + l.num + ');})" class="btn-video" style="padding:8px 16px;border-radius:12px;font-size:0.85em;">🎮 Jugar</button>';
            } else if (u) {
                html += 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);" onclick="UI.selectLevel(' + l.num + ')">';
                html += '<div><span style="color:white;font-weight:bold;">Nivel ' + l.num + '</span><p style="font-size:0.75em;color:rgba(255,255,255,0.5);">' + l.pairs + ' pares</p></div>';
                html += '<div style="color:#f2ca50;">' + (s > 0 ? '⭐'.repeat(s) + '☆'.repeat(3 - s) : '🔓') + '</div>';
            } else {
                html += 'opacity:0.4;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);">';
                html += '<div><span style="color:white;font-weight:bold;">Nivel ' + l.num + '</span><p style="font-size:0.75em;color:rgba(255,255,255,0.5);">' + l.pairs + ' pares</p></div>';
                html += '<div style="color:#f2ca50;">🔒</div>';
            }
            html += '</div>';
        });
        html += '</div></div>';
        document.getElementById('appRoot').innerHTML = html;
    }

    function selectLevel(n) {
        if (shouldStartTutorial() && n === 1 && currentZone.id === 'norte') { startTutorial(currentZone.id); return; }
        var originalLevel = currentZone.levels.find(function(l) { return l.num === n; });
        currentLevel = { num: originalLevel.num, pairs: originalLevel.pairs, zoneId: currentZone.id };
        document.getElementById('appRoot').innerHTML = '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0b1512;text-align:center;padding:32px;">' +
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
        var timeLeft = GameEngine.getTimeLeft(), pu = GameEngine.getPowerUps();
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:#0b1512;padding:12px;">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
        html += '<button onclick="UI.goBackFromGame()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button>';
        html += '<span style="color:#f2ca50;font-weight:bold;" id="pairsLeft">' + config.pairs + ' pares</span>';
        if (timeLeft > 0) html += '<span style="color:white;font-weight:bold;" id="timerDisplay">' + timeLeft + 's</span>';
        html += '</div>';
        html += '<div style="display:flex;gap:4px;margin-bottom:8px;justify-content:center;" id="slotsContainer">';
        for (var i = 0; i < 4; i++) html += '<div class="slot-empty" id="slot-' + i + '" style="width:56px;height:80px;">+</div>';
        html += '</div>';
        html += '<div style="flex:1;background:rgba(0,0,0,0.2);border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;min-height:300px;" id="boardContainer"></div>';
        if (!tutorialActive) {
            html += '<div style="display:flex;justify-content:center;gap:16px;margin-top:12px;">';
            html += '<button onclick="UI.useHint()" class="power-up-btn">💡<span class="power-up-badge" id="hintBadge">' + pu.hintUses + '</span></button>';
            html += '<button onclick="UI.useShuffle()" class="power-up-btn">🔀<span class="power-up-badge" id="shuffleBadge">' + pu.shuffleUses + '</span></button>';
            html += '<button onclick="UI.undoLastSelection()" class="power-up-btn">↩️<span class="power-up-badge" id="undoBadge">' + pu.undoUses + '</span></button>';
            html += '<button onclick="UI.toggleHaptic()" class="power-up-btn" id="hapticToggleBtn" title="Vibracion: ' + (hapticEnabled ? 'ON' : 'OFF') + '" style="font-size:0.9em;opacity:' + (hapticEnabled ? '1' : '0.5') + ';">' + (hapticEnabled ? '📳' : '📴') + '</button>';
            html += '</div>';
        }
        html += '<div style="text-align:center;margin-top:8px;height:16px;"><span id="message" style="font-size:0.75em;color:rgba(242,202,80,0.8);transition:opacity 0.3s;"></span></div></div>';
        document.getElementById('appRoot').innerHTML = html;
        renderBoard();
        if (tutorialActive) showTutorialOverlay();
    }

    function goBackFromGame() { GameEngine.stopTimer(); showZone(currentZone.id); }
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
                document.getElementById('appRoot').innerHTML =
                    '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0b1512;text-align:center;padding:32px;">' +
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

    function startMemoriceMinigame(zoneId, levelNum) {
        var mini = MINIGAMES[zoneId + '-' + levelNum]; if (!mini || !mini.photos) return;
        var shuffled = mini.photos.slice().sort(function() { return Math.random() - 0.5; });
        memoricePhotos = shuffled.slice(0, 6);
        memoriceCards = [];
        memoricePhotos.forEach(function(photo, idx) {
            memoriceCards.push({ url: photo.url, name: photo.name, pairId: idx, matched: false });
            memoriceCards.push({ url: photo.url, name: photo.name, pairId: idx, matched: false });
        });
        for (var i = memoriceCards.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var temp = memoriceCards[i]; memoriceCards[i] = memoriceCards[j]; memoriceCards[j] = temp; }
        memoriceFlipped = []; memoriceMatched = 0; memoriceLocked = false;
        if (!document.getElementById('memoriceModal')) {
            var modal = document.createElement('div'); modal.id = 'memoriceModal'; modal.className = 'memorice-modal';
            modal.innerHTML = '<div style="max-width:340px;width:100%;background:linear-gradient(145deg,rgba(23,34,30,0.95),rgba(11,21,18,0.95));border-radius:16px;border:1px solid rgba(242,202,80,0.3);padding:16px;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
                '<span style="color:#f2ca50;font-weight:bold;font-size:1.1em;" id="memoriceTitle">Memorice</span>' +
                '<button onclick="UI.closeMemorice()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">✕</button></div>' +
                '<div class="memorice-board" id="memoriceBoard"></div></div>';
            document.body.appendChild(modal);
        }
        document.getElementById('memoriceModal').style.display = 'flex';
        document.getElementById('memoriceTitle').textContent = mini.icon + ' ' + mini.name;
        renderMemoriceBoard();
    }

    function renderMemoriceBoard() {
        var board = document.getElementById('memoriceBoard'); if (!board) return; board.innerHTML = '';
        memoriceCards.forEach(function(card, index) {
            var el = document.createElement('div'); el.className = 'memorice-card';
            if (memoriceFlipped.indexOf(index) !== -1 || card.matched) {
                el.classList.add('flipped');
                el.innerHTML = '<img src="' + card.url + '" alt="' + card.name + '" onerror="this.style.display=\'none\'">';
            } else { el.innerHTML = '<span class="card-back">🪭</span>'; }
            if (card.matched) el.classList.add('matched');
            el.onclick = function() { flipMemoriceCard(index); };
            board.appendChild(el);
        });
    }

    function flipMemoriceCard(index) {
        if (memoriceLocked || memoriceFlipped.indexOf(index) !== -1 || memoriceCards[index].matched) return;
        memoriceFlipped.push(index); renderMemoriceBoard();
        if (memoriceFlipped.length === 2) {
            memoriceLocked = true;
            var a = memoriceFlipped[0], b = memoriceFlipped[1];
            if (memoriceCards[a].pairId === memoriceCards[b].pairId) {
                memoriceCards[a].matched = true; memoriceCards[b].matched = true;
                memoriceMatched++; memoriceFlipped = []; memoriceLocked = false;
                renderMemoriceBoard();
                if (memoriceMatched === 6) {
                    setTimeout(function() {
                        addCoins(10);
                        document.getElementById('memoriceModal').style.display = 'none';
                        showMessage('Memorice completado! +10 monedas');
                        // [FASE 2] Tracking de misiones: minigameComplete + coinsEarned.
                        var mgCompletadas = Misiones.registrarEvento('minigameComplete', 1);
                        mgCompletadas = mgCompletadas.concat(Misiones.registrarEvento('coinsEarned', 10));
                        mostrarMisionesCompletadas(mgCompletadas);
                        Misiones.registrarActividad();
                    }, 500);
                }
            } else { setTimeout(function() { memoriceFlipped = []; memoriceLocked = false; renderMemoriceBoard(); }, 800); }
        }
    }

    function closeMemorice() { document.getElementById('memoriceModal').style.display = 'none'; }

    function showWorldMain() {
        var ts = ZONES.reduce(function(s, z) { return s + z.levels.reduce(function(ss, l) { return ss + getStars(z.id, l.num); }, 0); }, 0);
        var cpChile = Math.round((getTotalStarsForCountry('chile') / 120) * 100);
        var cpArgentina = Math.round((getTotalStarsForCountry('argentina') / 120) * 100);
        var cpMexico = Math.round((getTotalStarsForCountry('mexico') / 120) * 100);
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:#0b1512;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="height:192px;overflow:hidden;position:relative;background:linear-gradient(to bottom, transparent, #0b1512), url(https://drive.google.com/thumbnail?id=1hsx1UaDia9i7oOLdeslGtGLwl0tqUP71&sz=w800) center/cover no-repeat;">';
        html += '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
        html += '<span style="font-size:3em;">🌎</span>';
        html += '<h1 class="text-glow" style="font-size:1.5em;font-weight:bold;color:#f2ca50;">WORLD TOUR</h1>';
        html += '<div style="background:rgba(242,202,80,0.1);padding:4px 12px;border-radius:16px;margin-top:8px;"><span style="color:#f2ca50;font-size:0.9em;font-weight:bold;">⭐ ' + ts + ' estrellas</span></div>';
        html += '</div></div><div style="padding:16px;">';
        // [FASE 2] Panel de misiones diarias + streak.
        html += Misiones.renderPanel();
        html += countryCard('🇨🇱','Chile',cpChile,'UI.showChileZones()');
        html += countryCard('🇦🇷','Argentina',cpArgentina,'UI.showArgentineZones()');
        html += countryCard('🇲🇽','Mexico',cpMexico,'UI.showMexicanZones()');
        html += '<div style="border-radius:16px;overflow:hidden;border:1px dashed rgba(255,255,255,0.2);opacity:0.6;background:rgba(255,255,255,0.02);margin-bottom:12px;"><div style="padding:16px;display:flex;align-items:center;gap:16px;"><span style="font-size:2.5em;filter:grayscale(1);">🇧🇷</span><div style="flex:1;"><h3 style="color:rgba(255,255,255,0.7);font-weight:bold;font-size:1.1em;">Brasil</h3><p style="font-size:0.75em;color:rgba(242,202,80,0.5);">8 regiones - 80 niveles</p><p style="font-size:0.75em;color:rgba(255,255,255,0.4);">Proximamente</p></div><span style="color:rgba(255,255,255,0.2);font-size:1.5em;">🔜</span></div></div>';
        html += '<button onclick="UI.showAlbum()" style="width:100%;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-weight:bold;margin-bottom:8px;">📸 ALBUM DE VIAJES</button>';
        html += '<button onclick="UI.showTienda()" style="width:100%;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-weight:bold;">🛒 TIENDA</button>';
        html += '</div></div>';
        document.getElementById('appRoot').innerHTML = html;
    }

    function countryCard(flag, name, progress, onclick) {
        return '<div onclick="' + onclick + '" style="border-radius:16px;overflow:hidden;border:2px solid rgba(242,202,80,0.3);background:linear-gradient(135deg, rgba(242,202,80,0.1), rgba(11,21,18,0.9));margin-bottom:12px;cursor:pointer;">' +
            '<div style="padding:16px;display:flex;align-items:center;gap:16px;"><span style="font-size:2.5em;">' + flag + '</span><div style="flex:1;"><h3 style="color:white;font-weight:bold;font-size:1.1em;">' + name + '</h3><p style="font-size:0.75em;color:rgba(242,202,80,0.7);">4 regiones - 40 niveles</p><div style="width:100%;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:8px;overflow:hidden;"><div style="height:100%;background:linear-gradient(to right, #f2ca50, #ff9f43);border-radius:2px;width:' + progress + '%;"></div></div><p style="font-size:0.75em;color:rgba(255,255,255,0.5);margin-top:4px;">' + progress + '% completado</p></div><span style="color:rgba(255,255,255,0.3);font-size:1.5em;">→</span></div></div>';
    }

    function showChileZones() { showCountryZones('chile','🇨🇱 CHILE'); }
    function showArgentineZones() { showCountryZones('argentina','🇦🇷 ARGENTINA'); }
    function showMexicanZones() { showCountryZones('mexico','🇲🇽 MEXICO'); }

    function showCountryZones(country, title) {
        var zones = ZONES.filter(function(z) { return z.country === country; });
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:#0b1512;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><button onclick="UI.showWorldMain()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button><span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">' + title + '</span><button onclick="UI.showWorldMain()" style="margin-left:auto;color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        zones.forEach(function(z) {
            html += '<div onclick="UI.showZone(\'' + z.id + '\')" style="height:128px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);background:linear-gradient(135deg, rgba(255,255,255,0.05), transparent);display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;">';
            html += '<span style="font-size:2em;">' + z.icon + '</span><span style="color:white;font-weight:bold;font-size:0.9em;">' + z.name + '</span></div>';
        });
        html += '</div></div>';
        document.getElementById('appRoot').innerHTML = html;
    }

    function showAlbum() {
        var html = '<div style="height:100%;display:flex;flex-direction:column;background:#0b1512;padding:16px;overflow-y:auto;padding-bottom:70px;">';
        html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;"><button onclick="UI.showWorldMain()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button><span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">🌎 Album de Viajes</span><button onclick="UI.showWorldMain()" style="margin-left:auto;color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button></div>';
        var countries = [
            { flag:'🇨🇱', name:'Chile', zones:['norte','centro','sur','austral'] },
            { flag:'🇦🇷', name:'Argentina', zones:['argentina-norte','argentina-centro','argentina-patagonia','argentina-litoral'] },
            { flag:'🇲🇽', name:'Mexico', zones:['mexico-norte','mexico-centro','mexico-sur','mexico-caribe'] }
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
        document.getElementById('appRoot').innerHTML = html;
    }

    function showTienda() {
        document.getElementById('appRoot').innerHTML = '<div style="height:100%;display:flex;flex-direction:column;background:#0b1512;padding:16px;overflow-y:auto;padding-bottom:70px;">' +
            '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><button onclick="UI.showWorldMain()" style="color:white;background:none;border:none;font-size:1.5em;cursor:pointer;">←</button><span style="font-size:1.2em;font-weight:bold;color:#f2ca50;">🛒 Tienda</span><span style="margin-left:auto;font-size:0.9em;color:rgba(242,202,80,0.8);">💰 ' + coins + ' monedas</span><button onclick="UI.showWorldMain()" style="color:#f2ca50;background:none;border:none;font-size:1.5em;cursor:pointer;" title="Volver al inicio">🏠</button></div>' +
            '<p style="font-size:0.75em;color:rgba(255,255,255,0.5);margin-bottom:16px;">Compra power-ups para ayudarte.</p>' +
            '<div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div><span style="color:white;font-weight:bold;">💡 Pista extra</span></div><button onclick="UI.comprarPowerUp(\'hint\')" style="padding:8px 16px;border-radius:8px;background:rgba(242,202,80,0.2);color:#f2ca50;font-weight:bold;border:none;cursor:pointer;">10 🪙</button></div>' +
            '<div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div><span style="color:white;font-weight:bold;">🔀 Mezclar extra</span></div><button onclick="UI.comprarPowerUp(\'shuffle\')" style="padding:8px 16px;border-radius:8px;background:rgba(242,202,80,0.2);color:#f2ca50;font-weight:bold;border:none;cursor:pointer;">10 🪙</button></div>' +
            '<div style="padding:16px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;"><div><span style="color:white;font-weight:bold;">↩️ Deshacer extra</span></div><button onclick="UI.comprarPowerUp(\'undo\')" style="padding:8px 16px;border-radius:8px;background:rgba(242,202,80,0.2);color:#f2ca50;font-weight:bold;border:none;cursor:pointer;">10 🪙</button></div></div>';
    }

    function comprarPowerUp(tipo) { if (coins < 10) { showMessage('Monedas insuficientes'); return; } coins -= 10; localStorage.setItem('coins', coins); GameEngine.addPowerUp(tipo, 1); showTienda(); }

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

    function showSplash() {
        document.getElementById('appRoot').innerHTML = '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:black;text-align:center;">' +
            '<span style="font-size:0.9em;color:rgba(242,202,80,0.8);letter-spacing:0.3em;margin-bottom:16px;">Outfit</span>' +
            '<h1 class="text-glow" style="font-size:2.5em;font-weight:bold;color:#f2ca50;line-height:1.2;">Descubre<br/>America</h1>' +
            '<div style="height:48px;width:1px;background:linear-gradient(to bottom, rgba(242,202,80,0.6), transparent);margin:16px auto;"></div>' +
            '<p style="font-size:0.9em;color:rgba(255,255,255,0.5);letter-spacing:0.3em;">World Tour</p>' +
            '<p style="font-size:0.75em;color:rgba(242,202,80,0.6);margin-top:32px;">Viaje Meditativo</p></div>';
        setTimeout(showWorldMain, 4000);
    }

    return Object.freeze({
        showSplash: showSplash, showWorldMain: showWorldMain, showChileZones: showChileZones,
        showArgentineZones: showArgentineZones, showMexicanZones: showMexicanZones,
        showZone: showZone, selectLevel: selectLevel, startGameWithDifficulty: startGameWithDifficulty,
        goBackFromGame: goBackFromGame, useShuffle: useShuffle, useHint: useHint, undoLastSelection: undoLastSelection,
        showTienda: showTienda, showAlbum: showAlbum,
        showRewardedVideo: showRewardedVideo, closeRewardModal: closeRewardModal,
        simulateRewardedVideo: simulateRewardedVideo,
        closeVictory: closeVictory, nextLevel: nextLevel,
        startMemoriceMinigame: startMemoriceMinigame, closeMemorice: closeMemorice,
        startMinigame: startMinigame,
        startTriviaMinigame: startTriviaMinigame, closeTrivia: closeTrivia,
        answerTrivia: answerTrivia, nextTriviaQuestion: nextTriviaQuestion,
        skipTutorial: skipTutorial,
        toggleHaptic: toggleHaptic,
        reclamarMisiones: reclamarMisiones,
        reclamarBonusStreak: reclamarBonusStreak
    });
})();

UI.showSplash();
