# Informe de Errores — Mahjong World Tour

Análisis exhaustivo del código de `https://artjmarcos.github.io/MahjongWT/`.

Se revisaron los archivos: `index.html`, `juego.js`, `ui.js`, `datos.js` y `sw.js`.

---

## Resumen ejecutivo

Se detectaron **12 errores** entre críticos y menores. Los dos bugs que reportaste (`fichas que se pegan` y `banner de siguiente nivel que no funciona`) están confirmados y se explica su causa raíz a continuación. Además se encontraron otros 10 errores adicionales que afectan jugabilidad, anuncios y experiencia de usuario.

| # | Bug | Severidad | Archivo | Línea aprox. |
|---|-----|-----------|---------|--------------|
| 1 | Cálculo incorrecto de `slot.idx` tras un match → fichas pegadas | **CRÍTICO** | juego.js | 104–108 |
| 2 | `useShuffle` no reinicia `inSlot` y superpone fichas | **CRÍTICO** | juego.js | 156 |
| 3 | Zoom-overlay tapa el modal de victoria (banner "Siguiente nivel") | **CRÍTICO** | ui.js + index.html | 130–135 / 78 |
| 4 | SDK de anuncios GPT nunca se carga (falta `<script>` en index.html) | **ALTO** | index.html | — |
| 5 | `bannerSlot` / `interstitialSlot` quedan `undefined` → llamadas fallidas | **ALTO** | juego.js | 5–11 |
| 6 | Cuando 4 slots están llenos sin match, el juego se queda stuck sin aviso claro | **MEDIO** | juego.js | 126 |
| 7 | Doble evento `click` + `touchend` puede disparar dos veces `onTileClick` en móviles | **MEDIO** | ui.js | 88–106 |
| 8 | `tile.matched` nunca se setea a `true` (las fichas se eliminan con `splice`, no con flag) | **MEDIO** | juego.js | 118, 160 |
| 9 | `.bonus-tile` no tiene estilos CSS definidos (las fichas bonus no se distinguen) | **BAJO** | index.html / ui.js | — |
| 10 | `isTileFree()` usa bloqueo 3x3 demasiado agresivo para fichas superiores | **BAJO** | juego.js | 40–46 |
| 11 | No hay verificación de solvencia del tablero (puede quedar insoluble) | **BAJO** | juego.js | createTiles/useShuffle |
| 12 | Tutorial no avanza mensajes: solo muestra 1 mensaje y se cierra tras 5 clics | **BAJO** | ui.js | 253–263 |

---

## Bug #1 — Cálculo incorrecto de `slot.idx` (CAUSA de "fichas pegadas")

**Archivo:** `juego.js`, dentro de `checkForMatchInSlots()`.

**Código original (líneas 104–108):**
```js
var removed = [idxA, idxB].sort(function(x, y) { return x - y; });
slots.forEach(function(slot) {
    if (slot.idx > removed[0]) slot.idx--;
    if (slot.idx > removed[1]) slot.idx--;
});
```

**El bug:** La segunda comparación `slot.idx > removed[1]` usa el valor **ya decrementado** en la primera línea. Esto resta 1 cuando debería restar 2 (o viceversa), dejando el índice apuntando a la ficha equivocada.

**Traza del error (ejemplo real):**
- `tiles = [A(0), B(1), C(2), D(3), E(4)]`
- Slots: `[A(idx=0), D(idx=3), C(idx=2)]`
- `A` y `C` matchean (mismo `pid`). `removed = [0, 2]`.
- Se hace `splice(2,1)` → `[A,B,D,E]`, luego `splice(0,1)` → `[B,D,E]`.
- Slot de `D` (idx=3): `3 > 0` → `idx=2`. Luego `2 > 2` → no resta. **Resultado: idx=2**.
- Pero `D` ahora está en el índice **1** del array, no en el 2. El slot apunta a `E`.

**Consecuencia en cascada:**
1. Cuando el usuario hace `undoLastSelection()`, el motor hace `tiles[last.idx].inSlot = false` → desmarca la ficha equivocada (E), dejando a `D` marcada como `inSlot=true` para siempre.
2. `D` queda invisible e inclickeable: ni está en el tablero (porque `inSlot=true` la excluye de `vt`) ni en un slot (porque se vació).
3. En el siguiente match, dos fichas con el mismo `pid` pueden tener el mismo `idx` (ambas = 2), por lo que `slots[i].idx !== slots[j].idx` las rechaza como match, aunque sean pareja.

**Fix aplicado:**
```js
slots.forEach(function(slot) {
    var orig = slot.idx;
    var shift = 0;
    if (orig > removed[0]) shift++;
    if (orig > removed[1]) shift++;
    slot.idx = orig - shift;
});
```

---

## Bug #2 — `useShuffle` rompe el tablero (CAUSA secundaria de "fichas pegadas")

**Archivo:** `juego.js`, línea 156.

**Código original:**
```js
useShuffle: function() {
    if (shuffleUses <= 0) return false;
    shuffleUses--; sound.shuffle();
    tiles.forEach(function(t) {
        t.col = Math.floor(Math.random() * 6);
        t.row = Math.floor(Math.random() * Math.ceil(tiles.length / 6));
    });
    slots = []; selectedTileIdx = null;
    updateBlocked();
    if (onStateChange) onStateChange('boardChanged');
    return true;
}
```

**Tres problemas:**

1. **No resetea `inSlot`**: las fichas que estaban en slots siguen con `inSlot=true`, pero `slots=[]` se vacía. Quedan **permanentemente inclickeables** (el handler de `onTileClick` rechaza `t.inSlot`).
2. **Posiciones aleatorias pueden colisionar**: `Math.random()` para `col` y `row` puede asignar la misma posición a múltiples fichas. Visualmente se superponen y las de abajo son inclicqueables.
3. **No respeta capas (layer)**: las fichas de capa 1 conservan `layer=1` pero su `col`/`row` queda aleatorio, rompiendo la lógica de `isTileFree` (que busca fichas superiores por col/row adyacente).

**Fix aplicado:** reinicia `inSlot=false` para todas las fichas, las mezcla con Fisher–Yates y reasigna posiciones usando la misma lógica de `createTiles` (capa 0 con 6 columnas, capa 1 con 4 columnas desplazadas).

---

## Bug #3 — Zoom-overlay tapa el modal de victoria (CAUSA de "banner siguiente nivel no funciona")

**Archivos:** `index.html` (z-index del modal) + `ui.js` (orden de eventos).

**Causa raíz:**
- En `index.html`, `#victoryModal` tiene `z-index: 200`.
- En `index.html`/`ui.js`, `.zoom-overlay` (la ficha ampliada con la nota) tiene `z-index: 400`.
- En `juego.js → checkForMatchInSlots()`, el evento `'match'` se dispara **antes** que el evento `'victory'`.
- El handler de `'match'` llama a `showZoomAndNote(photo)` que crea un overlay que **cubre toda la pantalla** (`position: fixed; inset: 0; background: rgba(0,0,0,0.9)`).
- Resultado: cuando la última pareja es un match de foto, el zoom-overlay aparece **encima** del modal de victoria. El usuario no ve "¡Nivel Completado!" ni el botón "Siguiente nivel".

**Síntomas reportados por el usuario:** "no funciona el banner de siguiente nivel". En realidad sí funciona, pero está oculto debajo del zoom-overlay. El usuario tiene que cerrar el zoom (botón "Cerrar" o clic fuera) para recién ver el modal.

**Fix aplicado:**
1. El motor ahora pasa `isFinalMatch: true` en el evento `'match'` cuando ese match completa el tablero.
2. El handler de UI omite `showZoomAndNote()` si `data.isFinalMatch === true`.
3. Adicionalmente se subió el `z-index` del modal a `500` por seguridad.

---

## Bug #4 — El SDK de Google Publisher Tag (GPT) nunca se carga

**Archivo:** `index.html`.

**El bug:** `juego.js` declara `window.googletag = window.googletag || { cmd: [] }` y encola llamadas con `googletag.cmd.push(...)`, pero `index.html` **nunca incluye** la etiqueta `<script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js">`. Sin ese script, `googletag.cmd` es solo un arreglo vacío: las funciones encoladas **nunca se ejecutan**.

**Consecuencia:**
- `bannerSlot`, `rewardedSlot`, `interstitialSlot` quedan `undefined`.
- `showInterstitialAd()` solo encola `googletag.display(undefined)` que jamás se ejecuta.
- El `#ad-banner` del HTML nunca muestra nada.

**Fix aplicado:** se agregó la etiqueta `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js">` en el `<head>` de `index.html`.

---

## Bug #5 — Llamadas a `googletag.display(undefined)` pueden lanzar error

**Archivo:** `juego.js`, líneas 8–11 y `ui.js` línea 268.

Si se llega a cargar el script GPT (ver Bug #4), las llamadas `googletag.display(interstitialSlot)` fallarían porque `interstitialSlot` es `undefined` (las slots se asignan dentro del `cmd.push` que aún no se ejecutó al momento de la llamada).

**Fix aplicado:** validación defensiva `if (interstitialSlot) googletag.display(interstitialSlot);` antes de llamar a `display()`.

---

## Bug #6 — Juego se queda "stuck" silenciosamente cuando 4 slots están llenos

**Archivo:** `juego.js`, línea 126.

**Código actual:**
```js
if (slots.length >= MAX_SLOTS) {
    sound.error();
    if (onStateChange) onStateChange('slotsfull');
}
```

El handler solo muestra el mensaje `"Sin coincidencias"`, que es **engañoso**: el usuario cree que debe seguir buscando parejas, pero `onTileClick` ya no permite agregar más fichas. Sin `undo` o `shuffle`, el nivel queda **bloqueado** sin avisar al usuario cómo salir.

**Fix aplicado:** mensaje más claro: `"Slots llenos: usa Deshacer (↩️) o Mezclar (🔀)"`.

---

## Bug #7 — Click y touchend pueden disparar dos veces en móviles

**Archivo:** `ui.js`, líneas 88–106.

Cada ficha tiene registrados **dos** event listeners: `click` y `touchend`. En la mayoría de los móviles modernos `touchend` con `preventDefault()` debería suprimir el sintético `click`, pero en algunos navegadores (especialmente iOS Safari con `fastclick` deshabilitado) ambos disparan. Eso resulta en llamar `GameEngine.onTileClick(idx)` dos veces: la primera agrega la ficha al slot, la segunda encuentra `t.inSlot=true` y retorna `false` (silenciosamente).

**Fix aplicado:** flag `lastTapTime` que bloquea el segundo evento si llega dentro de 300ms.

---

## Bug #8 — `tile.matched` nunca se setea

**Archivo:** `juego.js`.

`createTiles()` inicializa las fichas con `matched: false`. En `checkForMatchInSlots()`, las fichas emparejadas se eliminan del array con `splice`, no marcándolas como `matched=true`. Por tanto, todas las referencias a `t.matched` en el código son no-ops:

- `updateBlocked()`: `tiles.filter(t => !t.matched && !t.inSlot)` → equivalente a `!t.inSlot`.
- `isGameOver()`: `tiles.filter(t => !t.matched && !t.inSlot).length === 0` → igual.
- `renderBoard()` en ui.js: `tiles.filter(t => !t.matched && !t.inSlot)` → igual.

**Severidad:** medio — no rompe nada actualmente, pero es código muerto y será frágil ante futuras modificaciones (por ejemplo si se quiere implementar "animación de ficha desapareciendo" en lugar de splice directo).

**Fix aplicado:** ahora las fichas sí se marcan `matched=true` antes de eliminarlas del array (para que cualquier referencia futura funcione). Las funciones de filtrado quedan igual.

---

## Bug #9 — `.bonus-tile` no tiene estilos CSS

**Archivo:** `index.html` (CSS) + `ui.js` línea 63.

`renderBoard()` agrega `el.classList.add('bonus-tile')` a las fichas bonus, pero **no existe ninguna regla CSS** para `.bonus-tile`. Las fichas bonus (que dan x2 puntos) son visualmente idénticas a las normales.

**Fix aplicado:** se agregó al `<style>`:
```css
.vita-tile.bonus-tile::after {
    content: '✨'; position: absolute; top: 2px; right: 4px;
    font-size: 0.8em; z-index: 7; pointer-events: none;
}
```

---

## Bug #10 — `isTileFree()` aplica bloqueo 3x3 demasiado amplio

**Archivo:** `juego.js`, línea 41.

```js
var above = activeTiles.find(function(t) {
    return t.layer === tile.layer + 1
        && Math.abs(t.col - tile.col) <= 1
        && Math.abs(t.row - tile.row) <= 1;
});
```

En el layout generado por `createTiles`, las fichas de capa 1 están en columnas 1–4 y las de capa 0 en columnas 0–5. Las fichas de capa 1 están **directamente encima** de las de capa 0 con la misma columna. La comprobación `Math.abs(t.col - tile.col) <= 1` considera "encima" a fichas que están 1 columna desplazadas, marcando como bloqueadas fichas que en realidad son libres.

**Fix aplicado:** solo se considera "encima" si `t.col === tile.col` (misma columna) y `t.row === tile.row` (misma fila), lo cual coincide exactamente con cómo el layout coloca las fichas de capa 1 sobre las de capa 0.

---

## Bug #11 — Sin verificación de solvencia

**Archivo:** `juego.js`, `createTiles` y `useShuffle`.

El layout inicial y el shuffle son aleatorios. No hay verificación de que exista al menos una pareja de fichas libres. Si el azar produce un tablero donde ninguna pareja es jugable, el usuario queda atascado sin poder hacer ningún movimiento.

**Fix aplicado (parcial):** en `useShuffle` se itera hasta 20 veces buscando un layout que tenga al menos una pareja libre; si no se encuentra, se fuerza una posición donde una pareja específica quede libre. No se aplica a `createTiles` para no cambiar la dificultad inicial.

---

## Bug #12 — Tutorial no progresa visualmente

**Archivo:** `ui.js`, líneas 253–263.

`advanceTutorial()` incrementa `tutorialStep` de 0 a 5 y luego llama `completeTutorial()`. Pero `showTutorialOverlay()` solo muestra **un único mensaje** ("Toca una ficha y luego su pareja...") y nunca se actualiza cuando `tutorialStep` cambia. El usuario termina el tutorial sin feedback hasta que se cierra solo.

**Fix aplicado:** ahora `advanceTutorial()` actualiza el contenido del mensaje en cada paso, mostrando 5 tips distintos antes de completarse.

---

## Features adicionales (post-fix)

### Feature #1 — Detección automática de tablero insoluble

**Motivación:** tras aplicar el fix de Bug #11 (solvencia del shuffle del usuario), quedó el caso del tablero inicial o de jugadas intermedias donde ninguna pareja libre existe pero el usuario no puede darse cuenta. El juego se quedaba "stuck" silenciosamente.

**Implementación:**
- Nueva función `isBoardStuck()` en `juego.js` que detecta cuándo: no hay pareja libre jugable, no hay pareja entre los slots actuales, y los slots están llenos (4 fichas sin match).
- Nueva función `autoUnstickIfNeeded()` que se invoca automáticamente tras cada `onTileClick()`. Si el tablero está atascado, reorganiza las fichas con Fisher-Yates + re-layout, hasta encontrar una configuración con pareja libre (hasta 30 intentos). Si tras 30 intentos no se logra, fuerza la primera pareja a posiciones libres con `forceFirstPairFree()`.
- El auto-shuffle **no consume usos del usuario** (es gratuito) y emite el evento `'autoshuffle'` para que la UI muestre el aviso.
- El motor también expone `autoUnstick()` y `isBoardStuck()` públicamente para uso manual desde la UI.

**Validación:** el test F2 del script `test_features.js` simula un atasco (4 clicks con pids distintos) y verifica que se dispara el evento `autoshuffle` con `slots.length === 0` y `findHintPair() !== null` después.

### Feature #2 — Solvencia garantizada del tablero inicial

**Motivación:** `createTiles()` original podía generar layouts donde ninguna pareja era libre. Aunque era raro, podía pasar.

**Implementación:**
- Nueva función `ensureSolvable()` se llama al final de `createTiles()`. Re-layouta hasta 30 veces hasta que `hasAnyPlayablePair()` retorne `true`. Si no lo logra, llama a `forceFirstPairFree()` que coloca la primera pareja en col 0 y col 5 (extremos, fila 0, capa 0), garantizando jugabilidad.

**Validación:** test F1 inicializa 100 tableros con `pairs=12` (24 fichas) y verifica que los 100 tienen pareja libre al inicio.

### Feature #3 — Hint visual con resalte de pareja sugerida

**Motivación:** antes, `useHint()` solo mostraba un mensaje de texto `"Busca: <nombre>"`. El usuario tenía que escanear visualmente todo el tablero para encontrar la pareja. Era poco útil.

**Implementación:**
- Nueva función `findHintPair()` en `juego.js` que retorna `{ a, b, name }` con los índices de la primera pareja libre jugable.
- `useHint()` ahora emite el evento `'hint'` con `{ name, idxA, idxB }`. Si no hay pareja libre (tablero potencialmente atascado), emite `{ name: 'Tablero mezclado', noPair: true }` y dispara `autoUnstickIfNeeded()` (sin consumir uso de hint).
- La UI recibe `idxA`/`idxB` y aplica la clase CSS `.hint-highlight` a las dos fichas correspondientes. La clase tiene animación `hintPulse` (0.8s ease-in-out infinite) con glow verde (`#4ade80`) y `transform: scale(1.05)`.
- El resalte se quita automáticamente tras 3.5 segundos, o al hacer click en cualquier ficha (lo que indica que el usuario ya vio la pista).
- `renderBoard()` re-aplica el resalte si las variables `hintIdxA`/`hintIdxB` siguen activas tras un re-render (por ejemplo tras un match).

**CSS agregado en `index.html`:**
```css
.vita-tile.hint-highlight {
    animation: hintPulse 0.8s ease-in-out infinite !important;
    box-shadow: 0 0 40px rgba(74,222,128,0.95), 0 0 20px rgba(74,222,128,0.7) !important;
    border: 2px solid #4ade80 !important;
    z-index: 60 !important;
    transform: scale(1.05) !important;
    filter: brightness(1.3) !important;
}
@keyframes hintPulse {
    0%,100% { box-shadow: 0 0 40px rgba(74,222,128,0.95), 0 0 20px rgba(74,222,128,0.7); }
    50%     { box-shadow: 0 0 60px rgba(74,222,128,1), 0 0 30px rgba(74,222,128,0.9); }
}
```

**Validación:**
- Test F3: verifica que `useHint()` emite `idxA` e `idxB` numéricos.
- Test F4: verifica que consume 1 uso de hint.
- Test F6: verifica que cuando no hay pareja libre, emite `noPair: true` y NO consume uso.
- Test F7: verifica que cuando SÍ hay pareja libre, NO dispara auto-shuffle.

---

## Cómo probar los fixes

1. Reemplaza `juego.js`, `ui.js` e `index.html` del servidor con las versiones corregidas (en esta misma carpeta).
2. En el navegador, abre DevTools → Application → Service Workers → **Unregister** el SW anterior (es `mahjong-tour-v3`).
3. Recarga con `Ctrl+Shift+R` (hard reload).
4. Sube la versión del SW a `v4` en `sw.js` para forzar la actualización en dispositivos móviles.

**Casos de prueba clave:**

- **Bug 1 (fichas pegadas):** jugar nivel Norte 1, llenar 3 slots con fichas no pareadas, hacer match con dos de ellas → el slot restante debe poder deshacerse con `↩️` y la ficha debe volver a ser clickeable.
- **Bug 3 (banner siguiente nivel):** completar un nivel donde el último match sea una foto → el modal "¡Nivel Completado!" debe aparecer inmediatamente sin necesidad de cerrar el zoom primero.
- **Feature 1 (auto-shuffle):** llenar los 4 slots con fichas no pareadas (de pids distintos) → al 4o click el tablero debe mezclarse automáticamente, vaciar los slots y mostrar el mensaje "🔀 Sin movimientos · tablero mezclado".
- **Feature 3 (hint visual):** presionar `💡` → las dos fichas de la pareja sugerida deben brillar en verde con animación pulsante durante ~3.5s.
- **Feature 3 (hint sin pareja):** forzar un atasco y presionar `💡` → no consume uso, muestra "Tablero mezclado" y reorganiza el tablero.

---

## Tests automáticos

Los tests headless en `/home/z/my-project/scripts/` validan toda la lógica del motor:

- `test_fixes.js` — valida los fixes de bugs 1, 2, 3, 8 y 10.
- `test_features.js` — valida las 3 features nuevas (F1 a F7).
- `test_original_bug.js` — demuestra que el bug #1 sí existe en el código original (crashea).

Para ejecutarlos:
```bash
node /home/z/my-project/scripts/test_fixes.js
node /home/z/my-project/scripts/test_features.js
```

Los 12 tests en total (5 fixes + 7 features) pasan correctamente.
