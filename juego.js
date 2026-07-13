// ========== SDK DE PUBLICIDAD GPT ==========
window.googletag = window.googletag || { cmd: [] };
var ADMOB_CONFIG = { banner: '/6499/example/banner', rewarded: '/6499/example/rewarded', interstitial: '/6499/example/interstitial' };
var bannerSlot, rewardedSlot, interstitialSlot;
googletag.cmd.push(function() {
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
    bannerSlot = googletag.defineSlot(ADMOB_CONFIG.banner, [[320, 50], [300, 50]], 'ad-banner');
    if (bannerSlot) bannerSlot.addService(googletag.pubads());
    rewardedSlot = googletag.defineOutOfPageSlot(ADMOB_CONFIG.rewarded);
    if (rewardedSlot) rewardedSlot.addService(googletag.pubads());
    interstitialSlot = googletag.defineOutOfPageSlot(ADMOB_CONFIG.interstitial);
    if (interstitialSlot) interstitialSlot.addService(googletag.pubads());
    if (bannerSlot) googletag.display('ad-banner');
});

// ========== NUCLEO PROTEGIDO (GameEngine) ==========
var GameEngine = (function() {
    var tiles = [], slots = [], score = 0, combo = 1, selectedTileIdx = null;
    var MAX_SLOTS = 4, currentLevelConfig = null, difficulty = 'normal';
    var timerInterval = null, timeLeft = -1;
    var hintUses = 3, shuffleUses = 3, undoUses = 3, onStateChange = null;
    var audioCtx;

    function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
    function playTone(freq, duration, type, vol) {
        if (!audioCtx) return;
        var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = type || 'sine'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol || 0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + duration);
    }
    var sound = {
        select: function() { playTone(660, 0.1, 'sine', 0.12); },
        // [FASE 1] Match con pitch ascendente segun combo (1 semitono por match consecutivo).
        match: function(comboLevel) {
            var cl = comboLevel || 1;
            // Multiplicador de frecuencia: 2^(semitonos/12). 1 semitono por combo.
            var mult = Math.pow(2, Math.min(cl - 1, 12) / 12);
            playTone(523 * mult, 0.12);
            setTimeout(function() { playTone(659 * mult, 0.12); }, 80);
            setTimeout(function() { playTone(784 * mult, 0.18); }, 160);
        },
        // [FASE 1] Match bonus: acorde dorado mas brillante.
        matchBonus: function(comboLevel) {
            var cl = comboLevel || 1;
            var mult = Math.pow(2, Math.min(cl - 1, 12) / 12);
            [659, 880, 1047, 1319].forEach(function(f, i) {
                setTimeout(function() { playTone(f * mult, 0.18, 'triangle', 0.16); }, i * 70);
            });
        },
        error: function() { playTone(180, 0.3, 'square', 0.06); },
        victory: function() { [523,659,784,1047].forEach(function(f,i) { setTimeout(function() { playTone(f, 0.4, 'sine', 0.3); }, i*200); }); },
        shuffle: function() { playTone(440, 0.2, 'triangle', 0.12); },
        hint: function() { playTone(880, 0.15, 'sine', 0.18); },
        // [FASE 6] Sonido de revelar ficha: dos tonos ascendentes suaves.
        reveal: function() {
            playTone(440, 0.08, 'sine', 0.10);
            setTimeout(function() { playTone(660, 0.10, 'sine', 0.12); }, 60);
        }
    };

    // [FIX BUG #10] Solo considera "encima" a una ficha en la MISMA col/row (capa superior).
    function isTileFree(tile, activeTiles) {
        var above = activeTiles.find(function(t) {
            return t.layer === tile.layer + 1 && t.col === tile.col && t.row === tile.row;
        });
        if (above) return false;
        var left = activeTiles.find(function(t) { return t.layer === tile.layer && t.row === tile.row && t.col === tile.col - 1; });
        var right = activeTiles.find(function(t) { return t.layer === tile.layer && t.row === tile.row && t.col === tile.col + 1; });
        return !(left && right);
    }
    function updateBlocked() {
        var active = tiles.filter(function(t) { return !t.matched && !t.inSlot; });
        tiles.forEach(function(t) { if (t.matched || t.inSlot) { t.blocked = false; return; } t.blocked = !isTileFree(t, active); });
    }
    // [FASE 6] Fichas boca abajo: desde nivel 4 en normal y dificil. Nunca en facil.
    function shouldBeFaceDown(levelNum) {
        if (difficulty === 'facil') return false;
        if (levelNum < 4) return false;
        if (difficulty === 'dificil') return Math.random() < 0.55;
        if (difficulty === 'normal') return levelNum >= 6 ? Math.random() < 0.45 : Math.random() < 0.3;
        return false;
    }
    function createTiles(zonePhotos, traditionalTilesList) {
        var attempts = 0;
        while (attempts < 10) {
            tiles = [];
            var totalPairs = Math.max(1, Math.floor(currentLevelConfig.pairs));
            var pairItems = [];
            var maxPhotos = (currentLevelConfig.num <= 3) ? Math.min(4, zonePhotos.length) : zonePhotos.length;
            var usedPhotos = zonePhotos.slice().sort(function() { return Math.random() - 0.5; }).slice(0, maxPhotos);
            for (var i = 0; i < Math.min(totalPairs, usedPhotos.length); i++) {
                var photo = usedPhotos[i];
                var bigUrl = photo.url.replace('sz=w400', 'sz=w600');
                pairItems.push({ name: photo.name, url: bigUrl, zone: photo.zone, nota: photo.nota, type: 'photo' });
            }
            var tradIdx = 0;
            while (pairItems.length < totalPairs) {
                var trad = traditionalTilesList[tradIdx % traditionalTilesList.length];
                pairItems.push({ name: trad.name, symbol: trad.symbol, color: trad.color, type: 'ceramic' });
                tradIdx++;
            }
            pairItems.forEach(function(item, pid) {
                var fd = shouldBeFaceDown(currentLevelConfig.num), bonus = difficulty === 'dificil' && Math.random() < 0.2;
                tiles.push({ name: item.name, url: item.url, zone: item.zone, nota: item.nota, symbol: item.symbol, color: item.color, type: item.type, pid: pid, matched: false, blocked: false, inSlot: false, col: 0, row: 0, layer: 0, faceDown: fd, revealed: !fd, bonus: bonus });
                tiles.push({ name: item.name, url: item.url, zone: item.zone, nota: item.nota, symbol: item.symbol, color: item.color, type: item.type, pid: pid, matched: false, blocked: false, inSlot: false, col: 0, row: 0, layer: 0, faceDown: fd, revealed: !fd, bonus: bonus });
            });
            var count = {}; tiles.forEach(function(t) { count[t.pid] = (count[t.pid] || 0) + 1; });
            var allPairsOk = Object.values(count).every(function(c) { return c === 2; });
            if (allPairsOk && tiles.length % 2 === 0) break;
            attempts++;
        }
        layoutTiles(tiles);
        updateBlocked();
        // [FEATURE #2] Asegurar que el tablero inicial tenga al menos una pareja jugable.
        ensureSolvable();
    }

    // [FEATURE #2] Re-layout hasta que exista al menos una pareja jugable. Si tras 30 intentos
    // no se logra, fuerza posiciones especificas para garantizar jugabilidad.
    function ensureSolvable() {
        var tries = 0;
        while (!hasAnyPlayablePair() && tries < 30) {
            for (var i = tiles.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = tiles[i]; tiles[i] = tiles[j]; tiles[j] = tmp;
            }
            layoutTiles(tiles);
            updateBlocked();
            tries++;
        }
        // Ultimo recurso: si aun no hay pareja libre, colocar la primera pareja en posiciones libres.
        if (!hasAnyPlayablePair()) forceFirstPairFree();
    }

    // [FEATURE #2] Forzar que al menos una pareja quede en posiciones libres (capa 0, fila 0).
    function forceFirstPairFree() {
        var firstPair = tiles.filter(function(t) { return !t.matched; });
        if (firstPair.length < 2) return;
        var pid0 = firstPair[0].pid;
        var pairIdxs = [];
        tiles.forEach(function(t, i) { if (t.pid === pid0 && !t.matched) pairIdxs.push(i); });
        if (pairIdxs.length < 2) return;
        // Mover las dos fichas de la primera pareja a col=0 y col=5 (extremos), fila 0, capa 0
        tiles[pairIdxs[0]].col = 0; tiles[pairIdxs[0]].row = 0; tiles[pairIdxs[0]].layer = 0;
        tiles[pairIdxs[1]].col = 5; tiles[pairIdxs[1]].row = 0; tiles[pairIdxs[1]].layer = 0;
        updateBlocked();
    }

    // [FIX BUG #11] Layout separado en funcion para reutilizar en useShuffle.
    // [FASE 6] Layout escalable: 2, 3 o 4 capas segun el tamanio del nivel.
    // 6 columnas en la base, decreciendo en capas superiores.
    function layoutTiles(tileArr) {
        var totalTiles = tileArr.length, colsBase = 6;
        var tilesLayer0, tilesLayer1, tilesLayer2, tilesLayer3;
        if (totalTiles > 60) {
            // Niveles muy grandes: 4 capas (50% / 25% / 15% / 10%)
            tilesLayer0 = Math.floor(totalTiles * 0.50);
            tilesLayer1 = Math.floor(totalTiles * 0.25);
            tilesLayer2 = Math.floor(totalTiles * 0.15);
            tilesLayer3 = totalTiles - tilesLayer0 - tilesLayer1 - tilesLayer2;
        } else if (totalTiles > 30) {
            // Niveles medianos: 3 capas (60% / 28% / 12%)
            tilesLayer0 = Math.floor(totalTiles * 0.60);
            tilesLayer1 = Math.floor(totalTiles * 0.28);
            tilesLayer2 = totalTiles - tilesLayer0 - tilesLayer1;
            tilesLayer3 = 0;
        } else {
            // Niveles pequenos: 2 capas (70% / 30%)
            tilesLayer0 = Math.floor(totalTiles * 0.70);
            tilesLayer1 = totalTiles - tilesLayer0;
            tilesLayer2 = 0;
            tilesLayer3 = 0;
        }
        var colsLayer1 = 4, offsetCol1 = Math.floor((colsBase - colsLayer1) / 2);
        var colsLayer2 = 3, offsetCol2 = Math.floor((colsBase - colsLayer2) / 2);
        var colsLayer3 = 2, offsetCol3 = Math.floor((colsBase - colsLayer3) / 2);
        var idx = 0;
        for (var k = 0; k < tilesLayer0; k++) { tileArr[idx].col = k % colsBase; tileArr[idx].row = Math.floor(k / colsBase); tileArr[idx].layer = 0; idx++; }
        for (var m = 0; m < tilesLayer1; m++) { tileArr[idx].col = offsetCol1 + (m % colsLayer1); tileArr[idx].row = Math.floor(m / colsLayer1); tileArr[idx].layer = 1; idx++; }
        for (var n = 0; n < tilesLayer2; n++) { tileArr[idx].col = offsetCol2 + (n % colsLayer2); tileArr[idx].row = Math.floor(n / colsLayer2); tileArr[idx].layer = 2; idx++; }
        for (var p = 0; p < tilesLayer3; p++) { tileArr[idx].col = offsetCol3 + (p % colsLayer3); tileArr[idx].row = Math.floor(p / colsLayer3); tileArr[idx].layer = 3; idx++; }
    }

    // [FIX BUG #1] Calculo correcto del shift del slot.idx tras eliminar 2 fichas.
    function checkForMatchInSlots() {
        if (slots.length < 2) return;
        for (var i = 0; i < slots.length; i++) {
            for (var j = i + 1; j < slots.length; j++) {
                if (slots[i].pid === slots[j].pid && slots[i].idx !== slots[j].idx) {
                    var a = slots[i], b = slots[j];
                    sound.match();
                    var idxA = a.idx, idxB = b.idx;
                    // Marcar fichas como matched antes de splicear [FIX BUG #8]
                    tiles[idxA].matched = true;
                    tiles[idxB].matched = true;
                    // Splice mayor primero (evita corrimiento prematuro)
                    if (idxA > idxB) { tiles.splice(idxA, 1); tiles.splice(idxB, 1); }
                    else { tiles.splice(idxB, 1); tiles.splice(idxA, 1); }
                    var removed = [idxA, idxB].sort(function(x, y) { return x - y; });
                    // [FIX BUG #1] Computar shift contra el idx ORIGINAL, no el ya decrementado.
                    slots.forEach(function(slot) {
                        if (slot === a || slot === b) return;
                        var orig = slot.idx;
                        var shift = 0;
                        if (orig > removed[0]) shift++;
                        if (orig > removed[1]) shift++;
                        slot.idx = orig - shift;
                    });
                    if (i > j) { slots.splice(i, 1); slots.splice(j, 1); }
                    else { slots.splice(j, 1); slots.splice(i, 1); }
                    selectedTileIdx = slots.length > 0 ? slots[slots.length - 1].idx : null;
                    var multiplier = (a.bonus && b.bonus) ? 2 : 1;
                    var pointsGained = (100 + combo * 50) * multiplier;
                    score += pointsGained;
                    var comboBefore = combo;
                    combo++;
                    if (timeLeft > 0) { timeLeft += 3; if (timeLeft > 99) timeLeft = 99; }
                    updateBlocked();
                    // [FASE 1] Sonido segun si es bonus o no, con pitch ascendente por combo.
                    if (a.bonus && b.bonus) sound.matchBonus(comboBefore);
                    else sound.match(comboBefore);
                    // [FIX BUG #3] Calcular si fue match final y pasarlo al UI.
                    var isFinalMatch = tiles.filter(function(t) { return !t.matched && !t.inSlot; }).length === 0;
                    // [FASE 1] Pasar al UI combo, puntos, posiciones de slots y flag bonus para efectos visuales.
                    if (onStateChange) onStateChange('match', {
                        a: a, b: b,
                        isFinalMatch: isFinalMatch,
                        combo: comboBefore,
                        points: pointsGained,
                        isBonus: !!(a.bonus && b.bonus),
                        slotAPos: i, slotBPos: j
                    });
                    if (isFinalMatch) {
                        if (timerInterval) clearInterval(timerInterval);
                        sound.victory();
                        if (onStateChange) onStateChange('victory', { score: score, combo: combo });
                    }
                    return;
                }
            }
        }
        // [FIX BUG #6] Mensaje mas claro cuando slots estan llenos. Resetea combo.
        if (slots.length >= MAX_SLOTS) { sound.error(); combo = 1; if (onStateChange) onStateChange('slotsfull'); }
    }
    function startTimer() { if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(function() { timeLeft--; if (onStateChange) onStateChange('timer', { timeLeft: timeLeft }); if (timeLeft <= 0) { clearInterval(timerInterval); if (onStateChange) onStateChange('timeout'); } }, 1000); }

    // [FIX BUG #11] Verifica que al menos una pareja de fichas libres exista.
    function hasAnyPlayablePair() {
        var free = tiles.filter(function(t) { return !t.matched && !t.inSlot && !t.blocked; });
        for (var i = 0; i < free.length; i++) {
            for (var j = i + 1; j < free.length; j++) {
                if (free[i].pid === free[j].pid) return true;
            }
        }
        return false;
    }

    // [FEATURE #1] Verifica si el tablero esta insoluble: ninguna pareja libre jugable
    // Y los slots estan llenos sin posible match. Solo en ese caso se considera atascado.
    function isBoardStuck() {
        // Si no hay fichas activas, no esta atascado (esta completo).
        var active = tiles.filter(function(t) { return !t.matched && !t.inSlot; });
        if (active.length === 0) return false;
        // Si hay pareja libre jugable, no esta atascado.
        if (hasAnyPlayablePair()) return false;
        // Si hay pareja entre los slots actuales, no esta atascado (el usuario puede completar el match).
        for (var i = 0; i < slots.length; i++) {
            for (var j = i + 1; j < slots.length; j++) {
                if (slots[i].pid === slots[j].pid) return false;
            }
        }
        // Si los slots no estan llenos (< MAX_SLOTS), el usuario aun puede agregar otra ficha.
        // No consideramos esto atascado, porque el usuario puede explorar.
        if (slots.length < MAX_SLOTS) return false;
        // Si llegamos aqui: no hay pareja libre, no hay pareja en slots, y slots estan llenos.
        return true;
    }

    // [FEATURE #1] Auto-shuffle gratuito cuando el tablero esta insoluble.
    // No consume use de shuffle del usuario. Retorna true si hizo auto-shuffle.
    function autoUnstickIfNeeded() {
        if (!isBoardStuck()) return false;
        // Resetear slots tambien (fichas en slots no hacen pareja).
        tiles.forEach(function(t) { t.inSlot = false; });
        slots = []; selectedTileIdx = null;
        var tries = 0;
        do {
            for (var i = tiles.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = tiles[i]; tiles[i] = tiles[j]; tiles[j] = tmp;
            }
            layoutTiles(tiles);
            updateBlocked();
            tries++;
        } while (!hasAnyPlayablePair() && tries < 30);
        if (!hasAnyPlayablePair()) forceFirstPairFree();
        sound.shuffle();
        if (onStateChange) onStateChange('autoshuffle');
        return true;
    }

    // [FEATURE #3] Busca y retorna los indices de la primera pareja libre jugable.
    function findHintPair() {
        var free = [];
        tiles.forEach(function(t, i) {
            if (!t.matched && !t.inSlot && !t.blocked) free.push(i);
        });
        for (var i = 0; i < free.length; i++) {
            for (var j = i + 1; j < free.length; j++) {
                if (tiles[free[i]].pid === tiles[free[j]].pid) {
                    return { a: free[i], b: free[j], name: tiles[free[i]].name };
                }
            }
        }
        return null;
    }

    return Object.freeze({
        init: function(config, zonePhotos, traditionalTilesList) {
            initAudio(); currentLevelConfig = config; difficulty = config.difficulty || 'normal';
            slots = []; score = 0; combo = 1; selectedTileIdx = null;
            if (timerInterval) clearInterval(timerInterval);
            timeLeft = (difficulty === 'dificil') ? config.pairs * 6 : -1;
            hintUses = config.hintUses || 3; shuffleUses = config.shuffleUses || 3; undoUses = config.undoUses || 3;
            createTiles(zonePhotos, traditionalTilesList);
            if (timeLeft > 0) startTimer();
        },
        getTiles: function() { return tiles; },
        getSlots: function() { return slots; },
        getScore: function() { return score; },
        getSelectedTileIdx: function() { return selectedTileIdx; },
        getTimeLeft: function() { return timeLeft; },
        getPowerUps: function() { return { hintUses: hintUses, shuffleUses: shuffleUses, undoUses: undoUses }; },
        addPowerUp: function(type, amount) { amount = amount || 1; if (type === 'hint') hintUses += amount; else if (type === 'shuffle') shuffleUses += amount; else if (type === 'undo') undoUses += amount; },
        onTileClick: function(index) {
            var t = tiles[index]; if (!t || t.matched || t.blocked || t.inSlot) return false;
            if (slots.length >= MAX_SLOTS) return false;
            // [FASE 6] Si la ficha esta boca abajo, NO mandarla al slot (la UI la revela primero).
            // Retornar false para que la UI sepa que no se proceso, y revelar manualmente.
            if (t.faceDown && !t.revealed) {
                t.revealed = true;
                return false;  // la UI debe manejar el volteo visual
            }
            sound.select(); t.inSlot = true;
            slots.push({ name: t.name, url: t.url, zone: t.zone, nota: t.nota, symbol: t.symbol, color: t.color, type: t.type, pid: t.pid, idx: index, bonus: t.bonus });
            selectedTileIdx = index; updateBlocked(); checkForMatchInSlots();
            // [FEATURE #1] Tras cada click, verificar si el tablero quedo insoluble y auto-shuffle.
            autoUnstickIfNeeded();
            if (onStateChange) onStateChange('boardChanged'); return true;
        },
        // [FIX BUG #2] useShuffle ahora reinicia inSlot, mezcla orden y re-layout sin superposiciones.
        // [FASE 1] Resetea combo al hacer shuffle.
        useShuffle: function() {
            if (shuffleUses <= 0) return false;
            shuffleUses--; sound.shuffle(); combo = 1;
            // 1. Resetear inSlot de TODAS las fichas (incluidas las que estaban en slots).
            tiles.forEach(function(t) { t.inSlot = false; t.matched = false; });
            slots = []; selectedTileIdx = null;
            // 2. Fisher-Yates shuffle del orden de fichas.
            for (var i = tiles.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = tiles[i]; tiles[i] = tiles[j]; tiles[j] = temp;
            }
            // 3. Reasignar posiciones con la misma logica de createTiles.
            layoutTiles(tiles);
            updateBlocked();
            // 4. Reintentar hasta 20 veces hasta que haya al menos una pareja jugable.
            var tries = 0;
            while (!hasAnyPlayablePair() && tries < 20) {
                for (var i2 = tiles.length - 1; i2 > 0; i2--) {
                    var j2 = Math.floor(Math.random() * (i2 + 1));
                    var temp2 = tiles[i2]; tiles[i2] = tiles[j2]; tiles[j2] = temp2;
                }
                layoutTiles(tiles);
                updateBlocked();
                tries++;
            }
            if (onStateChange) onStateChange('boardChanged'); return true;
        },
        // [FEATURE #3] useHint ahora emite los indices de la pareja sugerida para resalte visual.
        useHint: function() {
            if (hintUses <= 0) return false;
            var hint = findHintPair();
            if (!hint) {
                // No hay pareja libre: disparar auto-shuffle gratuito.
                autoUnstickIfNeeded();
                if (onStateChange) onStateChange('hint', { name: 'Tablero mezclado', noPair: true });
                return true;
            }
            hintUses--; sound.hint();
            if (onStateChange) onStateChange('hint', { name: hint.name, idxA: hint.a, idxB: hint.b });
            return true;
        },
        // [FASE 1] undoLastSelection resetea combo (rompe la racha).
        undoLastSelection: function() { if (slots.length === 0) return false; sound.select(); combo = 1; var last = slots.pop(); if (tiles[last.idx]) tiles[last.idx].inSlot = false; selectedTileIdx = slots.length > 0 ? slots[slots.length - 1].idx : null; updateBlocked(); if (onStateChange) onStateChange('boardChanged'); return true; },
        setOnStateChange: function(callback) { onStateChange = callback; },
        isGameOver: function() { return tiles.filter(function(t) { return !t.matched && !t.inSlot; }).length === 0; },
        getCombo: function() { return combo; },
        // [FASE 6] Reproduce el sonido de revelar ficha (para fichas boca abajo).
        playRevealSound: function() { sound.reveal(); },
        stopTimer: function() { if (timerInterval) clearInterval(timerInterval); },
        // [FEATURE #1] Expuesto para que la UI pueda verificar y mostrar aviso.
        isBoardStuck: function() { return isBoardStuck(); },
        // [FEATURE #3] Expuesto para que la UI pueda pedir pareja hint sin consumir uso.
        findHintPair: function() { return findHintPair(); },
        // [FEATURE #1] Auto-shuffle publico (por si la UI quiere dispararlo manualmente).
        autoUnstick: function() { return autoUnstickIfNeeded(); }
    });
})();
