# Guía de Publicación · Mahjong World Tour

Esta guía te lleva paso a paso desde el código hasta tener el juego publicado y midiendo usuarios.

---

## 📋 Pre-publicación (Checklist)

Antes de subir, verifica que tienes:

- [ ] Todos los archivos del ZIP extraídos en una carpeta
- [ ] Cuenta de GitHub (gratis: https://github.com)
- [ ] Git instalado (https://git-scm.com)
- [ ] Un navegador moderno (Chrome, Firefox, Safari, Edge)

---

## 🚀 Paso 1: Subir a GitHub Pages (5 minutos)

### 1.1 Crear repositorio
1. Ve a https://github.com/new
2. **Repository name**: `MahjongWT` (exactamente así, con mayúsculas)
3. **Description**: `Mahjong World Tour · Descubre América — PWA de Mahjong con viajes por Chile, Argentina, México y Brasil`
4. **Visibility**: Public
5. **NO marques** "Add a README" ni ".gitignore" (ya los tenemos)
6. Click **Create repository**

### 1.2 Subir los archivos
Abre una terminal en la carpeta donde extrajiste el ZIP:

```bash
# Inicializar git
git init
git add .
git commit -m "v4.1 - Mahjong World Tour listo para publicar"

# Conectar al repositorio (cambia artjmarcos por tu usuario)
git branch -M main
git remote add origin https://github.com/artjmarcos/MahjongWT.git
git push -u origin main
```

Si te pide credenciales, usa un Personal Access Token (Configuración → Developer settings → Personal access tokens).

### 1.3 Activar GitHub Pages
1. Ve a tu repo: https://github.com/artjmarcos/MahjongWT
2. Click **Settings** → **Pages** (en el menú izquierdo)
3. En **Source**, selecciona:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Espera 1-2 minutos
6. Tu app estará en: **https://artjmarcos.github.io/MahjongWT/**

### 1.4 Verificar publicación
Abre la URL en tu móvil y verifica:
- ✅ Carga el splash con avión recorriendo 5 países
- ✅ Aparece el menú principal con 4 países
- ✅ Puedes jugar un nivel
- ✅ Puedes abrir un memorice (nivel 7)
- ✅ Al "Añadir a pantalla de inicio" aparece el icono correcto
- ✅ Funciona offline después de la primera visita

---

## 🔍 Paso 2: Google Search Console (10 minutos)

Para aparecer en búsquedas de Google:

### 2.1 Añadir propiedad
1. Ve a https://search.google.com/search-console
2. Click **Añadir propiedad**
3. Elige **Prefijo de URL**: `https://artjmarcos.github.io/MahjongWT/`
4. Click **Continuar**

### 2.2 Verificar propiedad
1. En "Método de verificación", elige **Etiqueta HTML**
2. Te dará un código como: `<meta name="google-site-verification" content="ABC123..." />`
3. **Copia solo el contenido** (ej: `ABC123...`)
4. Edita `index.html` y agrega esta línea en el `<head>` (debajo de los otros meta tags):
   ```html
   <meta name="google-site-verification" content="ABC123..." />
   ```
5. Haz commit y push:
   ```bash
   git add index.html
   git commit -m "Verify Google Search Console"
   git push
   ```
6. Espera 2-3 minutos a que GitHub Pages actualice
7. Vuelve a Search Console y click **Verificar**

### 2.3 Enviar sitemap
1. En Search Console, ve a **Sitemaps** (menú izquierdo)
2. Ingresa: `sitemap.xml`
3. Click **Enviar**

### 2.4 Solicitar indexación
1. En Search Console, ve a **Inspección de URLs**
2. Pega tu URL: `https://artjmarcos.github.io/MahjongWT/`
3. Click **Solicitar indexación**
4. Repite para las URLs con `?country=chile`, `?country=argentina`, etc.

⏱️ Google indexará tu sitio en 1-7 días.

---

## 📊 Paso 3: Google Analytics 4 (10 minutos)

Para ver cuántos usuarios juegan, de dónde son, qué niveles juegan, etc.

### 3.1 Crear propiedad
1. Ve a https://analytics.google.com
2. Click **Administrador** → **Crear propiedad**
3. **Nombre**: `Mahjong World Tour`
4. **Zona horaria**: Chile (o tu país)
5. **Moneda**: USD (o CLP)
6. Click **Siguiente** → **Crear**

### 3.2 Configurar flujo de datos
1. Elige **Web**
2. **URL del sitio web**: `https://artjmarcos.github.io/MahjongWT/`
3. **Nombre del flujo**: `MahjongWT Web`
4. Click **Crear flujo**
5. Te dará un **ID de medición** como: `G-ABC123DEF4`

### 3.3 Instalar en la app
Edita `index.html` y agrega JUSTO DESPUÉS de `<head>` (antes de los otros scripts):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ABC123DEF4', {
        app_name: 'Mahjong World Tour',
        debug_mode: false
    });
</script>
```

Reemplaza `G-ABC123DEF4` con tu ID real. Commit y push:

```bash
git add index.html
git commit -m "Add Google Analytics 4"
git push
```

⏱️ Datos aparecerán en 24-48 horas.

---

## 📱 Paso 4: Probar como App Nativa (15 minutos)

### 4.1 En Android (Chrome)
1. Abre https://artjmarcos.github.io/MahjongWT/ en Chrome móvil
2. Menú (⋮) → **Añadir a pantalla de inicio**
3. Aparece el icono en tu launcher
4. Ábrela → se ve como app nativa (sin barra del navegador)

### 4.2 En iOS (Safari)
1. Abre la URL en Safari
2. Botón Compartir (cuadrado con flecha arriba) → **Añadir a inicio**
3. Aparece el icono en tu home screen
4. Ábrela → se ve como app nativa

### 4.3 En Desktop (Chrome/Edge)
1. Abre la URL
2. Aparecerá un icono de "Instalar" en la barra de direcciones
3. Click → se instala como app de escritorio

---

## 💰 Paso 5: Activar Anuncios Reales (futuro)

Ya tienes Google Publisher Tag (GPT) integrado. Para activar anuncios reales:

### 5.1 AdSense (Web)
1. Ve a https://www.google.com/adsense
2. Regístrate con tu cuenta de Google
3. Añade tu sitio: `https://artjmarcos.github.io/MahjongWT/`
4. Espera aprobación (1-14 días, requiere contenido original)
5. Una vez aprobado, te darán un código `ca-pub-XXXXXXXXXXXXXXXX`
6. Reemplaza en `index.html` los placeholders de anuncios

### 5.2 AdMob (App nativa, futuro)
Para empaquetar como APK con Capacitor:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init MahjongTour com.artjmarcos.mahjongtour --web-dir=.
npx cap add android
# Instalar plugin de AdMob
npm install @capacitor-community/admob
npx cap sync
npx cap open android  # abre Android Studio
```

---

## 📣 Paso 6: Plan de Difusión

### 6.1 Redes sociales (día 1)
- **Instagram/Facebook**: Post con video de 15s del splash + gameplay
- **Twitter/X**: Thread contando la historia del desarrollo
- **TikTok**: Video corto del splash con música
- **WhatsApp**: Comparte el link con familia y amigos

### 6.2 Comunidad (semana 1)
- **Reddit**: r/Mahjong, r/chile, r/argentina, r/mexico, r/brasil
- **Discord**: servidores de juegos casuales, comunidades latinas
- **Foros**: ForoCHile, Taringa, comunidades de juegos casuales

### 6.3 Latinos en USA (objetivo clave)
Tu juego tiene potencial especial con latinos en EEUU por:
- 3 idiomas (es/en/pt) cubre hispanos, brasileños y anglófonos
- Contenido cultural (paisajes de sus países de origen)
- Gratis, sin registro, instalable

**Canales:**
- Grupos de Facebook: "Latinos en USA", "Chilenos en USA", etc.
- TikTok con hashtag #LatinosInUSA #Nostalgia #PatriaLejana
- YouTube: colabora con creadores de contenido latino

### 6.4 ASO (App Store Optimization, futuro)
Si lanzas como app nativa:
- **Título**: "Mahjong World Tour: América Latina"
- **Subtitle**: "Puzzle de viajes por Chile, Argentina, México"
- **Keywords**: mahjong, solitario, puzzle, viajes, america latina, chile, argentina, mexico, brasil, offline

---

## 🔧 Paso 7: Mantenimiento

### Actualizar el juego
Cada vez que cambies algo:
```bash
# 1. Subir versión del cache en sw.js (importante!)
# Editar sw.js: var CACHE_NAME = 'mahjong-tour-v20';

# 2. Commit y push
git add .
git commit -m "v4.2 - descripción del cambio"
git push
```

### Cambiar fotos
Edita `datos.js` y reemplaza el ID de Google Drive:
```js
{ name:'Torres del Paine', url:'https://drive.google.com/thumbnail?id=NUEVO_ID&sz=w400', ... }
```

### Monitorear
- **Search Console**: indexación, errores de rastreo, consultas de búsqueda
- **Analytics**: usuarios activos, retención, países, dispositivos
- **PageSpeed Insights**: https://pagespeed.web.dev/?url=https://artjmarcos.github.io/MahjongWT/

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| Cambios no se reflejan | Subir versión del CACHE_NAME en `sw.js` + Ctrl+Shift+R |
| El splash se ve en blanco | Verificar que todos los .js están subidos |
| La música no cambia entre países | Borrar cache del navegador y recargar |
| Anuncios no aparecen | Necesitas cuenta AdSense aprobada |
| Search Console no verifica | Esperar 5 min después del push, reintentar |
| Analytics no muestra datos | Esperar 24-48h, verificar ID correcto |
| Icono no aparece al instalar | Verificar icon-192.png e icon-512.png subidos |

---

## ✅ Checklist Final de Publicación

- [ ] Repositorio creado en GitHub
- [ ] Archivos subidos con git push
- [ ] GitHub Pages activado (URL accesible)
- [ ] App probada en móvil (Android/iOS)
- [ ] App instalable como PWA
- [ ] Google Search Console verificado
- [ ] Sitemap enviado
- [ ] Google Analytics configurado
- [ ] Primer post en redes sociales
- [ ] Compartido con al menos 10 personas

---

**¡Felicidades! Tu juego está publicado y listo para el mundo.** 🌎

Mahjong World Tour
