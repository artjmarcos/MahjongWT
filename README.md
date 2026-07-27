# Mahjong World Tour · Descubre América

> Un viaje meditativo por América Latina a través del Mahjong.

Resuelve puzzles inspirados en paisajes reales mientras descubres los rincones más mágicos de Chile, Argentina, México y Brasil. Cada ficha cuenta una historia. Cada nivel, un nuevo destino.

**Mahjong World Tour**

---

## 🌎 El viaje

Comienza tu aventura en México y viaja por todo el continente hasta la Patagonia. En cada zona descubrirás paisajes, cultura y desafíos nuevos. Algunos niveles son relajantes; otros te pondrán a prueba. Pero todos comparten una misma promesa: **calma y descubrimiento**.

## 🚀 Publicación en GitHub Pages

```bash
# En tu repo MahjongWT
git pull
# Descomprime el ZIP encima de los archivos existentes
unzip mahjong-tour-v4.0.zip -d /ruta/a/MahjongWT/
git add .
git commit -m "v4.0 - splash corto, progressive disclosure, README emocional"
git push
```

1. Ve a **https://github.com/artjmarcos/MahjongWT/settings/pages**
2. En **Source**, selecciona la rama `main` y carpeta `/root`
3. Click **Save** → tu app estará en:
   **https://artjmarcos.github.io/MahjongWT/**

## 📁 Estructura de archivos

```
MahjongWT/
├── index.html              # Estructura + CSS + SEO meta tags
├── manifest.json           # PWA manifest (con shortcuts por país)
├── sw.js                   # Service Worker
├── juego.js                # Motor del juego (tiles, match, slots)
├── datos.js                # ZONES, TRIVIA, MINIGAMES, photos
├── i18n.js                 # Sistema de traducción (es/en/pt)
├── ui.js                   # Renderizado UI, splash, pantallas
├── misiones.js             # Misiones diarias + racha
├── logros.js               # Logros desbloqueables
├── musica.js               # Reproductor MP3 por país
├── icon-192.png            # Icono PWA
├── icon-512.png            # Icono PWA (HD)
├── apple-touch-icon.png    # Icono iOS
├── favicon-32.png          # Favicon
├── *.mp3                   # Música temática por país
└── README.md
```

## 🔧 Para desarrolladores

### Cambiar fotos
Las fotos se cargan desde URLs de Google Drive:
`https://drive.google.com/thumbnail?id=FILE_ID&sz=w400`

Edita `datos.js` y reemplaza el `FILE_ID` por el de la nueva foto (asegúrate de que el archivo sea público).

### Actualizar Service Worker
Cada vez que cambies archivos, sube la versión del cache en `sw.js`:
```js
var CACHE_NAME = 'mahjong-tour-v18';  // sube el número
```

### Idiomas
El selector está en **Ajustes → Idioma**. Soporta Español, English, Português. Las traducciones están en `i18n.js`.

### Monetización
Google Publisher Tag (GPT) ya está integrado. Para activar anuncios reales:
1. Crear cuenta AdSense → https://www.google.com/adsense
2. Reemplazar los IDs de prueba en `index.html`

## 📱 App nativa (futuro)

Para empaquetar como APK con Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init MahjongTour com.artjmarcos.mahjongtour --web-dir=.
npx cap add android
npx cap sync
npx cap open android
```

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| Cambios no se reflejan | Subir versión del CACHE_NAME en `sw.js` y recargar (Ctrl+Shift+R) |
| La música no cambia entre países | Borrar cache del navegador y recargar |
| El splash se ve en blanco | Verificar que todos los .js están subidos |
| Anuncios no aparecen | Necesitas cuenta AdSense aprobada |

---

**Descubre América · World Tour** — un viaje, mil destinos. 🌎
