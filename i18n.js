// ============================================================================
// i18n.js - Sistema de internacionalizacion para Mahjong World Tour
// Idiomas soportados: Español (es), English (en), Português (pt)
// ----------------------------------------------------------------------------
// NOTA: El contenido cultural (nombres de zonas, descripciones de fotos,
// trivia, misiones, logros) se mantiene en español por diseno, ya que forma
// parte de la identidad del juego. Solo se traducen los textos de UI chrome
// (menus, botones, ajustes, modales, mensajes del sistema).
// ============================================================================

var I18n = (function() {
    'use strict';

    var LANG_KEY = 'appLang';
    var SUPPORTED = [
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'pt', label: 'Português', flag: '🇧🇷' }
    ];

    // Diccionario de traducciones. Clave -> { es, en, pt }
    var DICT = {
        // ---- Splash ----
        'splash.outfit':       { es: 'OUTFIT',           en: 'OUTFIT',           pt: 'OUTFIT' },
        'splash.title':        { es: 'Descubre<br>America', en: 'Discover<br>America', pt: 'Descubra<br>America' },
        'splash.subtitle':     { es: 'WORLD TOUR',       en: 'WORLD TOUR',       pt: 'WORLD TOUR' },
        'splash.tagline':      { es: 'Viaje Meditativo', en: 'Meditative Journey', pt: 'Viagem Meditativa' },
        'splash.made':         { es: 'Mahjong World Tour', en: 'Mahjong World Tour', pt: 'Mahjong World Tour' },
        'splash.cuna':         { es: '', en: '', pt: '' },

        // ---- Splash frases ----
        'splash.frase.1': { es: '#Viaja por América y conviértete en Maestro Mahjong', en: '#Travel across America and become a Mahjong Master', pt: '#Viaje pela América e torne-se um Mestre Mahjong' },
        'splash.frase.2': { es: '#Descubre los rincones más mágicos del continente', en: '#Discover the most magical corners of the continent', pt: '#Descubra os cantos mais mágicos do continente' },
        'splash.frase.3': { es: '#Cada ficha cuenta una historia milenaria', en: '#Each tile tells a thousand-year-old story', pt: '#Cada peça conta uma história milenar' },
        'splash.frase.4': { es: '#Conecta con la cultura de cuatro países', en: '#Connect with the culture of four countries', pt: '#Conecte-se com a cultura de quatro países' },
        'splash.frase.5': { es: '#Donde la calma se vuelve juego', en: '#Where calm becomes a game', pt: '#Onde a calma se torna jogo' },
        'splash.frase.6': { es: '#Mahjong: un viaje, mil destinos', en: '#Mahjong: one journey, a thousand destinations', pt: '#Mahjong: uma viagem, mil destinos' },
        'splash.frase.7': { es: '#Tu aventura comienza hoy', en: '#Your adventure begins today', pt: '#Sua aventura começa hoje' },
        'splash.frase.8': { es: '#Relaja tu mente, despierta tu espíritu viajero', en: '#Relax your mind, awaken your traveling spirit', pt: '#Relaxe a mente, desperte seu espírito viajante' },

        // ---- Menu principal ----
        'menu.stars':          { es: 'estrellas',     en: 'stars',     pt: 'estrelhas' },
        'menu.album':          { es: 'ALBUM DE VIAJES', en: 'TRAVEL ALBUM', pt: 'ÁLBUM DE VIAGENS' },
        'menu.logros':         { es: 'LOGROS',        en: 'ACHIEVEMENTS', pt: 'CONQUISTAS' },
        'menu.tienda':         { es: 'TIENDA',        en: 'SHOP',      pt: 'LOJA' },
        'menu.ajustes':        { es: 'AJUSTES',       en: 'SETTINGS',  pt: 'AJUSTES' },
        'menu.salir':          { es: 'SALIR',         en: 'EXIT',      pt: 'SAIR' },
        'menu.regiones_niveles': { es: '4 regiones - 40 niveles', en: '4 regions - 40 levels', pt: '4 regiões - 40 níveis' },
        'menu.completado':     { es: 'completado',    en: 'completed', pt: 'concluído' },

        // ---- Ajustes ----
        'ajustes.titulo':      { es: '⚙️ Ajustes',    en: '⚙️ Settings', pt: '⚙️ Ajustes' },
        'ajustes.audio':       { es: '🔊 Audio',      en: '🔊 Audio',  pt: '🔊 Áudio' },
        'ajustes.musica':      { es: 'Música',        en: 'Music',     pt: 'Música' },
        'ajustes.efectos':     { es: 'Efectos de sonido', en: 'Sound effects', pt: 'Efeitos sonoros' },
        'ajustes.vibracion':   { es: 'Vibración',     en: 'Vibration', pt: 'Vibração' },
        'ajustes.prefencias':  { es: '📋 Preferencias', en: '📋 Preferences', pt: '📋 Preferências' },
        'ajustes.idioma':      { es: '🌐 Idioma',     en: '🌐 Language', pt: '🌐 Idioma' },
        'ajustes.acerca':      { es: 'ℹ️ Acerca de',  en: 'ℹ️ About',  pt: 'ℹ️ Sobre' },
        'ajustes.compartir':   { es: '📤 Compartir con amigos', en: '📤 Share with friends', pt: '📤 Compartilhar com amigos' },
        'ajustes.reset':       { es: '🗑️ Reiniciar progreso', en: '🗑️ Reset progress', pt: '🗑️ Reiniciar progresso' },
        'ajustes.version':     { es: 'Mahjong World Tour', en: 'Mahjong World Tour', pt: 'Mahjong World Tour' },

        // ---- Selector de idioma ----
        'idioma.titulo':       { es: 'Selecciona un idioma', en: 'Select a language', pt: 'Selecione um idioma' },
        'idioma.nota':         { es: 'Los nombres de zonas, fotos y trivia se mantienen en español.', en: 'Zone names, photos and trivia remain in Spanish.', pt: 'Nomes de zonas, fotos e trivia permanecem em espanhol.' },

        // ---- Victoria ----
        'victoria.titulo':     { es: '¡Nivel Completado!', en: 'Level Complete!', pt: 'Nível Concluído!' },
        'victoria.doble':      { es: '🎬 Doble recompensa', en: '🎬 Double reward', pt: '🎬 Recompensa dupla' },
        'victoria.siguiente':  { es: 'SIGUIENTE NIVEL ▶', en: 'NEXT LEVEL ▶', pt: 'PRÓXIMO NÍVEL ▶' },
        'victoria.volver':     { es: 'VOLVER', en: 'BACK', pt: 'VOLTAR' },

        // ---- Power-ups ----
        'powerup.pista':       { es: 'Pista',         en: 'Hint',      pt: 'Dica' },
        'powerup.mezclar':     { es: 'Mezclar',       en: 'Shuffle',   pt: 'Embaralhar' },
        'powerup.deshacer':    { es: 'Deshacer',      en: 'Undo',      pt: 'Desfazer' },
        'powerup.tiempo':      { es: '+Tiempo',       en: '+Time',     pt: '+Tempo' },

        // ---- Tienda ----
        'tienda.titulo':       { es: '🛒 Tienda',     en: '🛒 Shop',   pt: '🛒 Loja' },
        'tienda.monedas':      { es: 'monedas',       en: 'coins',     pt: 'moedas' },
        'tienda.ayuda':        { es: 'Compra power-ups para ayudarte.', en: 'Buy power-ups to help you.', pt: 'Compre power-ups para te ajudar.' },
        'tienda.pista':        { es: '💡 Pista extra', en: '💡 Extra hint', pt: '💡 Dica extra' },
        'tienda.mezclar':      { es: '🔀 Mezclar extra', en: '🔀 Extra shuffle', pt: '🔀 Embaralhar extra' },
        'tienda.deshacer':     { es: '↩️ Deshacer extra', en: '↩️ Extra undo', pt: '↩️ Desfazer extra' },

        // ---- Album ----
        'album.titulo':        { es: '🌎 Album de Viajes', en: '🌎 Travel Album', pt: '🌎 Álbum de Viagens' },

        // ---- Mensajes del sistema ----
        'msg.tiempo':          { es: 'Tiempo agotado', en: 'Time up', pt: 'Tempo esgotado' },
        'msg.monedas_insuf':   { es: 'Monedas insuficientes', en: 'Not enough coins', pt: 'Moedas insuficientes' },
        'msg.compartir_no':    { es: 'No se pudo compartir', en: 'Could not share', pt: 'Não foi possível compartilhar' },
        'msg.enlace_copiado':  { es: '📋 Enlace copiado', en: '📋 Link copied', pt: '📋 Link copiado' },
        'msg.reset_confirma':  { es: '¿Estás seguro de que quieres reiniciar todo tu progreso? Esta acción no se puede deshacer.', en: 'Are you sure you want to reset all your progress? This action cannot be undone.', pt: 'Tem certeza de que deseja reiniciar todo o seu progresso? Esta ação não pode ser desfeita.' },
        'msg.bloqueada':       { es: 'Ficha bloqueada', en: 'Tile blocked', pt: 'Peça bloqueada' },
        'msg.sin_pistas':      { es: 'No hay pistas disponibles', en: 'No hints available', pt: 'Nenhuma dica disponível' },
        'msg.sin_mezclar':     { es: 'No quedan mezclas', en: 'No shuffles left', pt: 'Sem embaralhamentos' },
        'msg.sin_deshacer':    { es: 'No hay nada que deshacer', en: 'Nothing to undo', pt: 'Nada para desfazer' },
        'msg.tutorial_listo':  { es: '¡Tutorial completado!', en: 'Tutorial completed!', pt: 'Tutorial concluído!' },
        'msg.combo':           { es: 'COMBO', en: 'COMBO', pt: 'COMBO' },

        // ---- Acerca de ----
        'acerca.titulo':       { es: 'Descubre América', en: 'Discover America', pt: 'Descubra a América' },
        'acerca.desc':         { es: 'Un viaje meditativo por Chile, Argentina, México y Brasil a través del Mahjong. Descubre rincones mágicos, supera desafíos y conviértete en Maestro Mahjong.', en: 'A meditative journey through Chile, Argentina, Mexico and Brazil via Mahjong. Discover magical places, overcome challenges and become a Mahjong Master.', pt: 'Uma viagem meditativa pelo Chile, Argentina, México e Brasil através do Mahjong. Descubra lugares mágicos, supere desafios e torne-se um Mestre Mahjong.' },
        'acerca.version':      { es: 'Versión', en: 'Version', pt: 'Versão' },
        'acerca.cerrar':       { es: 'Cerrar', en: 'Close', pt: 'Fechar' },

        // ---- Despedida ----
        'despedida.1': { es: '¡Hasta pronto, viajero! 🌎', en: 'See you soon, traveler! 🌎', pt: 'Até logo, viajante! 🌎' },
        'despedida.2': { es: '¡Te esperamos de vuelta! 🎴', en: 'We hope to see you back! 🎴', pt: 'Esperamos você de volta! 🎴' },
        'despedida.3': { es: '¡Vuelve a descubrir América! 🗺️', en: 'Come back to discover America! 🗺️', pt: 'Volte a descobrir a América! 🗺️' },
        'despedida.4': { es: '¡Tu aventura Mahjong continúa mañana! ⭐', en: 'Your Mahjong adventure continues tomorrow! ⭐', pt: 'Sua aventura Mahjong continua amanhã! ⭐' },
        'despedida.footer': { es: 'DESCUBRE AMÉRICA · WORLD TOUR', en: 'DISCOVER AMERICA · WORLD TOUR', pt: 'DESCUBRA A AMÉRICA · WORLD TOUR' },

        // ---- Tutorial / UI intra-juego ----
        'game.nivel':          { es: 'Nivel', en: 'Level', pt: 'Nível' },
        'game.dificultad_facil': { es: 'Fácil', en: 'Easy', pt: 'Fácil' },
        'game.dificultad_normal': { es: 'Normal', en: 'Normal', pt: 'Normal' },
        'game.dificultad_dificil': { es: 'Difícil', en: 'Hard', pt: 'Difícil' },
        'game.selecciona_dificultad': { es: 'Selecciona dificultad', en: 'Select difficulty', pt: 'Selecione a dificuldade' }
    };

    // Idioma actual (persistente).
    var currentLang = localStorage.getItem(LANG_KEY) || detectarIdiomaNavegador();

    function detectarIdiomaNavegador() {
        var n = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
        if (n.indexOf('pt') === 0) return 'pt';
        if (n.indexOf('en') === 0) return 'en';
        return 'es'; // default
    }

    // Devuelve la traduccion de una clave. Si no existe, devuelve la clave.
    function t(key) {
        var entry = DICT[key];
        if (!entry) return key;
        return entry[currentLang] || entry.es || key;
    }

    // Devuelve la lista de idiomas soportados (para el selector).
    function getSupported() { return SUPPORTED; }

    // Devuelve el codigo del idioma actual.
    function getCurrent() { return currentLang; }

    // Devuelve el label legible del idioma actual.
    function getCurrentLabel() {
        for (var i = 0; i < SUPPORTED.length; i++) {
            if (SUPPORTED[i].code === currentLang) return SUPPORTED[i].label;
        }
        return 'Español';
    }

    // Cambia el idioma y persiste.
    function setLang(code) {
        for (var i = 0; i < SUPPORTED.length; i++) {
            if (SUPPORTED[i].code === code) {
                currentLang = code;
                localStorage.setItem(LANG_KEY, code);
                document.documentElement.lang = code;
                return true;
            }
        }
        return false;
    }

    // Inicializa el atributo lang del documento.
    function init() {
        document.documentElement.lang = currentLang;
    }

    init();

    return Object.freeze({
        t: t,
        getSupported: getSupported,
        getCurrent: getCurrent,
        getCurrentLabel: getCurrentLabel,
        setLang: setLang,
        LANG_KEY: LANG_KEY
    });
})();
