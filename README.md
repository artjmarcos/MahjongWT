# Mahjong World Tour · Descubre América

PWA (Progressive Web App) — Juego de Mahjong Solitario ambientado en un viaje por América Latina.

## 🌎 Características

- **4 países**: 🇨🇱 Chile · 🇦🇷 Argentina · 🇲🇽 México · 🇧🇷 Brasil
- **16 zonas** (4 por país) · **160 niveles** con 3 dificultades cada uno
- **3 idiomas**: Español, English, Português (con selector in-app)
- **Splash animado**: avión recorre México → Brasil → Argentina → Chile → Patagonia
- **Música temática por país** (4 pistas MP3 originales)
- **Misiones diarias** con sistema de racha (bonus a los 3/7/14/30 días)
- **21 logros** desbloqueables en 5 categorías
- **Tienda** con power-ups (pista, mezclar, deshacer)
- **Mini-juegos**: Memorice y Trivia cultural por país
- **Álbum de viajes** desbloqueable al completar niveles
- **PWA instalable** offline con Service Worker
- **Ads**: banner, interstitial y rewarded video (Google AdSense)
- **Fotos reales** alojadas en Google Drive del autor

## 📁 Estructura de archivos

```
MahjongWT/
├── index.html              # Estructura HTML + CSS + SEO meta tags
├── manifest.json           # PWA manifest (con shortcuts)
├── sw.js                   # Service Worker (cache v11)
├── juego.js                # Motor del juego (tiles, match, slots)
├── datos.js                # ZONES, TRIVIA, MINIGAMES, traditionalTiles, photos
├── i18n.js                 # Sistema de traducción (es/en/pt)
├── ui.js                   # Renderizado UI, splash, pantallas
├── misiones.js             # Misiones diarias + sistema de racha
├── logros.js               # 21 logros desbloqueables
├── musica.js               # Reproductor MP3 por país
├── icon-192.png            # Icono PWA 192x192
├── icon-512.png            # Icono PWA 512x512
├── apple-touch-icon.png    # Icono iOS 180x180
├── favicon-32.png          # Favicon 32x32
├── Cumbres_bajo_el_Sol.mp3     # Chile + Menú
├── Cortes_de_Medianoche.mp3    # Argentina
├── La_Senda_del_Honor.mp3      # México
└── Shadows_in_the_Palms.mp3    # Brasil
```

## 🚀 Publicación en GitHub Pages

### Paso 1: Crear/actualizar el repositorio

```bash
# Si no tienes repo aún:
git init
git remote add origin https://github.com/artjmarcos/MahjongWT.git

# Copiar todos los archivos del ZIP al repo
cp /path/to/descargado/* .

# Commit y push
git add .
git commit -m "v1.2 - i18n + Brasil + splash + música"
git push origin main
```

### Paso 2: Activar GitHub Pages

1. Ve a **https://github.com/artjmarcos/MahjongWT/settings/pages**
2. En **Source**, selecciona la rama `main` y carpeta `/root`
3. Click **Save**
4. Espera 1-2 minutos. Tu app estará en:
   **https://artjmarcos.github.io/MahjongWT/**

### Paso 3: Verificar deployment

1. Abre la URL en tu móvil
2. Verifica que:
   - ✅ Carga el splash con avión recorriendo 5 ciudades
   - ✅ Aparece la frase inspiradora
   - ✅ El menú principal muestra los 4 países
   - ✅ Puedes entrar a cada país y jugar
   - ✅ La música cambia al cambiar de país
   - ✅ El selector de idioma funciona (Ajustes → Idioma)
   - ✅ Al "Añadir a pantalla de inicio" aparece el icono correcto

### Paso 4: Registrar en Google Search Console

1. Ve a **https://search.google.com/search-console**
2. Añade propiedad: `https://artjmarcos.github.io/MahjongWT/`
3. Verifica con meta tag HTML (te dará un código) — agrégalo en `index.html`:
   ```html
   <meta name="google-site-verification" content="TU_CODIGO_AQUI" />
   ```
4. Envía el sitemap (opcional, Google indexará solo)

### Paso 5: Test Lighthouse PWA

1. Abre Chrome DevTools (F12)
2. Pestaña **Lighthouse**
3. Marca **Progressive Web App** y **Performance**
4. Click **Generate report**
5. Objetivos:
   - Performance > 80
   - PWA ✅ (todas las verificaciones)
   - SEO > 90

## 📱 Probar como app nativa (opcional, futuro)

Para empaquetar como APK para Google Play Store, se puede usar Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init MahjongTour com.artjmarcos.mahjongtour --web-dir=.
npx cap add android
npx cap sync
npx cap open android  # abre Android Studio
```

## 💰 Monetización

Ya está integrado Google Publisher Tag (GPT). Para activar anuncios reales:

1. **Crear cuenta AdSense**: https://www.google.com/adsense
2. Esperar aprobación (1-7 días)
3. Obtener tu `ca-pub-XXXXXXXXXXXXXXXX`
4. Reemplazar en `index.html` las unidades de anuncio actuales (que son de prueba)
5. Para AdMob (apps móviles nativas), requiere Capacitor + plugin de AdMob

## 🔧 Mantenimiento

### Cambiar fotos de Google Drive
Las fotos se cargan desde URLs como:
`https://drive.google.com/thumbnail?id=FILE_ID&sz=w400`

Para cambiar una foto, edita `datos.js` y reemplaza el `FILE_ID` por el de la nueva foto (asegúrate de que el archivo sea público en Drive).

### Actualizar Service Worker
Cada vez que cambies archivos, sube la versión del cache en `sw.js`:
```js
var CACHE_NAME = 'mahjong-tour-v12';  // sube el número
```

## 📊 Estadísticas (recomendado)

Para trackear usuarios activos, sesiones, retención, etc.:

1. **Google Analytics 4** (gratis):
   - Crear propiedad en https://analytics.google.com
   - Obtener `G-XXXXXXXXXX`
   - Agregar al `<head>` de `index.html`:
     ```html
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
     <script>
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-XXXXXXXXXX');
     </script>
     ```

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| No se ve el icono al instalar | Verifica que `icon-192.png` e `icon-512.png` existen y son PNG válidos |
| La música no cambia entre países | Borrar cache del navegador y recargar (Service Worker cacheó versión vieja) |
| Anuncios no aparecen | Necesitas cuenta AdSense aprobada y reemplazar los IDs de prueba |
| El splash se ve en blanco | Verifica que todos los .js están subidos y sin errores de sintaxis |
| Cambios no se reflejan | Subir versión del CACHE_NAME en `sw.js` y forzar reload (Ctrl+Shift+R) |

## 📞 Contacto

Hecho con cariño desde Chile 🇨🇱
