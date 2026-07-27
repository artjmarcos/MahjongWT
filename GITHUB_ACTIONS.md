# Plan B: GitHub Actions desde el móvil

Si PWABuilder te da problemas, este es el plan alternativo: **GitHub Actions compila el APK en la nube automáticamente**.

---

## 🎯 Cómo funciona

1. Haces `git push` desde el móvil (con la app GitHub)
2. GitHub detecta el cambio
3. GitHub compila el APK en sus servidores (gratis)
4. Descargas el APK desde la pestaña "Actions"

**Tiempo de build:** 10-15 min
**Costo:** Gratis (hasta 2000 min/mes para repos públicos)

---

## 📋 Setup (5 min, una sola vez)

### 1. Copiar el workflow a tu repo
El archivo `.github/workflows/build-apk.yml` ya está en tu ZIP. Solo súbelo a GitHub igual que los demás archivos.

### 2. Verificar que el workflow aparece
1. Abre https://github.com/artjmarcos/MahjongWT/actions
2. Deberías ver un workflow llamado "Build Android APK"

### 3. Listo, no necesitas configurar nada más

---

## 🚀 Uso diario (desde el móvil)

### Generar APK (cualquier cambio)

1. **Edita cualquier archivo** (ej: `index.html`) en la app GitHub móvil
   - O sube un archivo nuevo con el botón **+**
2. **Commit** → "Save" / "Commit changes"
3. GitHub detecta el cambio y **empieza a compilar automáticamente**
4. Ve a la pestaña **Actions** (https://github.com/artjmarcos/MahjongWT/actions)
5. Verás el build en progreso:
   ```
   🟡 Build Android APK
   └── In progress... (3 min)
   ```
6. Espera 10-15 min hasta que aparezca:
   ```
   ✅ Build Android APK
   └── Completed in 12 min
   ```
7. Click en el build exitoso
8. Scroll abajo hasta **"Artifacts"**
9. Descarga:
   - `mahjong-world-tour-apk` (APK release firmado)
   - `mahjong-world-tour-debug-apk` (APK debug para pruebas)
   - `mahjong-keystore` (¡GUÁRDALO! Es irreemplazable)

### Descargar desde el móvil
- Los artifacts se descargan como ZIP
- Ábrelo con **Files** de Android
- Extrae el `.apk` y el `.keystore`
- Instala el APK (permite origen desconocido)
- **Copia el keystore a Google Drive** (backup crítico)

---

## 🔧 Disparar build manualmente

Si quieres recompilar sin hacer cambios al código:

1. Ve a https://github.com/artjmarcos/MahjongWT/actions/workflows/build-apk.yml
2. Click **"Run workflow"** (botón arriba a la derecha)
3. Selecciona branch `main`
4. Click **"Run workflow"** verde
5. Se ejecutará en 1-2 min

---

## 💡 Ventajas sobre PWABuilder

| Aspecto | PWABuilder | GitHub Actions |
|---------|------------|----------------|
| Tipo de APK | TWA (Trusted Web Activity) | Capacitor nativo |
| AdMob nativo | ❌ No | ✅ Sí (mayor RPM) |
| Push notifications | ❌ Limitadas | ✅ Nativas |
| Acceso a hardware | Limitado | Completo |
| Customización | Baja | Alta |
| Build automático | Manual | Automático con cada push |
| Velocidad | 2-5 min | 10-15 min |
| Complejidad | Muy fácil | Media |

---

## 🆘 Troubleshooting

### "Build failed"
1. Click en el build fallido
2. Lee el log de error (suele estar al final)
3. Errores comunes:
   - `npm install` falló: verifica `package.json` en el repo
   - `gradle build failed`: revisa que `index.html` y `ui.js` estén subidos
   - `keystore error`: el workflow regenera el keystore automáticamente, no debería fallar

### "No aparece la pestaña Actions"
- Verifica que tu repo es público
- GitHub Actions está habilitado por defecto en repos públicos

### "El artifact no se descarga"
- Los artifacts expiran en 30 días
- Si necesitas uno viejo, re-ejecuta el workflow

### "Quiero cambiar el keystore"
1. Genera uno nuevo en PC (o pídeme ayuda)
2. Súbelo a `android/app/release.keystore` en tu repo
3. Modifica el workflow para no regenerar el keystore
4. El nuevo keystore se usará en el próximo build

---

## 📞 Comparativa final

```
¿Tienes prisa y solo quieres el APK rápido?
→ Usa PWABUILDER_MOBILE.md (5 min)

¿Quieres más control, AdMob nativo, push notifications?
→ Usa este plan B (GitHub Actions)

¿Tienes PC prestado 1 hora?
→ Usa APK_BUILD.md (Capacitor + Android Studio)
```

---

**Plan recomendado para ti:** empieza con **PWABuilder** (5 min, fácil), y si quieres más control después, migra a GitHub Actions.

Mahjong World Tour
