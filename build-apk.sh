#!/usr/bin/env bash
# ============================================================================
# build-apk.sh - Script para compilar el APK de Mahjong World Tour
# ----------------------------------------------------------------------------
# Requisitos previos:
#   1. Node.js 18+ instalado
#   2. Android Studio instalado (con Android SDK)
#   3. Java JDK 17 instalado
#
# Uso:
#   chmod +x build-apk.sh
#   ./build-apk.sh              # genera APK debug
#   ./build-apk.sh release      # genera APK release (requiere keystore)
#   ./build-apk.sh install      # instala APK en dispositivo conectado
# ============================================================================

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuracion
APP_NAME="Mahjong World Tour"
APP_ID="com.artjmarcos.mahjongtour"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}=== Build APK · ${APP_NAME} ===${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "index.html" ] || [ ! -f "ui.js" ]; then
    echo -e "${RED}Error: Debes ejecutar este script desde la carpeta del proyecto${NC}"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado. Descárgalo de https://nodejs.org${NC}"
    exit 1
fi

# Verificar que Capacitor está instalado, si no, instalarlo
if [ ! -d "node_modules/@capacitor" ]; then
    echo -e "${YELLOW}Instalando Capacitor...${NC}"
    npm install @capacitor/core @capacitor/cli @capacitor/android
    npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/navigation-bar
    echo -e "${GREEN}Capacitor instalado${NC}"
fi

# Inicializar Capacitor si no está inicializado
if [ ! -d "android" ]; then
    echo -e "${YELLOW}Inicializando proyecto Android...${NC}"
    npx cap init "${APP_NAME}" "${APP_ID}" --web-dir=.
    npx cap add android
    echo -e "${GREEN}Proyecto Android creado${NC}"
fi

# Copiar archivos web al proyecto Android
echo -e "${YELLOW}Copiando archivos web a Android...${NC}"
npx cap sync android
echo -e "${GREEN}Sincronización completa${NC}"

# Copiar iconos a recursos Android
echo -e "${YELLOW}Copiando iconos...${NC}"
mkdir -p android/app/src/main/res/values
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

# Generar iconos en distintos tamaños si ImageMagick está disponible
if command -v convert &> /dev/null; then
    convert icon-512.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png 2>/dev/null || true
    convert icon-512.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png 2>/dev/null || true
    convert icon-512.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png 2>/dev/null || true
    convert icon-512.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png 2>/dev/null || true
    convert icon-512.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png 2>/dev/null || true
    echo -e "${GREEN}Iconos generados${NC}"
else
    echo -e "${YELLOW}ImageMagick no instalado, copiando icono único...${NC}"
    cp icon-192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
fi

# Generar strings.xml con el nombre de la app
cat > android/app/src/main/res/values/strings.xml << EOF
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">${APP_NAME}</string>
    <string name="title_activity_main">${APP_NAME}</string>
    <string name="package_name">${APP_ID}</string>
    <string name="custom_url_scheme">${APP_ID}</string>
</resources>
EOF

# Generar colors.xml con los colores de la app
cat > android/app/src/main/res/values/colors.xml << EOF
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <color name="colorPrimary">#f2ca50</color>
    <color name="colorPrimaryDark">#d4af37</color>
    <color name="colorAccent">#f2ca50</color>
    <color name="background">#0b1512</color>
    <color name="ic_launcher_background">#0b1512</color>
</resources>
EOF

# Generar styles.xml
cat > android/app/src/main/res/values/styles.xml << EOF
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:windowBackground">@color/background</item>
    </style>
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme">
        <item name="android:background">@color/background</item>
    </style>
</resources>
EOF

# Modificar AndroidManifest.xml para agregar permisos necesarios
MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
    # Hacer backup si no existe
    [ ! -f "${MANIFEST}.bak" ] && cp "$MANIFEST" "${MANIFEST}.bak"

    # Verificar si ya tiene los permisos, si no, agregarlos
    if ! grep -q "android.permission.VIBRATE" "$MANIFEST"; then
        # Insertar permisos después del primer <manifest> tag
        sed -i '/<application/i\
        <uses-permission android:name="android.permission.VIBRATE" />\
        <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\
        <uses-permission android:name="android.permission.WAKE_LOCK" />' "$MANIFEST"
        echo -e "${GREEN}Permisos agregados al AndroidManifest.xml${NC}"
    fi
fi

# Compilar APK
MODE="${1:-debug}"
echo ""
echo -e "${YELLOW}Compilando APK en modo: ${MODE}${NC}"

cd android

if [ "$MODE" = "release" ]; then
    # Build release APK (requiere keystore configurado)
    if [ ! -f "app/release.keystore" ]; then
        echo -e "${YELLOW}Generando keystore de release...${NC}"
        keytool -genkeypair \
            -v \
            -keystore app/release.keystore \
            -alias mahjongtour \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -storepass mahjongtour \
            -keypass mahjongtour \
            -dname "CN=Artj Marcos, OU=Dev, O=MahjongTour, L=Santiago, ST=Santiago, C=CL"
        echo -e "${GREEN}Keystore generado en android/app/release.keystore${NC}"

        # Agregar configuración de signing a build.gradle
        cat >> app/build.gradle << 'GRADLE'

// Configuración de signing para release
android {
    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword 'mahjongtour'
            keyAlias 'mahjongtour'
            keyPassword 'mahjongtour'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
GRADLE
    fi

    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
elif [ "$MODE" = "install" ]; then
    # Build e instalar en dispositivo
    echo -e "${YELLOW}Compilando e instalando en dispositivo...${NC}"
    ./gradlew installDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    echo -e "${GREEN}APK instalado en dispositivo conectado${NC}"
    cd ..
    exit 0
else
    # Build debug APK
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

# Mostrar resultado
if [ -f "android/${APK_PATH}" ]; then
    APK_SIZE=$(du -h "android/${APK_PATH}" | cut -f1)
    echo ""
    echo -e "${GREEN}=== APK COMPILADO EXITOSAMENTE ===${NC}"
    echo -e "📁 Ubicación: ${YELLOW}android/${APK_PATH}${NC}"
    echo -e "📊 Tamaño: ${YELLOW}${APK_SIZE}${NC}"
    echo -e "📦 Modo: ${YELLOW}${MODE}${NC}"
    echo ""
    echo -e "Para instalar en un dispositivo:"
    echo -e "  1. Conecta tu Android por USB con depuración activada"
    echo -e "  2. Ejecuta: ${YELLOW}adb install android/${APK_PATH}${NC}"
    echo -e "  O copia el APK al teléfono y ábrelo"
    echo ""
    echo -e "Para subir a Google Play Store:"
    echo -e "  1. Sube el APK a https://play.google.com/console"
    echo -e "  2. Completa la ficha de la tienda"
    echo -e "  3. Activa el rollout"
else
    echo -e "${RED}Error: No se pudo compilar el APK${NC}"
    exit 1
fi
