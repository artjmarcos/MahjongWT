# Guía PWABuilder desde el Móvil · Mahjong World Tour

Esta guía te lleva paso a paso para generar el APK de tu juego **usando solo tu móvil Android**, sin necesidad de PC.

---

## 📋 Resumen del proceso

```
1. Publicar PWA en GitHub Pages  (necesitas PC prestado 5 min, o usa GitHub móvil)
2. PWABuilder genera APK Android  (100% desde el móvil) ⭐
3. Subir APK a Google Play Store  (100% desde el móvil)
```

**Tiempo total:** 30-60 minutos
**Costo:** $25 USD (Google Play Console, una sola vez)

---

## ✅ Verificación previa (tu PWA ya cumple)

Antes de empezar, tu PWA cumple **TODOS** los requisitos de PWABuilder:

| Requisito | Estado |
|-----------|--------|
| `name` en manifest | ✅ |
| `short_name` en manifest | ✅ |
| `start_url` en manifest | ✅ |
| `display: standalone` | ✅ |
| `background_color` | ✅ |
| `theme_color` | ✅ |
| Icono 192x192 PNG | ✅ |
| Icono 512x512 PNG | ✅ |
| Icono maskable | ✅ |
| Service Worker | ✅ |
| HTTPS | ✅ (GitHub Pages lo da) |

**Puntaje estimado de PWABuilder:** 100/100 🎉

---

## 📱 Paso 1: Publicar en GitHub Pages (10 min)

### 1.1 Crear cuenta de GitHub (si no tienes)
1. En tu móvil, abre https://github.com/signup
2. Crea cuenta gratuita con tu email

### 1.2 Crear repositorio
1. Ve a https://github.com/new
2. **Repository name**: `MahjongWT`
3. **Description**: `Mahjong World Tour · Descubre América`
4. **Visibility**: Public
5. Click **Create repository**

### 1.3 Subir los archivos
**Opción A: Usando la app GitHub móvil (recomendado)**
1. Descarga la app **GitHub** desde Play Store
2. Inicia sesión
3. Abre tu repo `MahjongWT`
4. Click **+** → **Upload files**
5. Selecciona todos los archivos del ZIP y súbelos

**Opción B: Usando el navegador móvil**
1. Abre https://github.com/artjmarcos/MahjongWT/upload/main
2. Arrastra los archivos o click **choose your files**
3. Commit changes

**Opción C: Pedir ayuda a un amigo con PC por 5 minutos**
- Solo necesita hacer `git push` con los archivos
- Es lo más rápido si tienes alguien cerca

### 1.4 Activar GitHub Pages
1. En tu repo, ve a **Settings** → **Pages**
2. **Source**: Branch `main` / Folder `/root`
3. Click **Save**
4. Espera 2-3 minutos
5. Tu app estará en: **https://artjmarcos.github.io/MahjongWT/**

### 1.5 Verificar que funciona
Abre esa URL en tu móvil. Deberías ver tu juego funcionando.

---

## 🚀 Paso 2: Generar APK con PWABuilder (5 min, 100% móvil)

### 2.1 Abrir PWABuilder
1. En tu móvil, abre **https://www.pwabuilder.com**
2. Espera que cargue (10 segundos)

### 2.2 Analizar tu PWA
1. En el campo de texto, pega tu URL:
   ```
   https://artjmarcos.github.io/MahjongWT/
   ```
2. Click **Start**

### 2.3 Revisar el reporte
PWABuilder analizará tu PWA (~30 segundos). Verás:

```
Manifest: ✅
Service Worker: ✅
Security: ✅
PWA Score: 100
```

Si ves score menor a 100, dímelo y lo arreglamos.

### 2.4 Generar APK Android
1. Click el botón **"Package For Stores"** o **"Build My PWA"**
2. Selecciona **"Android"** (no Web, no iOS)
3. Se abrirá un formulario. Completa:

#### Configuración del paquete Android:

| Campo | Valor |
|-------|-------|
| **Package ID** | `com.artjmarcos.mahjongtour` |
| **App name** | `Mahjong World Tour` |
| **Short name** | `Mahjong Tour` |
| **Version** | `1.0.0` |
| **Version code** | `1` |
| **Signing key** | "New" (genera una nueva automáticamente) |
| **Target API** | `34` |
| **Min API** | `23` |

4. Click **"Generate"**
5. Espera 1-2 minutos
6. Se descargará un ZIP llamado `mahjong-world-tour-android-signed.zip`

### 2.5 Extraer el APK
1. Abre **Files** (archivos) en tu móvil
2. Ve a **Downloads**
3. Encuentra `mahjong-world-tour-android-signed.zip`
4. Extrae el ZIP (mantén presionado → "Extract")
5. Dentro encontrarás:
   - `app-release-signed.apk` ← **este es tu APK**
   - `app-release-universal.apk` (alternative)
   - Keystore file (¡GUÁRDALO!)
   - README con instrucciones

### 2.6 ⚠️ GUARDAR KEYSTORE (CRÍTICO)
PWABuilder te dará un archivo `.keystore`. **Este archivo es irreemplazable**:

1. Cópialo a:
   - Google Drive
   - Email a ti mismo
   - Carpeta segura en tu móvil
2. Si pierdes este keystore:
   - No podrás actualizar la app en Google Play
   - Tendrás que crear una app nueva

**La contraseña del keystore** también te la dará PWABuilder. Anótala en lugar seguro.

---

## 🧪 Paso 3: Probar el APK en tu móvil (2 min)

### 3.1 Instalar el APK
1. En **Files**, encuentra `app-release-signed.apk`
2. Toca para instalar
3. Android pedirá permiso "Instalar apps desconocidas" → Permite
4. Click **Instalar**

### 3.2 Verificar que funciona
Abre la app desde tu launcher. Verifica:
- ✅ El splash del avión carga
- ✅ El menú principal muestra los 4 países
- ✅ Puedes entrar a un país y seleccionar un nivel
- ✅ El map intro muestra el mapa real
- ✅ El tablero de Mahjong funciona
- ✅ La música suena al activarla en Ajustes
- ✅ Puedes completar un nivel y ver la victoria

### 3.3 Si algo no funciona
- **Pantalla blanca**: revisa que `start_url` en manifest.json sea `/MahjongWT/`
- **No carga el mapa**: requiere internet, verifica conexión
- **Crash al abrir**: el APK está mal firmado, regenera con PWABuilder

---

## 📤 Paso 4: Subir a Google Play Store (15 min)

### 4.1 Crear cuenta de Google Play Console
1. Abre https://play.google.com/console/signup
2. Inicia sesión con tu cuenta de Google
3. Paga la **tarifa única de $25 USD** con tarjeta de crédito/débito
4. Completa tu perfil de desarrollador:
   - Nombre para mostrar: `Artj Marcos` (o el que prefieras)
   - Email de contacto: tu email
   - Sitio web: `https://artjmarcos.github.io/MahjongWT/`
   - Teléfono: tu número

### 4.2 Crear nueva app
1. Click **"Crear app"**
2. Completa:
   - **Nombre de la app**: `Mahjong World Tour`
   - **Idioma predeterminado**: Español (Chile)
   - **App o juego**: Juego
   - **Gratuito o de pago**: Gratuito
   - Declaraciones: marca ambas casillas
3. Click **"Crear app"**

### 4.3 Completar ficha de la tienda
Ve a **Presencia en Google Play Store → Ficha de Play Store**.

Copia los textos del archivo `PLAY_STORE.md`:

- **Descripción breve** (80 chars): copia del PLAY_STORE.md
- **Descripción completa** (4000 chars): copia del PLAY_STORE.md
- **Icono de la app**: sube `icon-512.png` (redimensionado a 512x512)
- **Capturas de pantalla**: necesitas mínimo 2 (mira abajo cómo hacerlas)
- **Categoría**: Juegos → Puzzle
- **Etiquetas**: Mahjong, Puzzle, Viajes

### 4.4 Hacer capturas de pantalla desde el móvil

Necesitas 2 capturas mínimo (recomendado 4-5):

1. **Captura 1**: Splash con avión
   - Abre la app
   - Espera que cargue el splash
   - Toma captura (Power + Volumen abajo en la mayoría de Android)

2. **Captura 2**: Menú principal
   - Espera que termine el splash
   - Toma captura del menú con los 4 países

3. **Captura 3**: Mapa intro
   - Selecciona un nivel
   - Toma captura cuando aparezca el mapa

4. **Captura 4**: Tablero de juego
   - Toma captura mientras juegas

**Tip:** Las capturas deben ser JPG o PNG. Si son muy grandes, ábrelas en **Google Photos** y redimensiona.

### 4.5 Clasificación de contenido
1. Ve a **Presencia en Play Store → Clasificación de contenido**
2. Click **Iniciar cuestionario**
3. Responde:
   - ¿Tiene violencia? **No**
   - ¿Tiene contenido sexual? **No**
   - ¿Tiene lenguaje fuerte? **No**
   - ¿Cobra dinero? **No** (gratis con anuncios)
   - ¿Recopila datos? **No** (solo localStorage local)
4. Obtendrás clasificación **E (Everyone)**

### 4.6 Configurar audiencia y contenido
1. **Audiencia objetivo**: 13+ (jóvenes y adultos)
2. **Apps para familias**: No
3. **Servicios de pago de Google Play**: No (no tienes IAP)
4. **Anuncios**: Sí, contiene anuncios
5. **Tipo de anuncio**: Anuncios display de terceros (AdMob)

### 4.7 Subir el APK release
1. Ve a **Producción** (o "Pruebas internas" si quieres probar primero)
2. Click **"Crear versión"**
3. Sube el archivo `app-release-signed.apk`
4. **Notas de la versión** (copia del PLAY_STORE.md):
   ```
   ¡Primera versión de Mahjong World Tour!
   Viaja por Chile, Argentina, México y Brasil resolviendo puzzles de Mahjong.
   ```
5. Click **"Guardar"** → **"Revisar versión"** → **"Iniciar rollout"**

### 4.8 Esperar revisión de Google
⏱️ Google revisará tu app en **1-7 días hábiles** (suele ser 2-3).

Recibirás un email cuando se apruebe. ¡Tu app estará en Play Store!

---

## 🛡️ Paso 5: Política de privacidad (importante)

Google Play requiere una URL pública con tu política de privacidad.

**Buenas noticias:** ya está creada. Es:
```
https://artjmarcos.github.io/MahjongWT/privacy-policy.html
```

Solo pega esta URL en Google Play Console → **Política de privacidad**.

---

## 💰 Paso 6: AdMob (después de publicación)

PWABuilder genera un APK con anuncios AdSense web. Para anuncios nativos AdMob (mayor RPM):

### 6.1 Espera 1-2 semanas después de publicación
- Necesitas usuarios activos
- AdMob aprueba cuentas con apps reales

### 6.2 Crear cuenta AdMob
1. Abre https://admob.google.com desde el móvil
2. Regístrate
3. Añade tu app Android (busca "Mahjong World Tour" en Play Store)

### 6.3 Crear unidades de anuncio
Crea 3 unidades:
- Banner
- Intersticial
- Rewarded

### 6.4 Actualizar la app
Cuando tengas los IDs de AdMob:
1. Edita `index.html` para usar los IDs reales
2. Sube los cambios a GitHub
3. Vuelve a generar el APK con PWABuilder
4. Sube nueva versión a Play Store (versionCode = 2)

---

## 🔧 Plan B: GitHub Actions (si PWABuilder falla)

Si PWABuilder te da problemas, puedo prepararte un workflow de GitHub Actions que:
- Compila el APK automáticamente en la nube de GitHub
- Funciona 100% desde el móvil (solo `git push`)
- Genera APK Capacitor completo (con AdMob nativo)

Solo dime y te lo preparo.

---

## 🆘 Troubleshooting común

### "PWABuilder dice que mi PWA no es válida"
1. Verifica que https://artjmarcos.github.io/MahjongWT/ abre correctamente
2. Verifica que `manifest.json` es accesible en https://artjmarcos.github.io/MahjongWT/manifest.json
3. Verifica que `sw.js` es accesible en https://artjmarcos.github.io/MahjongWT/sw.js

### "El APK generado no instala"
1. Verifica que Allow Unknown Sources esté activado en Android
2. Verifica que el APK no esté corrupto (tamaño > 5 MB)
3. Prueba con `app-release-universal.apk` en su lugar

### "La app se cierra al abrir"
1. Verifica que `start_url` en manifest.json sea `/MahjongWT/` (con slash final)
2. Prueba reinstalando el APK
3. Limpia cache del navegador y vuelve a intentar

### "Google Play rechazó mi app"
Causas comunes:
- ❌ Política de privacidad URL no funciona → verifica la URL
- ❌ Falta info de contacto → completa email y sitio web
- ❌ Permisos innecesarios → tu app solo necesita INTERNET y VIBRATE
- ❌ El APK no está firmado correctamente → PWABuilder siempre firma bien

### "No puedo pagar los $25 USD"
- Necesitas tarjeta de crédito/débito internacional
- Tarjetas prepago Visa/Mastercard también funcionan
- Si no tienes, pide ayuda a un amigo/familiar

---

## 📋 Checklist final (móvil 100%)

### Publicación PWA
- [ ] Cuenta de GitHub creada
- [ ] Repositorio `MahjongWT` creado
- [ ] Archivos subidos a GitHub
- [ ] GitHub Pages activado
- [ ] URL accesible: https://artjmarcos.github.io/MahjongWT/

### PWABuilder
- [ ] https://www.pwabuilder.com abierto desde el móvil
- [ ] URL de tu PWA ingresada
- [ ] Score 100/100 confirmado
- [ ] APK Android generado
- [ ] ZIP descargado al móvil
- [ ] APK extraído del ZIP
- [ ] **Keystore guardado en lugar seguro** ⚠️
- [ ] Contraseña del keystore anotada ⚠️

### Pruebas
- [ ] APK instalado en tu móvil
- [ ] App abre correctamente
- [ ] Splash carga
- [ ] Menú principal visible
- [ ] Juego funciona end-to-end
- [ ] Capturas de pantalla tomadas (mínimo 2)

### Google Play Console
- [ ] Cuenta creada ($25 USD pagados)
- [ ] Perfil de desarrollador completo
- [ ] App creada en Console
- [ ] Ficha de Play Store completa
- [ ] Icono subido
- [ ] Capturas subidas (mínimo 2)
- [ ] Clasificación de contenido obtenida (E)
- [ ] Política de privacidad URL agregada
- [ ] APK release subido
- [ ] Notas de versión en español
- [ ] Rollout iniciado

### Post-publicación
- [ ] App aprobada por Google (1-7 días)
- [ ] App visible en Play Store
- [ ] URL de Play Store anotada
- [ ] Compartir en redes sociales
- [ ] (Futuro) AdMob configurado

---

## 📞 Soporte rápido

- **PWABuilder help**: https://blog.pwabuilder.com
- **GitHub Pages help**: https://docs.github.com/pages
- **Google Play help**: https://support.google.com/googleplay/android-developer
- **AdMob help**: https://support.google.com/admob

---

## 💡 Tips finales

1. **Paciencia con Google**: la primera revisión puede tardar 5-7 días. Las siguientes son más rápidas (1-2 días).

2. **No borres tu repo de GitHub**: tu app nativa carga los archivos desde ahí. Si borras el repo, la app se rompe.

3. **Mantén el keystore SIEMPRE**: si lo pierdes, no podrás actualizar la app. Haz backup en al menos 2 lugares (Drive + email).

4. **Si tienes PC prestado 10 min**: úsalo para subir archivos a GitHub (más rápido que desde el móvil).

5. **Las capturas de pantalla SON importantes**: invierte 5 minutos en hacerlas bien. Son lo primero que ven los usuarios.

---

**¡Tu juego estará en Google Play Store en menos de 1 semana!** 🎉

Mahjong World Tour
