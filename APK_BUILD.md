# Guía Completa para Compilar APK · Mahjong World Tour v1.0

Esta guía te lleva paso a paso desde el código hasta tener un **APK instalable** en cualquier Android, listo para Google Play Store.

---

## 📋 Resumen del proceso

```
PWA (HTML/JS) → Capacitor (wrapper nativo) → Android Studio → APK → Google Play
```

**Tiempo total estimado:** 2-4 horas la primera vez (instalación de herramientas)
**Tiempo para builds posteriores:** 5-10 minutos

---

## 🛠️ Paso 1: Instalar requisitos (una sola vez, ~1 hora)

### 1.1 Node.js 18+ (si no lo tienes)
1. Ve a https://nodejs.org
2. Descarga la versión LTS (recomendada)
3. Instala siguiendo el wizard
4. Verifica en terminal:
   ```bash
   node --version   # debe decir v18.x o superior
   npm --version
   ```

### 1.2 Android Studio (incluye Android SDK)
1. Ve a https://developer.android.com/studio
2. Descarga e instala Android Studio
3. En el primer arranque, deja que instale el SDK completo
4. Verifica que tienes Android SDK Platform 34 (API level 34)

### 1.3 Java JDK 17
Android Studio ya incluye un JDK. Verifica:
```bash
# En macOS/Linux
java -version

# Si no aparece, abre Android Studio → Settings → Build Tools → Gradle → Gradle JDK
# Asegúrate que esté seleccionado "Embedded JDK" o JDK 17
```

### 1.4 (Opcional) ImageMagick — para generar iconos en todos los tamaños
- **macOS**: `brew install imagemagick`
- **Linux**: `sudo apt install imagemagick`
- **Windows**: descarga de https://imagemagick.org

Si no lo instalas, el script usa el icono único (igual funciona).

### 1.5 (Opcional) ADB (Android Debug Bridge)
Ya viene con Android Studio. Para verificar desde terminal:
```bash
adb version
```

---

## 🚀 Paso 2: Preparar el proyecto (5 minutos)

### 2.1 Copia los archivos a una carpeta de trabajo
```bash
# Crea una carpeta para el proyecto nativo
mkdir ~/MahjongTour-APK
cd ~/MahjongTour-APK

# Copia todos los archivos del ZIP aquí
# (descomprime el ZIP v7.0 en esta carpeta)
unzip mahjong-tour-v7.0-apk-ready.zip
```

### 2.2 Inicializa npm y package.json
```bash
npm init -y
```

Edita el `package.json` generado y déjalo así:
```json
{
  "name": "mahjong-world-tour",
  "version": "1.0.0",
  "description": "Mahjong World Tour - PWA convertida a APK",
  "scripts": {
    "build:android": "bash build-apk.sh",
    "build:release": "bash build-apk.sh release",
    "install:device": "bash build-apk.sh install"
  },
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/navigation-bar": "^6.0.0"
  }
}
```

### 2.3 Instala dependencias
```bash
npm install
```

---

## 📱 Paso 3: Compilar el APK debug (10 minutos)

### 3.1 Ejecuta el script de build
```bash
chmod +x build-apk.sh
./build-apk.sh
```

El script automáticamente:
1. ✅ Inicializa Capacitor (`npx cap init`)
2. ✅ Crea el proyecto Android (`npx cap add android`)
3. ✅ Sincroniza los archivos web (`npx cap sync`)
4. ✅ Copia los iconos en distintos tamaños
5. ✅ Configura strings.xml, colors.xml, styles.xml
6. ✅ Agrega permisos (VIBRATE, INTERNET, etc.)
7. ✅ Compila el APK con Gradle

Al final verás:
```
=== APK COMPILADO EXITOSAMENTE ===
📁 Ubicación: android/app/build/outputs/apk/debug/app-debug.apk
📊 Tamaño: 8-12 MB
📦 Modo: debug
```

### 3.2 Instala en tu Android
**Opción A: Por USB (recomendado para pruebas)**
1. Activa "Depuración USB" en tu Android (Settings → Developer Options)
2. Conecta el teléfono por USB
3. Ejecuta:
   ```bash
   ./build-apk.sh install
   ```
   O manualmente:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

**Opción B: Copiando el APK**
1. Copia `app-debug.apk` a tu teléfono (WhatsApp, email, USB, etc.)
2. En el teléfono, abre el APK
3. Permite "Instalar apps de origen desconocido" si lo pide
4. ¡Listo! La app aparece en tu launcher

---

## 🔒 Paso 4: Compilar APK Release (para Google Play)

El APK debug es solo para pruebas. Para subir a Google Play necesitas un **APK release firmado**.

### 4.1 Compilar APK release
```bash
./build-apk.sh release
```

El script automáticamente:
1. ✅ Genera un keystore (si no existe) con contraseña `mahjongtour`
2. ✅ Configura Gradle para firmar el release
3. ✅ Compila el APK firmado

El APK release estará en:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 4.2 ⚠️ IMPORTANTE: Guarda tu keystore
El archivo `android/app/release.keystore` es **ÚNICO E IRREEMPLAZABLE**. Si lo pierdes:
- No podrás actualizar la app en Google Play
- Tendrás que crear una app nueva (perderás reviews, descargas, etc.)

**Haz backup AHORA:**
```bash
# Copia el keystore a un lugar seguro
cp android/app/release.keystore ~/Documents/mahjongtour-backup.keystore

# También súbelo a la nube (Google Drive, Dropbox, etc.)
```

### 4.3 Cambiar contraseña del keystore (recomendado)
El script usa contraseña `mahjongtour` por simplicidad. Para producción, cámbiala:

1. Genera un nuevo keystore con contraseña fuerte:
   ```bash
   keytool -genkeypair -v \
     -keystore release.keystore \
     -alias mahjongtour \
     -keyalg RSA -keysize 2048 \
     -validity 10000
   ```

2. Reemplaza el keystore en `android/app/release.keystore`

3. Edita `android/app/build.gradle` y cambia las contraseñas:
   ```gradle
   signingConfigs {
       release {
           storeFile file('release.keystore')
           storePassword 'TU_NUEVA_PASSWORD'
           keyAlias 'mahjongtour'
           keyPassword 'TU_NUEVA_PASSWORD'
       }
   }
   ```

---

## 🎨 Paso 5: Personalizar la app nativa (opcional)

### 5.1 Cambiar el icono de la app
Reemplaza `icon-512.png` por tu icono nuevo (mínimo 512x512 px) y vuelve a ejecutar:
```bash
./build-apk.sh
```

### 5.2 Cambiar splash screen nativo
Capacitor muestra un splash nativo mientras carga la webview. Para personalizarlo:

1. Crea `android/app/src/main/res/drawable/splash.png` (1080x1920 px)
2. Edita `capacitor.config.json`:
   ```json
   "SplashScreen": {
     "launchShowDuration": 2000,
     "backgroundColor": "#0b1512",
     "androidScaleType": "CENTER_CROP",
     "splashFullScreen": true,
     "splashImmersive": true
   }
   ```

### 5.3 Cambiar colores del tema Android
Edita `android/app/src/main/res/values/colors.xml`:
```xml
<color name="colorPrimary">#f2ca50</color>
<color name="colorPrimaryDark">#d4af37</color>
<color name="colorAccent">#f2ca50</color>
```

### 5.4 Ocultar barra de estado (fullscreen)
Edita `capacitor.config.json`:
```json
"StatusBar": {
  "style": "LIGHT",
  "overlaysWebView": true
}
```

---

## 💰 Paso 6: Activar AdMob (anuncios nativos, mayor RPM)

AdMob paga **3-5x más que AdSense web** porque los anuncios son más relevantes en apps nativas.

### 6.1 Crear cuenta de AdMob
1. Ve a https://admob.google.com
2. Regístrate con tu cuenta de Google
3. Completa tu perfil de pago

### 6.2 Crear app en AdMob
1. Click **Apps** → **Add app**
2. Selecciona **Android**
3. ¿Tu app está en Google Play? → **No** (por ahora)
4. Nombre: `Mahjong World Tour`
5. Plataforma: **Android**

### 6.3 Crear unidades de anuncio
Crea 3 unidades (igual que en AdSense web):

| Unidad | Tipo | Nombre |
|--------|------|--------|
| 1 | Banner | `mahjong-banner` |
| 2 | Interstitial | `mahjong-interstitial` |
| 3 | Rewarded | `mahjong-rewarded` |

Anota los IDs de cada unidad (formato `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`).

### 6.4 Instalar plugin AdMob
```bash
npm install @capacitor-community/admob
npx cap sync
```

### 6.5 Configurar en build-config.json
Edita `build-config.json`:
```json
"adMob": {
  "appId": "ca-app-pub-TU_ID_REAL",
  "testMode": false,
  "units": {
    "banner": "ca-app-pub-TU_ID_REAL_BANNER",
    "interstitial": "ca-app-pub-TU_ID_REAL_INTERSTITIAL",
    "rewarded": "ca-app-pub-TU_ID_REAL_REWARDED"
  }
}
```

### 6.6 Inicializar AdMob en la app
Agrega este código al inicio de `ui.js` (justo después de `var UI = (function() {`):

```javascript
// [AdMob] Inicializar anuncios nativos
if (typeof AdMob !== 'undefined') {
    AdMob.initialize({
        initializeForTesting: false,  // true para test ads
    });
}
```

### 6.7 IDs de prueba para desarrollo
Antes de activar anuncios reales, usa IDs de prueba de Google para evitar click fraud:

```javascript
// Test device IDs de Google (NO usan tus IDs reales)
const TEST_IDS = {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
};
```

---

## 📤 Paso 7: Subir a Google Play Store

### 7.1 Crear cuenta de Google Play Console
1. Ve a https://play.google.com/console
2. Paga la **tarifa única de $25 USD** (con tarjeta de crédito)
3. Completa tu perfil de desarrollador

### 7.2 Crear nueva app
1. Click **Crear app**
2. **Nombre**: `Mahjong World Tour`
3. **Idioma predeterminado**: Español (es-419)
4. **App o juego**: Juego
5. **Gratuito o de pago**: Gratuito
6. Acepta las declaraciones

### 7.3 Completar ficha de la tienda
Ve a **Presencia en Google Play Store → Ficha de Play Store**:

#### Detalles principales
- **Nombre de la app**: `Mahjong World Tour`
- **Descripción breve** (80 chars): `Mahjong por América Latina: Chile, Argentina, México y Brasil`
- **Descripción completa** (4000 chars): usa el texto de `MARKETING.md`

#### Imágenes
- **Icono de la app**: sube `icon-512.png` (512x512)
- **Banner de Play Store**: 1024x500 (crea uno con Canva)
- **Capturas de pantalla**: mínimo 2 (teléfono), ideal 5-8

#### Categorización
- **Categoría**: Juegos → Puzzle
- **Tipo de contenido**: Para todos los públicos
- **Etiquetas**: Mahjong, Puzzle, Viajes, Educativo

#### Detalles de contacto
- **Correo**: tu email
- **Sitio web**: `https://artjmarcos.github.io/MahjongWT/`
- **Política de privacidad**: `https://artjmarcos.github.io/MahjongWT/privacy-policy.html`

### 7.4 Clasificación de contenido
1. Ve a **Presencia en Play Store → Clasificación de contenido**
2. Completa el cuestionario IARC (~5 minutos)
3. Recibirás clasificación **E (Everyone)** o **PEGI 3**

### 7.5 Subir el APK release
1. Ve a **Producción → Crear versión**
2. Sube `android/app/build/outputs/apk/release/app-release.apk`
3. **Notas de la versión**:
   ```
   ¡Primera versión de Mahjong World Tour!
   - 160 niveles por Chile, Argentina, México y Brasil
   - Mapa interactivo con zoom satelital
   - Trivia y memorice cultural
   - 21 logros desbloqueables
   - Música temática por país
   - 3 idiomas: español, inglés, portugués
   ```

### 7.6 Revisión y publicación
1. Revisa que todos los campos estén completos (Google te indicará qué falta)
2. Click **Revisar versión**
3. Click **Iniciar rollout en producción**
4. ⏱️ Google revisa tu app: **1-7 días** (suele ser 2-3)
5. ¡Aparece en Google Play!

---

## 🔄 Paso 8: Actualizar la app (futuro)

Cada vez que quieras lanzar una nueva versión:

### 8.1 Actualizar código
```bash
# Edita los archivos que necesites
# ...

# IMPORTANTE: subir versionCode en build-config.json
# y versionName si es release para usuarios
```

Edita `build-config.json`:
```json
{
  "app": {
    "versionName": "1.1.0",   // visible para usuarios
    "versionCode": 2            // DEBE ser mayor que el anterior SIEMPRE
  }
}
```

### 8.2 Compilar nuevo APK
```bash
./build-apk.sh release
```

### 8.3 Subir a Google Play
1. Ve a **Producción → Crear versión**
2. Sube el nuevo APK
3. Agrega notas de versión
4. Click **Iniciar rollout**

La actualización llega a los usuarios en 1-24 horas.

---

## 🆘 Troubleshooting

### "Error: Java JDK no encontrado"
```bash
# Verifica que Android Studio tenga JDK configurado
# Android Studio → Settings → Build, Execution, Deployment → Build Tools → Gradle
# → Gradle JDK = Embedded JDK (o JDK 17)
```

### "Error: SDK de Android no encontrado"
```bash
# Abre Android Studio → SDK Manager
# Instala Android SDK Platform 34
# Acepta las licencias: yes | $ANDROID_HOME/tools/bin/sdkmanager --licenses
```

### "Error: Keystore no encontrado al hacer release"
```bash
# Vuelve a generar el keystore
./build-apk.sh release
# El script lo regenera automáticamente
```

### "Gradle build failed"
```bash
# Limpia el proyecto y reintenta
cd android
./gradlew clean
cd ..
./build-apk.sh
```

### "La app se cierra al abrir (crash)"
1. Verifica que no haya errores en `index.html`
2. Revisa los logs: `adb logcat | grep -i "mahjong"`
3. Verifica que `capacitor.config.json` tenga `webDir: "."`

### "Los anuncios no aparecen"
1. Verifica `testMode: false` en `build-config.json`
2. Espera 24-48 horas después de configurar AdMob
3. Verifica que tu dispositivo NO esté registrado como dispositivo de prueba

### "Google Play rechazó mi app"
Causas comunes:
- ❌ Política de privacidad no funciona (verifica la URL)
- ❌ Falta info de contacto en la ficha
- ❌ Demasiados permisos innecesarios
- ❌ Contenido inapropiado (no es tu caso)
- ❌ El APK no está firmado correctamente

---

## 📊 Comparativa: PWA vs APK nativo

| Aspecto | PWA (web) | APK nativo |
|---------|-----------|------------|
| **Distribución** | URL compartible | Google Play Store |
| **Descubrimiento** | SEO, redes sociales | Búsqueda en Play Store |
| **Instalación** | "Añadir a inicio" | Instalación normal |
| **Offline** | ✅ (Service Worker) | ✅ (mejor) |
| **Notificaciones** | Limitadas | Push notifications nativas |
| **Ad RPM** | $0.30-2 | $1-5 (3-5x más) |
| **IAP** | Difícil | Google Play Billing |
| **Reviews** | No | ⭐⭐⭐⭐⭐ en Play Store |
| **Costo** | Gratis | $25 USD una vez |
| **Mantenimiento** | Bajo | Medio |
| **Usuarios potenciales** | ~3B (smartphones) | ~3B (Android) |

**Recomendación:** Mantén AMBOS. La PWA sirve como demo gratuita + SEO, y el APK genera ingresos reales con AdMob + mayor visibilidad en Play Store.

---

## ✅ Checklist final APK

### Setup (una sola vez)
- [ ] Node.js 18+ instalado
- [ ] Android Studio instalado
- [ ] JDK 17 configurado
- [ ] (Opcional) ImageMagick instalado

### Build
- [ ] `npm install` ejecutado
- [ ] `./build-apk.sh` funciona sin errores
- [ ] APK debug generado en `android/app/build/outputs/apk/debug/`
- [ ] APK instalado en dispositivo de prueba
- [ ] App abre correctamente

### Release
- [ ] `./build-apk.sh release` ejecutado
- [ ] Keystore guardado en lugar seguro (backup!)
- [ ] Contraseña del keystore cambiada
- [ ] APK release firmado generado

### Google Play
- [ ] Cuenta de Google Play Console creada ($25)
- [ ] App creada en Play Console
- [ ] Ficha de Play Store completa
- [ ] Icono, banner y screenshots subidos
- [ ] Clasificación de contenido obtenida
- [ ] Política de privacidad URL accesible
- [ ] APK release subido
- [ ] Notas de versión en español
- [ ] Rollout iniciado
- [ ] App aprobada por Google (1-7 días)

### AdMob (opcional, después de publicación)
- [ ] Cuenta AdMob creada
- [ ] App Android añadida en AdMob
- [ ] 3 unidades de anuncio creadas
- [ ] Plugin @capacitor-community/admob instalado
- [ ] IDs reales configurados en build-config.json
- [ ] testMode = false
- [ ] App recompilada y subida a Play Store

---

## 📞 Soporte

- **Capacitor docs**: https://capacitorjs.com/docs
- **Android Studio**: https://developer.android.com/studio/intro
- **Google Play Console help**: https://support.google.com/googleplay/android-developer
- **AdMob help**: https://support.google.com/admob

---

**¡Felicidades! Tu juego estará en Google Play Store pronto.** 🎉

Hecho con cariño desde Chile 🇨🇱
