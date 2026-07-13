// ========== FOTOS DE CHILE ==========
var nortePhotos = [
    { name:'Piedras Rojas', url:'https://drive.google.com/thumbnail?id=1F0IYAE6mROqz0nBtOrRL0-r-7xMQFwhb&sz=w400', zone:'norte', nota:'Donde la tierra se viste de fuego.' },
    { name:'Laguna Miscanti', url:'https://drive.google.com/thumbnail?id=1UQtlAR9wOdNBsC-E2XnYpLEbCXPDGtsA&sz=w400', zone:'norte', nota:'Un espejo de agua que toca el cielo.' },
    { name:'Valle de la Luna', url:'https://drive.google.com/thumbnail?id=14Od2N2_ZkM4avnh1UiOHI6U3gqeMxLny&sz=w400', zone:'norte', nota:'Caminar entre estrellas sin salir de la Tierra.' },
    { name:'Iglesia', url:'https://drive.google.com/thumbnail?id=1CU-oHqUlBsoeit8D7THQCnvdzeE3Ri0o&sz=w400', zone:'norte', nota:'Adobes que guardan siglos de fe.' },
    { name:'Flamenco', url:'https://drive.google.com/thumbnail?id=14Qdu0r0OuSeZgFb9-Nz1VSq0ytx_SqG1&sz=w400', zone:'norte', nota:'Bailarines rosados sobre sal blanca.' },
    { name:'La Portada', url:'https://drive.google.com/thumbnail?id=1cLUas6xEls2ZgtyI14qiX04KLDjroqcG&sz=w400', zone:'norte', nota:'El mar tallando eternamente la piedra.' },
    { name:'Lagunas Escondidas', url:'https://drive.google.com/thumbnail?id=1dKEA6oYUsiEXfE5Yf2-Yp8Eu0f6baMvK&sz=w400', zone:'norte', nota:'Secretos de agua escondidos al sol.' },
    { name:'Desierto Florido', url:'https://drive.google.com/thumbnail?id=1zw6EbP5jjmpuM6izdhL9GTbrUPv2_pEg&sz=w400', zone:'norte', nota:'La vida florece donde parece imposible.' },
    { name:'Géiser del Tatio', url:'https://drive.google.com/thumbnail?id=1myfk3mUjy78mLbMvSe1pjdXw8uvRism-&sz=w400', zone:'norte', nota:'La tierra respirando vapor sagrado.' },
    { name:'Valle del Arcoíris', url:'https://drive.google.com/thumbnail?id=1glWxef_1S66sAAIwemQx1_KXEnPKwtam&sz=w400', zone:'norte', nota:'Cerros pintados por manos divinas.' },
    { name:'Lagunas Altiplánicas', url:'https://drive.google.com/thumbnail?id=19R2ZGOtvO9iOcLhOtVcTpDATOb4igup6&sz=w400', zone:'norte', nota:'Donde el cielo se detiene a descansar.' },
    { name:'Salar de Atacama', url:'https://drive.google.com/thumbnail?id=1grEzPHz96h3nI3Am8DRBbdN3PFs71-or&sz=w400', zone:'norte', nota:'Un mar de sal que nunca existió.' },
];
var centroPhotos = [
    { name:'Costanera Center', url:'https://drive.google.com/thumbnail?id=1nGUkO0nawN3gOwjW21hXCIDNYPFegMt0&sz=w400', zone:'centro', nota:'El futuro creciendo hacia el cielo.' },
    { name:'Castillo Wulff', url:'https://drive.google.com/thumbnail?id=1yv2VBxXp9gu27IFAm5tN-IiumJ7sspBe&sz=w400', zone:'centro', nota:'Donde el mar abraza a la piedra.' },
    { name:'Cerro San Cristobal', url:'https://drive.google.com/thumbnail?id=1HCxBgrT5lDyhSLe2otrp4w2ugBBDXSbX&sz=w400', zone:'centro', nota:'La ciudad entera a tus pies.' },
    { name:'Cerro Santa Lucía', url:'https://drive.google.com/thumbnail?id=1R-r4Tt1TIc9A7VJ1_-_iXy2P2NpZfOsN&sz=w400', zone:'centro', nota:'Un jardín escondido en la urbe.' },
    { name:'Cordillera de Los Andes', url:'https://drive.google.com/thumbnail?id=1Vy-KF3PCdLQTPg-9grzLVjyWTebzlCHb&sz=w400', zone:'centro', nota:'La espina dorsal del continente.' },
    { name:'Atardecer Santiago', url:'https://drive.google.com/thumbnail?id=1PyuMXVS-J7z4Ch1u3mFt27E6wmkpEK5L&sz=w400', zone:'centro', nota:'El cielo ardiendo de despedida.' },
    { name:'Embalse El Yeso', url:'https://drive.google.com/thumbnail?id=1Ay1YRncILC0rm0QZM_cEn2Vodu23cOCd&sz=w400', zone:'centro', nota:'Zafiro líquido entre montañas.' },
    { name:'Centro de Santiago', url:'https://drive.google.com/thumbnail?id=1VqAz0OrJZ3kufu5_yj7M6zs1NgUy6Byw&sz=w400', zone:'centro', nota:'El corazón que nunca duerme.' },
    { name:'Barrio Lastarria', url:'https://drive.google.com/thumbnail?id=16yL_2czoYeGo8Ps0yq2eAunMaMnx2e0F&sz=w400', zone:'centro', nota:'Donde el arte respira en cada esquina.' },
    { name:'Viñedos', url:'https://drive.google.com/thumbnail?id=1xFEIBTub8gBh1W5KRq2_ZBiUNmrFFJnH&sz=w400', zone:'centro', nota:'La tierra ofrece su vino al sol.' },
    { name:'Parque La Campana', url:'https://drive.google.com/thumbnail?id=1j6zc5a3Fs66WF4RNzL8CS0DxNrgeH9ll&sz=w400', zone:'centro', nota:'Bosques que el tiempo olvidó.' },
    { name:'Caleta Horcón', url:'https://drive.google.com/thumbnail?id=1891kWifKa-U9pkBRtkPRtmpR09IRPpsm&sz=w400', zone:'centro', nota:'El mar entrega sus tesoros cada alba.' },
];
var surPhotos = [
    { name:'Palafitos', url:'https://drive.google.com/thumbnail?id=1AmW36m9FQyk4YCmIIl4jT_pML24l5p8d&sz=w400', zone:'sur', nota:'Casas que bailan sobre el agua.' },
    { name:'Rio Calle Calle', url:'https://drive.google.com/thumbnail?id=120O2TkWrtd-pJnsCqv6ktR3Z-kXZ_37i&sz=w400', zone:'sur', nota:'Aguas que susurran antiguas historias.' },
    { name:'Volcán Villarrica', url:'https://drive.google.com/thumbnail?id=1X-7YtR48yGYGfRasz4mLOgnx8RsXPCPC&sz=w400', zone:'sur', nota:'Un gigante durmiente de fuego.' },
    { name:'Río Tolten', url:'https://drive.google.com/thumbnail?id=1yR4_putOUKXtkjcFUp4j680VCMiZpB6b&sz=w400', zone:'sur', nota:'Camino de agua hacia el mar.' },
    { name:'Selva valdiviana', url:'https://drive.google.com/thumbnail?id=1CfegotOgyuSQ_3LpVQRYUeFOgcepX8jB&sz=w400', zone:'sur', nota:'Verde eterno, humedad sagrada.' },
    { name:'Volcán Osorno', url:'https://drive.google.com/thumbnail?id=1qHxn6xYIMKduZ55urTczocbY8pQo6fL0&sz=w400', zone:'sur', nota:'Guardián perfecto de los lagos.' },
    { name:'Puerto Varas', url:'https://drive.google.com/thumbnail?id=1c8lbpmfV_tPnO7RFu_BJ4wWJMgIgAeue&sz=w400', zone:'sur', nota:'Donde los sueños se reflejan.' },
    { name:'Mercado fluvial', url:'https://drive.google.com/thumbnail?id=1t0G1sHMmV0EfZFa3J2wlpW6qzb2Zexai&sz=w400', zone:'sur', nota:'Sabores frescos del río al plato.' },
    { name:'Martin pescador', url:'https://drive.google.com/thumbnail?id=1MDDIDV3T6IOPgE5tXsF0TgP_ZBun-xhK&sz=w400', zone:'sur', nota:'Un destello azul entre los juncos.' },
    { name:'Volcán Lonquimay', url:'https://drive.google.com/thumbnail?id=1Y1KoBuViE5kXhMI8jXs0NptFhYQcRlgS&sz=w400', zone:'sur', nota:'Nieve y fuego abrazándose.' },
    { name:'Puente Bastidas', url:'https://drive.google.com/thumbnail?id=1uovAMwK7ud7r3byH3y31ESh2-_z6Uuup&sz=w400', zone:'sur', nota:'Un hilo entre dos orillas.' },
    { name:'Viaducto del Malleco', url:'https://drive.google.com/thumbnail?id=15HOHLT2otsmj5AJ5pDmv5k8h3VtlzjSC&sz=w400', zone:'sur', nota:'Acero desafiando al vacío.' },
];
var patagoniaPhotos = [
    { name:'Torres del Paine', url:'https://drive.google.com/thumbnail?id=15ax4Kz362p7z5yTjbgd8z9b98ha3HfTh&sz=w400', zone:'austral', nota:'Catedrales de roca del fin del mundo.' },
    { name:'Punta Arenas', url:'https://drive.google.com/thumbnail?id=18bTBxQKTjcVHaBdkZpPh967esE5MD1PL&sz=w400', zone:'austral', nota:'Donde el viento cuenta leyendas.' },
    { name:'Lago Grey', url:'https://drive.google.com/thumbnail?id=1-o2SJrZDqQE64vESRbYExBcEH1lzHaPW&sz=w400', zone:'austral', nota:'Hielo milenario navegando el agua.' },
    { name:'Glaciar Grey', url:'https://drive.google.com/thumbnail?id=1_VLPDVx6WBuBiA4hEegwtLWGZJ285DMB&sz=w400', zone:'austral', nota:'Tiempo congelado en azul eterno.' },
    { name:'Valle del Francés', url:'https://drive.google.com/thumbnail?id=1tVxHCA0R_4f4apJse_hvco32R0nVHc3R&sz=w400', zone:'austral', nota:'Un anfiteatro esculpido por glaciares.' },
    { name:'Estancia Patagónica', url:'https://drive.google.com/thumbnail?id=1cY0MZt2mekm40M0lynkh6CypXNX4PZ-G&sz=w400', zone:'austral', nota:'La soledad más bella del planeta.' },
    { name:'Lago Pehoé', url:'https://drive.google.com/thumbnail?id=1NpBgGLaGErifAqGG0m5cjJR2zfmB07x7&sz=w400', zone:'austral', nota:'Un zafiro al pie de las torres.' },
    { name:'Canal Beagle', url:'https://drive.google.com/thumbnail?id=1Y--szySJeRA54gtRZgMWX2rXLoURu654&sz=w400', zone:'austral', nota:'Aguas que navegan hacia la nada.' },
    { name:'Cabo de Hornos', url:'https://drive.google.com/thumbnail?id=1exOBlMQYYveF6J02irHIofpI2nUo9U7A&sz=w400', zone:'austral', nota:'El último suspiro del continente.' },
    { name:'Isla Magdalena', url:'https://drive.google.com/thumbnail?id=1awWCm8OHQ2vUPdR1-1XVSyqBXKXDIopk&sz=w400', zone:'austral', nota:'Pingüinos dueños del viento.' },
    { name:'Puerto Williams', url:'https://drive.google.com/thumbnail?id=1YUC001Cd2vKwxNyV1ri1nlcDcQY3yxip&sz=w400', zone:'austral', nota:'Tierra de gigantes y leyendas.' },
    { name:'Ventisquero Colgante', url:'https://drive.google.com/thumbnail?id=1PQ9x8ocUO_H2l7QmCHguro8M0HJS4aPW&sz=w400', zone:'austral', nota:'Hielo suspendido en el aire.' },
];
var argentinaNortePhotos = [
    { name:'Quebrada de Humahuaca', url:'https://drive.google.com/thumbnail?id=1uwaDZGOxkdgwZh-Xb3kDYdjB7BVHEVyh&sz=w400', zone:'argentina-norte', nota:'Un arcoíris dormido entre montañas.' },
    { name:'Cerro 7 Colores', url:'https://drive.google.com/thumbnail?id=1xGdn2yjxwquDyAQKBsmg9INXr4NomCzk&sz=w400', zone:'argentina-norte', nota:'La paleta de los dioses.' },
    { name:'Salinas Grandes', url:'https://drive.google.com/thumbnail?id=1xGdn2yjxwquDyAQKBsmg9INXr4NomCzk&sz=w400', zone:'argentina-norte', nota:'Un desierto blanco de sal infinita.' },
    { name:'Cuesta de Lipán', url:'https://drive.google.com/thumbnail?id=16NaOVDOdGL_5bO5e9Rzco76T28hcId_W&sz=w400', zone:'argentina-norte', nota:'El camino que trepa las nubes.' },
    { name:'Pucará de Tilcara', url:'https://drive.google.com/thumbnail?id=1iOlTgQKYeUv8CmL5eo_Xji-c0x19NTX8&sz=w400', zone:'argentina-norte', nota:'Piedras que aún defienden su hogar.' },
    { name:'Cafayate', url:'https://drive.google.com/thumbnail?id=1JoGF-I8Tjy6xJ0YlO1THzJKMPqrNytBk&sz=w400', zone:'argentina-norte', nota:'Donde el sol se vuelve vino.' },
    { name:'Tren a las Nubes', url:'https://drive.google.com/thumbnail?id=168XM8s329lphZbPB8lWBu_EzdtUHJgV6&sz=w400', zone:'argentina-norte', nota:'Un viaje que roza el cielo.' },
    { name:'Ruinas de Quilmes', url:'https://drive.google.com/thumbnail?id=1b217TXK5tARb4E5ha8gpOJsqd1J-MAjK&sz=w400', zone:'argentina-norte', nota:'Ecos de una resistencia eterna.' },
    { name:'Piedra Pómez', url:'https://drive.google.com/thumbnail?id=1hkSjwTHKIeiTc7SSUQX-3mMJ0IYHry4r&sz=w400', zone:'argentina-norte', nota:'Esculturas talladas por el viento.' },
    { name:'Volcán Llullaillaco', url:'https://drive.google.com/thumbnail?id=160i15aGgwKQUp9zvFkF97QsdQYaXsJO_&sz=w400', zone:'argentina-norte', nota:'El guardián de los misterios sagrados.' },
    { name:'Museo de Arqueología', url:'https://drive.google.com/thumbnail?id=1SbJeLKXcy3GJIC3BIPqcWFMAtJFcqu1t&sz=w400', zone:'argentina-norte', nota:'Donde el pasado niega morir.' },
    { name:'Termas de Reyes', url:'https://drive.google.com/thumbnail?id=1V4iPmI3BV6VfCrl6a391vg7pGdXoiySI&sz=w400', zone:'argentina-norte', nota:'El calor secreto de la montaña.' },
];
var argentinaCentroPhotos = [
    { name:'Obelisco', url:'https://drive.google.com/thumbnail?id=10ZOMdYNbi5kOhyMKx5eHkkjNZUm_jl6I&sz=w400', zone:'argentina-centro', nota:'Un dedo de acero apuntando al cielo.' },
    { name:'Barrio La Boca', url:'https://drive.google.com/thumbnail?id=1zrmqqgnLiZyi5ZWeCNtL_MkdPX_h6PsI&sz=w400', zone:'argentina-centro', nota:'Donde el tango pinta las paredes.' },
    { name:'Mar del Plata', url:'https://drive.google.com/thumbnail?id=10sHvR-SShb3lgvR7Bdn6cUt_xWdEijPz&sz=w400', zone:'argentina-centro', nota:'El abrazo cálido del Atlántico.' },
    { name:'Sierras de Córdoba', url:'https://drive.google.com/thumbnail?id=1kR5_cjsNN0pQC-J3BrhBKIBI-Bq9s8bU&sz=w400', zone:'argentina-centro', nota:'Verde que serpentea al horizonte.' },
    { name:'Bodega Mendoza', url:'https://drive.google.com/thumbnail?id=1WvP8y01OhQ_mpCxaIzwUuXyNE4GT7Kun&sz=w400', zone:'argentina-centro', nota:'El arte de convertir sol en vino.' },
    { name:'Cerro de la Gloria', url:'https://drive.google.com/thumbnail?id=1HC3JynlYZZ1SuR-51nO7jJhCisDxx97x&sz=w400', zone:'argentina-centro', nota:'Memoria de gloria tallada en bronce.' },
    { name:'Teatro Colón', url:'https://drive.google.com/thumbnail?id=1Rw51ZPGayYMNoGgXVkSkvl9yYkwpVaGe&sz=w400', zone:'argentina-centro', nota:'Donde las voces se vuelven eternas.' },
    { name:'Puente Colgante', url:'https://drive.google.com/thumbnail?id=1IrFr17SSrT_yh4exd19gse-IKkSKM2du&sz=w400', zone:'argentina-centro', nota:'Un suspiro de acero sobre el río.' },
    { name:'Reloj Cucú', url:'https://drive.google.com/thumbnail?id=1NA9uzV_uaF9ri3HbF_ZAVdWnuk_VpXgp&sz=w400', zone:'argentina-centro', nota:'El tiempo sonriendo en las sierras.' },
    { name:'Bosques de Palermo', url:'https://drive.google.com/thumbnail?id=1uIr44S0CaPur3-w64phRPawwL9leVn0Z&sz=w400', zone:'argentina-centro', nota:'Un suspiro verde en la gran ciudad.' },
    { name:'Catedral de Salta', url:'https://drive.google.com/thumbnail?id=1lkzlryApUwl3UiTqIUJLqNVOCX3h-_BI&sz=w400', zone:'argentina-centro', nota:'Campanas que aún rezan al altiplano.' },
    { name:'Cabildo de Buenos Aires', url:'https://drive.google.com/thumbnail?id=1Hhm3aqA4654w9zRqGGEOkcpNhBNZk6qj&sz=w400', zone:'argentina-centro', nota:'Piedras que vieron nacer una patria.' },
];
var argentinaPatagoniaPhotos = [
    { name:'Glaciar Perito Moreno', url:'https://drive.google.com/thumbnail?id=1CpP4mNkUsguTJc3ogku5O_rFvznW3oOl&sz=w400', zone:'argentina-patagonia', nota:'Río de hielo que aún respira.' },
    { name:'Ushuaia', url:'https://drive.google.com/thumbnail?id=1mhDWXZwJMPdRmuMSMmmFjagu0HrYrheu&sz=w400', zone:'argentina-patagonia', nota:'Donde el mundo decide acabar.' },
    { name:'Cerro Chaltén', url:'https://drive.google.com/thumbnail?id=1qfmMulhoOaDGYTBDAyX7tc9NOLgiactp&sz=w400', zone:'argentina-patagonia', nota:'Montaña que invita a volar.' },
    { name:'Bariloche', url:'https://drive.google.com/thumbnail?id=1Tny2syXcCZbm-GzlTT10I6MsQ_QjA6uW&sz=w400', zone:'argentina-patagonia', nota:'Un cuadro de lagos y montañas.' },
    { name:'Cueva de las Manos', url:'https://drive.google.com/thumbnail?id=1thIyH39oAdz1xMuMVaGz_kzLgbN8T4fQ&sz=w400', zone:'argentina-patagonia', nota:'Manos que saludan desde 9.000 años.' },
    { name:'Puerto Madryn', url:'https://drive.google.com/thumbnail?id=1DJ4I59mDo4ezdBpmtwtihRao9aB62_cy&sz=w400', zone:'argentina-patagonia', nota:'Ballenas que danzan en la costa.' },
    { name:'Tren Fin del Mundo', url:'https://drive.google.com/thumbnail?id=13fSVdYz8QQCMlpfuL0zI6hKBFL_akKPN&sz=w400', zone:'argentina-patagonia', nota:'Rieles que se pierden en el hielo.' },
    { name:'Lago Argentino', url:'https://drive.google.com/thumbnail?id=1vOIHBROl5MttXEkydQjd-zPTAVavugpO&sz=w400', zone:'argentina-patagonia', nota:'Un espejo de plata infinita.' },
    { name:'Bosque Petrificado', url:'https://drive.google.com/thumbnail?id=1KvTg6KlQu_yasKc93hVY5vc0jQt-r-DC&sz=w400', zone:'argentina-patagonia', nota:'Árboles de piedra, siglos de silencio.' },
    { name:'El Calafate', url:'https://drive.google.com/thumbnail?id=1qMcxmtSV4WUmtBtg7m9u8CpsuOg1a9DQ&sz=w400', zone:'argentina-patagonia', nota:'Portal de entrada al hielo eterno.' },
    { name:'Cerro Tronador', url:'https://drive.google.com/thumbnail?id=1R2sw4o75kemK39snxurKc-AtX_8VA7r-&sz=w400', zone:'argentina-patagonia', nota:'Donde la montaña ruge como trueno.' },
    { name:'Punta Tombo', url:'https://drive.google.com/thumbnail?id=1EVi3-6eyImqmdGu_11bBBEg42XC4Fs61&sz=w400', zone:'argentina-patagonia', nota:'Mil pingüinos desfilando al mar.' },
];
var argentinaLitoralPhotos = [
    { name:'Cataratas del Iguazú', url:'https://drive.google.com/thumbnail?id=1OuzQI_YpKYOVwc9KwRwNmXN6OdCjRtTW&sz=w400', zone:'argentina-litoral', nota:'Rugido de agua que estremece el alma.' },
    { name:'Parque Talampaya', url:'https://drive.google.com/thumbnail?id=1uxxaHlPhEaU4bAl4uVUL9rmHlm79ZMmh&sz=w400', zone:'argentina-litoral', nota:'Cañones rojos de otro planeta.' },
    { name:'Ruinas de San Ignacio', url:'https://drive.google.com/thumbnail?id=1jRCowaPfltVWht7n-v_6PdEhua3YpFXt&sz=w400', zone:'argentina-litoral', nota:'Piedras rojas que aún predican.' },
    { name:'Puerto Iguazú', url:'https://drive.google.com/thumbnail?id=1Frz-zvaqu72Jzw3s6Y687JtVCrVclEz2&sz=w400', zone:'argentina-litoral', nota:'Donde tres fronteras se abrazan.' },
    { name:'Costanera de Rosario', url:'https://drive.google.com/thumbnail?id=1OeE1B0kFzgggFyWevpQyIF_IdHGV_dSV&sz=w400', zone:'argentina-litoral', nota:'El río murmura al atardecer.' },
    { name:'Parque El Palmar', url:'https://drive.google.com/thumbnail?id=1s_E0F1wrwNBEHaIcjt7L0dO1P6tcXraM&sz=w400', zone:'argentina-litoral', nota:'Palmeras que saludan al viento.' },
    { name:'Termas de Colón', url:'https://drive.google.com/thumbnail?id=1WWCbcu93lI3lUlXRJQdsoWIEL9oUP74i&sz=w400', zone:'argentina-litoral', nota:'Aguas que abrazan el cansancio.' },
    { name:'Esteros del Iberá', url:'https://drive.google.com/thumbnail?id=1yLmtbooXH-0mtJdC4lHPsd90bqrj3d10&sz=w400', zone:'argentina-litoral', nota:'Un edén esmeralda de agua y vida.' },
    { name:'Basílica de Luján', url:'https://drive.google.com/thumbnail?id=11jON7WP6SKzhhwrBT5kyc_B36EA1oSXA&sz=w400', zone:'argentina-litoral', nota:'Fé que construyó catedrales.' },
    { name:'Monumento a la Bandera', url:'https://drive.google.com/thumbnail?id=1e8iXmJwVlPv-PogjsexcSjODR5wnZKq5&sz=w400', zone:'argentina-litoral', nota:'La patria flameando en piedra.' },
    { name:'Puente Rosario-Victoria', url:'https://drive.google.com/thumbnail?id=1HDySZD2cL6j_zUKtAwrDZ3Ooy_FivXiv&sz=w400', zone:'argentina-litoral', nota:'Un hilo de acero sobre el río.' },
    { name:'Mina Wanda', url:'https://drive.google.com/thumbnail?id=1ZZNrOEqdcVIT_sbdr57FkeeEnOZJcls6&sz=w400', zone:'argentina-litoral', nota:'Tesoros de cristal bajo la tierra.' },
];
var mexicoNortePhotos = [
    { name:'Cañón del Cobre', url:'https://drive.google.com/thumbnail?id=11iYN2ZNRxF6jSGqL2kq5euBNLniu_Qqw&sz=w400', zone:'mexico-norte', nota:'Abismos que retumban en silencio.' },
    { name:'Dunas de Samalayuca', url:'https://drive.google.com/thumbnail?id=1dAzA4IjDqVzn4X5VdGXgmfywYmHS5ntk&sz=w400', zone:'mexico-norte', nota:'Un desierto de oro móvil.' },
    { name:'Cascada Basaseachi', url:'https://drive.google.com/thumbnail?id=1EgLFXZgc_J8vbapy49cnMxEzhxyph3lF&sz=w400', zone:'mexico-norte', nota:'Agua que salta al vacío libre.' },
    { name:'Sierra del Carmen', url:'https://drive.google.com/thumbnail?id=1z0lvQo__xxUZIiUDJVTOV7Pqoto3EFJd&sz=w400', zone:'mexico-norte', nota:'Montañas que custodian el norte.' },
    { name:'Cumbres de Monterrey', url:'https://drive.google.com/thumbnail?id=17v9d89qxcwarJt1KnjlSN4MQ-Oa3xbx-&sz=w400', zone:'mexico-norte', nota:'Picos que rasguñan las nubes.' },
    { name:'Grutas de García', url:'https://drive.google.com/thumbnail?id=1GNOu7WhWT21V2Nmbb5NGODSdVQ3OBah9&sz=w400', zone:'mexico-norte', nota:'Catedrales secretas bajo la montaña.' },
    { name:'Valle Fantasmas', url:'https://drive.google.com/thumbnail?id=1IIPmf-hcvKGmKeB8Uq6p6n38DSR5EI_Z&sz=w400', zone:'mexico-norte', nota:'Piedras que parecen tener alma.' },
    { name:'Zona del Silencio', url:'https://drive.google.com/thumbnail?id=1CNLEvaIPuMohelHfZPR2bZ0JaJuxvv6Z&sz=w400', zone:'mexico-norte', nota:'Donde las agujas se vuelven locas.' },
    { name:'Puente Baluarte', url:'https://drive.google.com/thumbnail?id=17743PcwVJF8hXz-Kjqcwx1DWDR-C0PnA&sz=w400', zone:'mexico-norte', nota:'Acero desafiando barrancas.' },
    { name:'Isla Tiburón', url:'https://drive.google.com/thumbnail?id=16YR-PBB-Mlovp-T6UCpsGrUM3aeHOSRw&sz=w400', zone:'mexico-norte', nota:'Tierra sagrada del desierto y mar.' },
    { name:'Desierto de Altar', url:'https://drive.google.com/thumbnail?id=1aNchwj76SLEtXEteKqItWqtLFI70pTLX&sz=w400', zone:'mexico-norte', nota:'Arena que cambia de forma cada día.' },
    { name:'Creel', url:'https://drive.google.com/thumbnail?id=1hfZpv99DoeOXjtvyOVrfs6BZrZMQcVoL&sz=w400', zone:'mexico-norte', nota:'Un pueblo mecido por los pinos.' },
];
var mexicoCentroPhotos = [
    { name:'Zócalo CDMX', url:'https://drive.google.com/thumbnail?id=1C8XZ_N5u8Ajtpl6i9kQ0zr3zycifaGN7&sz=w400', zone:'mexico-centro', nota:'El corazón latiendo de México.' },
    { name:'Bellas Artes', url:'https://drive.google.com/thumbnail?id=1WI5QZB_qHtzD_RX5NgHZza4VWfJWqrH0&sz=w400', zone:'mexico-centro', nota:'Donde el arte canta mármol.' },
    { name:'Xochimilco', url:'https://drive.google.com/thumbnail?id=1VsZs5alPe9h7xHeYfiHGbsx6Mr54KVBT&sz=w400', zone:'mexico-centro', nota:'Canales que aun respiran historia.' },
    { name:'Basílica de Guadalupe', url:'https://drive.google.com/thumbnail?id=1mPie5m_w8rcyqeiHN393qhC2vHQhHP8C&sz=w400', zone:'mexico-centro', nota:'Fe que mueve millones de almas.' },
    { name:'Teotihuacán', url:'https://drive.google.com/thumbnail?id=1CmNy4rANRzEuN78LUeyjmdGvjlgZZJBL&sz=w400', zone:'mexico-centro', nota:'Donde los hombres se vuelven dioses.' },
    { name:'Taxco', url:'https://drive.google.com/thumbnail?id=1iuaj-mliBGXKYYaIc94_juUUVZDEK8WV&sz=w400', zone:'mexico-centro', nota:'Plata que brota de las montañas.' },
    { name:'Peña de Bernal', url:'https://drive.google.com/thumbnail?id=1MtL8HccDRt1QCiKYEGYjvbqMWefvs0zh&sz=w400', zone:'mexico-centro', nota:'Un monolito que desafía al tiempo.' },
    { name:'Acueducto Querétaro', url:'https://drive.google.com/thumbnail?id=16IWM61-1g8dMHUjFFOmBSa59lfkNuudj&sz=w400', zone:'mexico-centro', nota:'Arcos que aún entregan agua al cielo.' },
    { name:'San Miguel Allende', url:'https://drive.google.com/thumbnail?id=1XkCmuyL-CgxRgYYHNH8ALpZ-VsFSbmHz&sz=w400', zone:'mexico-centro', nota:'Un cuadro colonial que cobra vida.' },
    { name:'Guanajuato', url:'https://drive.google.com/thumbnail?id=18p224Z-ZRoPbY0AneK0O1f2NA_o_OlMz&sz=w400', zone:'mexico-centro', nota:'Calles subterráneas de colores.' },
    { name:'Catedral de Morelia', url:'https://drive.google.com/thumbnail?id=1E-oVFOgOPzYp4srd4KCqF5P85-7MHggl&sz=w400', zone:'mexico-centro', nota:'Campanas rosadas al atardecer.' },
    { name:'Mariposa Monarca', url:'https://drive.google.com/thumbnail?id=1sjwUvycZ2IFG63tvdAWp6T6R7F-Um4so&sz=w400', zone:'mexico-centro', nota:'Un ejército naranja en el viento.' },
];
var mexicoSurPhotos = [
    { name:'Monte Albán', url:'https://drive.google.com/thumbnail?id=1gOcZbjPfsR83y7-IIHoAhApP3fyKXEId&sz=w400', zone:'mexico-sur', nota:'Una ciudad milenaria sobre el cerro.' },
    { name:'Hierve el Agua', url:'https://drive.google.com/thumbnail?id=1F510KIRkDEBXmtbQxLyPBfPDwv4eOx1j&sz=w400', zone:'mexico-sur', nota:'Cascadas petrificadas de piedra líquida.' },
    { name:'Árbol del Tule', url:'https://drive.google.com/thumbnail?id=15F0AOK2MRDfCtT2kNZiz-2A9Zt5FWMZG&sz=w400', zone:'mexico-sur', nota:'El abuelo verde de mil años.' },
    { name:'Cañón del Sumidero', url:'https://drive.google.com/thumbnail?id=1AY-dZyVuAfJUCr5a6XIo6xeSSygLifDF&sz=w400', zone:'mexico-sur', nota:'Paredes que abrazan al río.' },
    { name:'San Cristóbal', url:'https://drive.google.com/thumbnail?id=1RTAxi1MUG3Gfn99H-NWZ9u8q9jAw2CHv&sz=w400', zone:'mexico-sur', nota:'Niebla y mística en las montañas.' },
    { name:'Palenque', url:'https://drive.google.com/thumbnail?id=1xv1tCq-CLvPzLmGivPoDgxB6ZaoE6zam&sz=w400', zone:'mexico-sur', nota:'Pirámides susurrando a la selva.' },
    { name:'Cascadas Agua Azul', url:'https://drive.google.com/thumbnail?id=1xdFIvo_2J5oQYP30r7S5i5s6dc_43naK&sz=w400', zone:'mexico-sur', nota:'Turquesa líquida saltando entre rocas.' },
    { name:'Lagunas Montebello', url:'https://drive.google.com/thumbnail?id=1u3eIcjz79xdFoSumym1kwpa4D-vsKB7Y&sz=w400', zone:'mexico-sur', nota:'Un rosario de lagos de ensueño.' },
    { name:'Popocatépetl', url:'https://drive.google.com/thumbnail?id=1M5JkHP-flrWAqAaNKFz12y_6Rr1-DJNF&sz=w400', zone:'mexico-sur', nota:'El volcán que aún fuma promesas.' },
    { name:'Catedral de Puebla', url:'https://drive.google.com/thumbnail?id=1DaNTAgluNsp4XpKmombeG0nJIInIU9W3&sz=w400', zone:'mexico-sur', nota:'Ángeles de piedra en cada cornisa.' },
    { name:'Tepoztlán', url:'https://drive.google.com/thumbnail?id=1261PjaEpx1x1hWlXKxmNXeI18ai8zwlt&sz=w400', zone:'mexico-sur', nota:'Energía que brota de las rocas.' },
    { name:'Grutas Cacahuamilpa', url:'https://drive.google.com/thumbnail?id=1MkwNsgI2pi1AGB1KfWFgQkvzdV45XLVj&sz=w400', zone:'mexico-sur', nota:'Un cosmos subterráneo de estalactitas.' },
];
  var mexicoCaribePhotos = [
    { name:'Chichén Itzá', url:'https://drive.google.com/thumbnail?id=1jA5Sxah7QbB0rxzar-lGbSvXWhA-reqb&sz=w400', zone:'mexico-caribe', nota:'La serpiente desciende cada equinoccio.' },
    { name:'Tulum', url:'https://drive.google.com/thumbnail?id=12shfaStYT9_agFpZS-ewzD8Jj-tpJaVW&sz=w400', zone:'mexico-caribe', nota:'Ruinas que vigilan el Caribe.' },
    { name:'Cenote Ik Kil', url:'https://drive.google.com/thumbnail?id=1L8SBXEY0KStrUCmZAx32S4yOk7AfqtBg&sz=w400', zone:'mexico-caribe', nota:'Un pozo sagrado al corazón de la tierra.' },
    { name:'Playa del Carmen', url:'https://drive.google.com/thumbnail?id=1w3OcH6iTq2_oSjTPMPuTqErGFrvVlTQO&sz=w400', zone:'mexico-caribe', nota:'Arena blanca, mar turquesa, alma en paz.' },
    { name:'Isla Mujeres', url:'https://drive.google.com/thumbnail?id=1A-vnc1A5smvuergSKDB2xnLEz-H9NK_V&sz=w400', zone:'mexico-caribe', nota:'Un paraíso donde el tiempo se detiene.' },
    { name:'Cozumel', url:'https://drive.google.com/thumbnail?id=1Dr9EF-zq2fxSe3HEqzRj-xgh3NARdzIq&sz=w400', zone:'mexico-caribe', nota:'Arrecifes de coral, ciudades de peces.' },
    { name:'Bacalar', url:'https://drive.google.com/thumbnail?id=1pKRnbbYunsPVwW9jJVE9VErvWu-Z4zkl&sz=w400', zone:'mexico-caribe', nota:'La laguna de los siete azules.' },
    { name:'Uxmal', url:'https://drive.google.com/thumbnail?id=1hAtR0zNioqtQEQgJiGHkmF94lUW3DGBE&sz=w400', zone:'mexico-caribe', nota:'El dominio del dios de la lluvia.' },
    { name:'Mérida', url:'https://drive.google.com/thumbnail?id=1IKaYbeoQRpv73Xrl0cHcGCKPKfNP7X51&sz=w400', zone:'mexico-caribe', nota:'La ciudad blanca de las amaneceres.' },
    { name:'Calakmul', url:'https://drive.google.com/thumbnail?id=1CH7B4Xp--LywDUVrne6hmmg0gIIE1Rr1&sz=w400', zone:'mexico-caribe', nota:'Pirámides perdidas en la selva.' },
    { name:'Campeche', url:'https://drive.google.com/thumbnail?id=1vjpTTM_OuwSmHm95edrkDxaOUAICt0PR&sz=w400', zone:'mexico-caribe', nota:'Murallas que aún defienden el pasado.' },
    { name:'Cenote Dos Ojos', url:'https://drive.google.com/thumbnail?id=1FEnFLMCVGyTjnr07me3aFYNlbsKtfLA5&sz=w400', zone:'mexico-caribe', nota:'Dos ojos de agua mirando al cenote.' },
];
var villarricaPhotos = [
    { name:'Villarrica 1', url:'https://drive.google.com/thumbnail?id=1DtfuiaOzwwNuonJ__siHtNp5bkQrcdvy&sz=w400', nota:'El lago bebe el atardecer cada tarde.' },
    { name:'Villarrica 2', url:'https://drive.google.com/thumbnail?id=13pgYQFfItKdMXM4I6Z2hTykbhyEqzHSb&sz=w400', nota:'El coloso vigila desde la altura.' },
    { name:'Villarrica 3', url:'https://drive.google.com/thumbnail?id=1U7D4Or9FnEf4OwUpVVzl08Rp9o9JDrjs&sz=w400', nota:'Navegando frente al gigante dormido.' },
    { name:'Villarrica 4', url:'https://drive.google.com/thumbnail?id=15IgWa1AsKjwk7tTRGEO2ro8DTlJbcj--&sz=w400', nota:'Bosques que respiran verde eterno.' },
    { name:'Villarrica 5', url:'https://drive.google.com/thumbnail?id=1qysQ8h-YHQyh5Mg4opZzsTAmnDQIMG-t&sz=w400', nota:'El volcán ruge desde sus profundidades.' },
    { name:'Villarrica 6', url:'https://drive.google.com/thumbnail?id=1LO2MAuNFcdTjhjDPxS5Ousw3HBnVkh-g&sz=w400', nota:'Aguas calientes abrazando el frío.' },
    { name:'Villarrica 7', url:'https://drive.google.com/thumbnail?id=183L3Zri6qcm6leHek4j-LulR3hUVomfK&sz=w400', nota:'El amanecer besa al lago dormido.' },
    { name:'Villarrica 8', url:'https://drive.google.com/thumbnail?id=1P7m6YU1U2hIQ6KT7jxfs9Smq7bKhnmmO&sz=w400', nota:'El volcán viste estrellas de noche.' },
    { name:'Villarrica 9', url:'https://drive.google.com/thumbnail?id=1Z2-Sxmlpm9hihM-ZNmKUarB2nHyX_Ly9&sz=w400', nota:'Paisajes que roban el corazón.' },
];
var valparaisoPhotos = [
    { name:'Valpo 1', url:'https://drive.google.com/thumbnail?id=1WM5sd8aZyPDfeoyczNgYRKIRH2GToOJC&sz=w400', nota:'Un puerto que aún cuenta historias.' },
    { name:'Valpo 2', url:'https://drive.google.com/thumbnail?id=1ZiwDZKB6TyV6vJvqMYeqGCdd5HSNL6nx&sz=w400', nota:'Cerros pintados con alegría.' },
    { name:'Valpo 3', url:'https://drive.google.com/thumbnail?id=1eh776MPiWs6ry44Hd5BFxuZN4cqurNkF&sz=w400', nota:'Cada calle es un museo abierto.' },
    { name:'Valpo 4', url:'https://drive.google.com/thumbnail?id=1EWM0KGofQJJ3VX6-iTMnT5K6RGMJwmzq&sz=w400', nota:'Murales que gritan versos al mar.' },
    { name:'Valpo 5', url:'https://drive.google.com/thumbnail?id=1XzDDJ2_a7nHV_owPvLzVxBPax0Bd1OZj&sz=w400', nota:'Ascensores que suben al pasado.' },
    { name:'Valpo 6', url:'https://drive.google.com/thumbnail?id=1Id4QQXiPgqSz0gbKoCTDdTzDP-KPC6Fo&sz=w400', nota:'Casas que se abrazan en la ladera.' },
    { name:'Valpo 7', url:'https://drive.google.com/thumbnail?id=1Hn9Y4bxYWUqVifIbREzfnsrV40SOKJ9R&sz=w400', nota:'El puerto donde nació el canto.' },
    { name:'Valpo 8', url:'https://drive.google.com/thumbnail?id=1_rqH51EFskHxRpzDIV8fXt9rZLuLem4l&sz=w400', nota:'Atardeceres que rompen el cielo.' },
    { name:'Valpo 9', url:'https://drive.google.com/thumbnail?id=1Lq0s16e6S5reutW03wfY2bFaP5ZdLUmB&sz=w400', nota:'La joya del Pacífico Sur.' },
    { name:'Valpo 10', url:'https://drive.google.com/thumbnail?id=1Oj8J0SWtItxwpAEcvaEUo04MlrGUiJcv&sz=w400', nota:'Escaleras que conducen al cielo.' },
];

// [FASE 6] Fichas tradicionales + nuevos simbolos coloridos tipo Candy Crush.
// Cada ficha tiene un "color" CSS para el simbolo.
var traditionalTiles = [
    // Bambus (verde)
    { name:'Bambú 1', symbol:'🎋', color:'#2d8a3e' },{ name:'Bambú 2', symbol:'🎍', color:'#2d8a3e' },
    { name:'Bambú 3', symbol:'🌿', color:'#4ade80' },{ name:'Bambú 4', symbol:'☘️', color:'#22c55e' },
    { name:'Bambú 5', symbol:'🌱', color:'#16a34a' },{ name:'Bambú 6', symbol:'🌴', color:'#15803d' },
    // Caracteres chinos (rojo y dorado)
    { name:'Fortuna', symbol:'福', color:'#dc2626' },{ name:'Riqueza', symbol:'財', color:'#d4af37' },
    { name:'Vida', symbol:'壽', color:'#dc2626' },{ name:'Amor', symbol:'愛', color:'#e11d48' },
    { name:'Paz', symbol:'和', color:'#0891b2' },{ name:'Felicidad', symbol:'喜', color:'#dc2626' },
    { name:'Dragón', symbol:'龍', color:'#ea580c' },{ name:'Tigre', symbol:'虎', color:'#ca8a04' },
    // Astros (colores brillantes)
    { name:'Sol', symbol:'☀️', color:'#f59e0b' },{ name:'Luna', symbol:'🌙', color:'#6366f1' },
    { name:'Estrella', symbol:'⭐', color:'#fbbf24' },{ name:'Cometa', symbol:'☄️', color:'#8b5cf6' },
    { name:'Planeta', symbol:'🪐', color:'#06b6d4' },{ name:'Cielo', symbol:'☁️', color:'#0ea5e9' },
    // Vientos (azul oscuro)
    { name:'Viento Este', symbol:'東', color:'#1e40af' },{ name:'Viento Sur', symbol:'南', color:'#1e3a8a' },
    { name:'Viento Oeste', symbol:'西', color:'#3730a3' },{ name:'Viento Norte', symbol:'北', color:'#312e81' },
    // Dragones (rojo, verde, blanco)
    { name:'Dragón Rojo', symbol:'中', color:'#dc2626' },{ name:'Dragón Verde', symbol:'發', color:'#16a34a' },
    { name:'Dragón Blanco', symbol:'白', color:'#6b7280' },
    // Estaciones (colores pastel)
    { name:'Primavera', symbol:'🌸', color:'#ec4899' },{ name:'Verano', symbol:'🌞', color:'#f59e0b' },
    { name:'Otoño', symbol:'🍂', color:'#c2410c' },{ name:'Invierno', symbol:'❄️', color:'#0ea5e9' },
    // Flores (rosa, rojo, blanco)
    { name:'Ciruelo', symbol:'🌺', color:'#dc2626' },{ name:'Orquídea', symbol:'🪷', color:'#ec4899' },
    { name:'Crisantemo', symbol:'🌻', color:'#f59e0b' },{ name:'Loto', symbol:'🌷', color:'#e11d48' },
    { name:'Rosa', symbol:'🌹', color:'#be123c' },{ name:'Girasol', symbol:'🌼', color:'#eab308' },
    // Animales (gatos como Vita Mahjong)
    { name:'Gato Negro', symbol:'🐱', color:'#1f2937' },{ name:'Gato Naranja', symbol:'😺', color:'#ea580c' },
    { name:'Gato Blanco', symbol:'😻', color:'#6b7280' },{ name:'León', symbol:'🦁', color:'#ca8a04' },
    { name:'Tigre', symbol:'🐯', color:'#ea580c' },{ name:'Zorro', symbol:'🦊', color:'#c2410c' },
    { name:'Búho', symbol:'🦉', color:'#7c3aed' },{ name:'Mariposa', symbol:'🦋', color:'#8b5cf6' },
    // Frutas (colores vibrantes)
    { name:'Cereza', symbol:'🍒', color:'#dc2626' },{ name:'Sandía', symbol:'🍉', color:'#16a34a' },
    { name:'Limón', symbol:'🍋', color:'#eab308' },{ name:'Naranja', symbol:'🍊', color:'#f97316' },
    { name:'Manzana', symbol:'🍎', color:'#dc2626' },{ name:'Fresa', symbol:'🍓', color:'#e11d48' },
    // Objetos culturales
    { name:'Tetera', symbol:'🫖', color:'#92400e' },{ name:'Linterna', symbol:'🏮', color:'#dc2626' },
    { name:'Abanico', symbol:'🪭', color:'#ec4899' },{ name:'Yin Yang', symbol:'☯️', color:'#1f2937' },
    { name:'Sello', symbol:'🔰', color:'#dc2626' },{ name:'Corazón', symbol:'💖', color:'#e11d48' },
    // Naturaleza
    { name:'Montaña', symbol:'⛰️', color:'#57534e' },{ name:'Volcán', symbol:'🌋', color:'#dc2626' },
    { name:'Ola', symbol:'🌊', color:'#0284c7' },{ name:'Fuego', symbol:'🔥', color:'#ea580c' },
    { name:'Rayo', symbol:'⚡', color:'#fbbf24' },{ name:'Arcoíris', symbol:'🌈', color:'#8b5cf6' },
    // [FASE 6] Nuevas fichas coloridas
    // Mas animales
    { name:'Panda', symbol:'🐼', color:'#1f2937' },{ name:'Pingüino', symbol:'🐧', color:'#0f172a' },
    { name:'Delfín', symbol:'🐬', color:'#0ea5e9' },{ name:'Tortuga', symbol:'🐢', color:'#15803d' },
    { name:'Conejo', symbol:'🐰', color:'#f9a8d4' },{ name:'Búho Real', symbol:'🦅', color:'#92400e' },
    { name:'Pez', symbol:'🐠', color:'#f97316' },{ name:'Pulpo', symbol:'🐙', color:'#a855f7' },
    { name:'Unicornio', symbol:'🦄', color:'#ec4899' },{ name:'Dragón Mítico', symbol:'🐲', color:'#16a34a' },
    // Mas frutas
    { name:'Uva', symbol:'🍇', color:'#7c3aed' },{ name:'Melón', symbol:'🍈', color:'#84cc16' },
    { name:'Piña', symbol:'🍍', color:'#eab308' },{ name:'Durazno', symbol:'🍑', color:'#fb923c' },
    { name:'Coco', symbol:'🥥', color:'#92400e' },{ name:'Kiwi', symbol:'🥝', color:'#65a30d' },
    // Comida
    { name:'Pastel', symbol:'🍰', color:'#f9a8d4' },{ name:'Helado', symbol:'🍦', color:'#fbbf24' },
    { name:'Galleta', symbol:'🍪', color:'#92400e' },{ name:'Chocolate', symbol:'🍫', color:'#78350f' },
    { name:'Dona', symbol:'🍩', color:'#f472b6' },{ name:'Caramelo', symbol:'🍬', color:'#a855f7' },
    // Transporte
    { name:'Avión', symbol:'✈️', color:'#3b82f6' },{ name:'Barco', symbol:'⛵', color:'#0ea5e9' },
    { name:'Coche', symbol:'🚗', color:'#ef4444' },{ name:'Tren', symbol:'🚂', color:'#dc2626' },
    // Musica
    { name:'Nota', symbol:'🎵', color:'#a855f7' },{ name:'Guitarra', symbol:'🎸', color:'#7c3aed' },
    { name:'Tambor', symbol:'🥁', color:'#92400e' },{ name:'Trompeta', symbol:'🎺', color:'#f59e0b' },
    // Objetos magicos
    { name:'Corona', symbol:'👑', color:'#fbbf24' },{ name:'Gema', symbol:'💎', color:'#06b6d4' },
    { name:'Llave', symbol:'🔑', color:'#fbbf24' },{ name:'Tesoro', symbol:'💰', color:'#eab308' },
    { name:'Bomba', symbol:'💣', color:'#1f2937' },{ name:'Regalo', symbol:'🎁', color:'#dc2626' },
    { name:'Burbuja', symbol:'🫧', color:'#67e8f9' },{ name:' Globo', symbol:'🎈', color:'#ef4444' },
];

var ZONES = [
    { id:'norte', name:'NORTE', icon:'🏜️', country:'chile', photos:nortePhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'centro', name:'CENTRO', icon:'🏛️', country:'chile', photos:centroPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'sur', name:'SUR', icon:'🌋', country:'chile', photos:surPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'austral', name:'AUSTRAL', icon:'🗻', country:'chile', photos:patagoniaPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'argentina-norte', name:'ARG NORTE', icon:'🏜️', country:'argentina', photos:argentinaNortePhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'argentina-centro', name:'ARG CENTRO', icon:'🏛️', country:'argentina', photos:argentinaCentroPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'argentina-patagonia', name:'ARG PATAGONIA', icon:'🗻', country:'argentina', photos:argentinaPatagoniaPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'argentina-litoral', name:'ARG LITORAL', icon:'🌴', country:'argentina', photos:argentinaLitoralPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'mexico-norte', name:'MX NORTE', icon:'🏜️', country:'mexico', photos:mexicoNortePhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'mexico-centro', name:'MX CENTRO', icon:'🏛️', country:'mexico', photos:mexicoCentroPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'mexico-sur', name:'MX SUR', icon:'🌋', country:'mexico', photos:mexicoSurPhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
    { id:'mexico-caribe', name:'MX CARIBE', icon:'🌴', country:'mexico', photos:mexicoCaribePhotos, levels:[ {num:1,pairs:10},{num:2,pairs:14},{num:3,pairs:18},{num:4,pairs:22},{num:5,pairs:28},{num:6,pairs:32},{num:7,pairs:38},{num:8,pairs:42},{num:9,pairs:46},{num:10,pairs:50} ] },
];

// ========== TRIVIA CULTURAL (FASE 3) ==========
// 5 preguntas por zona, basadas en los lugares de las fotos.
var TRIVIA = {
    'norte': [
        { q: '¿Cuál es el desierto más seco del mundo?', opts: ['Sahara', 'Atacama', 'Gobi', 'Kalahari'], correct: 1, exp: 'El Desierto de Atacama no registra lluvias en algunos puntos por décadas.' },
        { q: '¿En qué cordillera están los géiseres del Tatio?', opts: ['Los Andes', 'La Costa', 'Alpes', 'Himalaya'], correct: 0, exp: 'A 4.300m en los Andes, el Tatio es uno de los campos geotérmicos más altos del mundo.' },
        { q: '¿Qué animales rosados habitan el Salar de Atacama?', opts: ['Pelícanos', 'Gaviotas', 'Flamencos', 'Cisnes'], correct: 2, exp: 'Los flamencos andinos se alimentan de microorganismos salinos.' },
        { q: '¿A qué se debe el fenómeno del Desierto Florido?', opts: ['A nieblas', 'A lluvias ocasionales', 'Al viento', 'Al sol'], correct: 1, exp: 'Lluvias inusuales despiertan semillas dormidas por décadas.' },
        { q: '¿Qué color tienen las Piedras Rojas del altiplano?', opts: ['Verde', 'Rojo óxido', 'Azul', 'Blanco'], correct: 1, exp: 'El hierro oxidado tiñe las formaciones a 4.000m de altura.' }
    ],
    'centro': [
        { q: '¿Cuál es el edificio más alto de Sudamérica?', opts: ['Costanera Center', 'Torre Titanium', 'Bicentenario', 'Edificio CTC'], correct: 0, exp: 'Con 300m, el Costanera Center domina el skyline de Santiago.' },
        { q: '¿En qué ciudad está el Castillo Wulff?', opts: ['Santiago', 'Viña del Mar', 'Valparaíso', 'Concón'], correct: 1, exp: 'Castillo Wulff es un ícono costero de Viña del Mar.' },
        { q: '¿Qué cordillera separa Chile de Argentina?', opts: ['Costa', 'Los Andes', 'Alpes', 'Pirineos'], correct: 1, exp: 'Los Andes son la cordillera más larga del mundo fuera de Asia.' },
        { q: '¿Qué parque santiaguino tiene una Virgen en su cima?', opts: ['Santa Lucía', 'San Cristóbal', 'Manquehue', 'Cantillana'], correct: 1, exp: 'El Cerro San Cristóbal corona con la Virgen de la Inmaculada Concepción.' },
        { q: '¿En qué región está el Embalse El Yeso?', opts: ['Valparaíso', 'Metropolitana', "O'Higgins", 'Maule'], correct: 1, exp: 'En el Cajón del Maipo, provee agua potable a Santiago.' }
    ],
    'sur': [
        { q: '¿En qué isla están los famosos palafitos?', opts: ['Pascua', 'Chiloé', 'Juan Fernández', 'Tierra del Fuego'], correct: 1, exp: 'Castro, en Chiloé, es famosa por sus casas sobre el agua.' },
        { q: '¿Qué volcán está junto al Lago Llanquihue?', opts: ['Osorno', 'Villarrica', 'Lonquimay', 'Calbuco'], correct: 0, exp: 'El Osorno es uno de los volcanes más fotografiados de Chile.' },
        { q: '¿En qué región está la Selva Valdiviana?', opts: ['Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos'], correct: 2, exp: 'Bosque templado lluvioso, uno de los más biodiversos del planeta.' },
        { q: '¿Cuál es el río que cruza Valdivia?', opts: ['Tolten', 'Calle Calle', 'Bío Bío', 'Maipo'], correct: 1, exp: 'El Calle Calle es uno de los ríos navegables más importantes del sur.' },
        { q: '¿Qué volcán está activo cerca de Pucón?', opts: ['Osorno', 'Lonquimay', 'Villarrica', 'Llaima'], correct: 2, exp: 'El Villarrica es uno de los volcanes más activos de Chile.' }
    ],
    'austral': [
        { q: '¿Cuál es el parque nacional más famoso de Chile?', opts: ['Torres del Paine', 'Vicente Pérez Rosales', 'Conguillío', 'Lauca'], correct: 0, exp: 'Torres del Paine es Patrimonio de la Biosfera desde 1978.' },
        { q: '¿Qué animal forma colonias en Isla Magdalena?', opts: ['Lobos marinos', 'Pingüinos', 'Cormoranes', 'Gaviotas'], correct: 1, exp: 'Más de 120.000 pingüinos de Magallanes anidan allí.' },
        { q: '¿Cómo se llama el glaciar famoso del Paine?', opts: ['Perito Moreno', 'Grey', 'Pío XI', 'San Rafael'], correct: 1, exp: 'El Glaciar Grey alimenta el lago del mismo nombre con témpanos azules.' },
        { q: '¿Cuál es el cabo más austral de Chile?', opts: ['Hornos', 'Froward', 'Pilares', 'Forward'], correct: 0, exp: 'Cabo de Hornos marca la confluencia de los océanos Pacífico y Atlántico.' },
        { q: '¿En qué ciudad termina el Canal Beagle?', opts: ['Punta Arenas', 'Puerto Williams', 'Ushuaia', 'Río Grande'], correct: 1, exp: 'Puerto Williams es la población más austral del mundo.' }
    ],
    'argentina-norte': [
        { q: '¿En qué provincia está la Quebrada de Humahuaca?', opts: ['Salta', 'Jujuy', 'Catamarca', 'Tucumán'], correct: 1, exp: 'La Quebrada es Patrimonio de la Humanidad por la UNESCO.' },
        { q: '¿En qué pueblo está el Cerro de los Siete Colores?', opts: ['Tilcara', 'Purmamarca', 'Humahuaca', 'Iruya'], correct: 1, exp: 'Purmamarca es famosa por sus cerros sedimentarios multicolores.' },
        { q: '¿En qué provincia está Cafayate, famosa por sus vinos?', opts: ['Salta', 'Jujuy', 'Catamarca', 'La Rioja'], correct: 0, exp: 'Cafayate es reconocida por el vino Torrontés.' },
        { q: '¿Cuál es el salar más grande de Argentina?', opts: ['Arizaro', 'Salinas Grandes', 'Hombre Muerto', 'Olaroz'], correct: 1, exp: 'Salinas Grandes se extiende entre Jujuy y Salta a 3.450m.' },
        { q: '¿Qué civilización construyó el Pucará de Tilcara?', opts: ['Incas', 'Omaguacas', 'Diaguitas', 'Mapuches'], correct: 1, exp: 'Los omaguacas fortificaron Tilcara hace más de 900 años.' }
    ],
    'argentina-centro': [
        { q: '¿En qué año se inauguró el Obelisco de Buenos Aires?', opts: ['1912', '1936', '1950', '1978'], correct: 1, exp: 'Se construyó en 31 días para conmemorar el 4º centenario de la ciudad.' },
        { q: '¿En qué barrio porteño nació el tango?', opts: ['Recoleta', 'La Boca', 'Palermo', 'San Telmo'], correct: 1, exp: 'La Boca es cuna del tango y del legendario Caminito.' },
        { q: '¿Cuál es el teatro de ópera más famoso de Argentina?', opts: ['Colón', 'Argentino', 'San Martín', 'Cervantes'], correct: 0, exp: 'El Teatro Colón es uno de los tres mejores del mundo en acústica.' },
        { q: '¿En qué provincia está el Cerro de la Gloria?', opts: ['Mendoza', 'San Juan', 'Neuquén', 'Río Negro'], correct: 0, exp: 'En Mendoza, conmemora al Ejército de los Andes de San Martín.' },
        { q: '¿Qué variedad de vino es emblemática de Mendoza?', opts: ['Cabernet', 'Malbec', 'Merlot', 'Syrah'], correct: 1, exp: 'Mendoza produce el 70% del vino argentino, mayormente Malbec.' }
    ],
    'argentina-patagonia': [
        { q: '¿Cuál es la ciudad más austral del mundo?', opts: ['Punta Arenas', 'Ushuaia', 'Puerto Williams', 'Río Grande'], correct: 1, exp: 'Ushuaia se autodenomina "Fin del Mundo".' },
        { q: '¿En qué provincia está el glaciar Perito Moreno?', opts: ['Chubut', 'Río Negro', 'Santa Cruz', 'Tierra del Fuego'], correct: 2, exp: 'En el Parque Nacional Los Glaciares, Santa Cruz.' },
        { q: '¿Qué animales se avistan en Puerto Madryn?', opts: ['Pingüinos', 'Ballenas', 'Lobos marinos', 'Elefantes marinos'], correct: 1, exp: 'La ballena franca austral llega a Península Valdés cada invierno.' },
        { q: '¿Dónde están las pinturas rupestres de más de 9.000 años?', opts: ['Cueva de las Manos', 'Cueva Pintada', 'Cueva del Milodón', 'Los Toldos'], correct: 0, exp: 'Cueva de las Manos es Patrimonio de la Humanidad.' },
        { q: '¿Cuál es el lago más grande de Argentina?', opts: ['Lago Puelo', 'Lago Argentino', 'Nahuel Huapi', 'Viedma'], correct: 1, exp: 'El Lago Argentino tiene 1.415 km², en Santa Cruz.' }
    ],
    'argentina-litoral': [
        { q: '¿En qué provincia están las Cataratas del Iguazú?', opts: ['Corrientes', 'Misiones', 'Entre Ríos', 'Formosa'], correct: 1, exp: 'Misiones alberga una de las Nueve Maravillas Naturales del Mundo.' },
        { q: '¿Cuántas cataratas conforman el conjunto del Iguazú?', opts: ['100', '180', '275', '400'], correct: 2, exp: 'Aproximadamente 275 saltos se reparten en 2.7 km.' },
        { q: '¿En qué provincia está el Parque El Palmar?', opts: ['Entre Ríos', 'Corrientes', 'Santa Fe', 'Misiones'], correct: 0, exp: 'Protege la mayor extensión de palmeras yatay del país.' },
        { q: '¿Cómo se llaman los humedales famosos de Corrientes?', opts: ['Pantanos', 'Esteros del Iberá', 'Llanos', 'Marismas'], correct: 1, exp: 'Iberá es el segundo humedal más grande de Sudamérica.' },
        { q: '¿Qué ciudad tiene el Monumento a la Bandera?', opts: ['Buenos Aires', 'Rosario', 'Córdoba', 'Santa Fe'], correct: 1, exp: 'En Rosario, donde Manuel Belgrano izó por primera vez la bandera.' }
    ],
    'mexico-norte': [
        { q: '¿En qué estado está el Cañón del Cobre?', opts: ['Sonora', 'Chihuahua', 'Coahuila', 'Durango'], correct: 1, exp: 'En la Sierra Tarahumara, es más grande y profundo que el Gran Cañón.' },
        { q: '¿Cuál es la cascada más alta de México?', opts: ['Agua Azul', 'Basaseachi', 'Piedra Volada', 'Tamul'], correct: 1, exp: 'Basaseachi cae 246m en la Sierra Madre Occidental.' },
        { q: '¿Qué pueblo mágico está en la Sierra Tarahumara?', opts: ['Creel', 'Real de Catorce', 'Batopilas', 'Casas Grandes'], correct: 0, exp: 'Creel es la puerta de entrada a la cultura rarámuri.' },
        { q: '¿Cuál es la isla más grande de México?', opts: ['Cozumel', 'Isla Mujeres', 'Isla Tiburón', 'Isla Ángel de la Guarda'], correct: 2, exp: 'Isla Tiburón, en Sonora, tiene 1.208 km².' },
        { q: '¿En qué estado está la Zona del Silencio?', opts: ['Chihuahua', 'Coahuila', 'Durango', 'Sonora'], correct: 2, exp: 'En el Bolsón de Mapimí, Durango, famosa por anécdotas paranormales.' }
    ],
    'mexico-centro': [
        { q: '¿Cómo se llama la plaza principal de la CDMX?', opts: ['Plaza Mayor', 'Zócalo', 'Plaza de Armas', 'Plaza de la Constitución'], correct: 3, exp: 'Oficialmente Plaza de la Constitución, popularmente "el Zócalo".' },
        { q: '¿Qué civilización construyó Teotihuacán?', opts: ['Mayas', 'Aztecas', 'Teotihuacanos', 'Toltecas'], correct: 2, exp: 'Teotihuacán floreció antes que los aztecas, quienes la encontraron abandonada.' },
        { q: '¿Cuál es el santuario católico más visitado de México?', opts: ['Socorro', 'Basílica de Guadalupe', 'San Juan de los Lagos', 'Los Remedios'], correct: 1, exp: 'La Basílica de Guadalupe recibe 20 millones de peregrinos al año.' },
        { q: '¿Qué pueblo mágico es famoso por su plata?', opts: ['Taxco', 'San Miguel', 'Bernal', 'Tepoztlán'], correct: 0, exp: 'Taxco, en Guerrero, es la capital mundial de la platería.' },
        { q: '¿En qué estado está la Peña de Bernal?', opts: ['Guanajuato', 'Hidalgo', 'Querétaro', 'San Luis Potosí'], correct: 2, exp: 'En Querétaro, es el tercer monolito más grande del mundo.' }
    ],
    'mexico-sur': [
        { q: '¿Qué civilización construyó Monte Albán?', opts: ['Mayas', 'Aztecas', 'Zapotecas', 'Mixtecas'], correct: 2, exp: 'Monte Albán fue la capital zapoteca durante 1.300 años.' },
        { q: '¿En qué estado está el Cañón del Sumidero?', opts: ['Oaxaca', 'Chiapas', 'Veracruz', 'Guerrero'], correct: 1, exp: 'En Chiapas, con paredes de hasta 1.000m de altura.' },
        { q: '¿Cómo se llama la zona arqueológica maya famosa de Chiapas?', opts: ['Palenque', 'Yaxchilán', 'Bonampak', 'Toniná'], correct: 0, exp: 'Palenque destaca por el Templo de las Inscripciones.' },
        { q: '¿Cuál es el árbol más ancho del mundo?', opts: ['Baobab', 'Árbol del Tule', 'Secuoya', 'Cedro'], correct: 1, exp: 'El Árbol del Tule en Oaxaca tiene 14m de diámetro.' },
        { q: '¿Qué volcán activo está cerca de Puebla?', opts: ['Iztaccíhuatl', 'Popocatépetl', 'La Malinche', 'Pico de Orizaba'], correct: 1, exp: 'El "Popo" es uno de los volcanes más activos de México.' }
    ],
    'mexico-caribe': [
        { q: '¿Qué maravilla del mundo moderno está en Yucatán?', opts: ['Tulum', 'Chichén Itzá', 'Uxmal', 'Palenque'], correct: 1, exp: 'Chichén Itzá fue elegida en 2007 como una de las Nueve Maravillas.' },
        { q: '¿Cómo se llaman los pozos sagrados mayas?', opts: ['Aguadas', 'Cenotes', 'Pozos', 'Reservorios'], correct: 1, exp: 'Los cenotes son dolinas cársticas conectadas a ríos subterráneos.' },
        { q: '¿En qué estado están las ruinas de Tulum frente al mar?', opts: ['Yucatán', 'Campeche', 'Quintana Roo', 'Tabasco'], correct: 2, exp: 'Tulum es la única ciudad maya amurallada junto al Caribe.' },
        { q: '¿Cuál es la "laguna de los 7 colores"?', opts: ['Bacalar', 'Nicolás', 'Chichen', 'Kaan'], correct: 0, exp: 'Bacalar, en Quintana Roo, es un paraíso turquesa.' },
        { q: '¿Qué ciudad amurallada está en Campeche?', opts: ['Mérida', 'Campeche', 'Villahermosa', 'Ciudad del Carmen'], correct: 1, exp: 'Campeche fue fortificada contra piratas en el siglo XVII.' }
    ]
};

// ========== MINIJUEGOS (FASE 3): 2 por zona = 24 en total ==========
var MINIGAMES = {
    // Nivel 3: Memorice especial (Valparaiso y Villarrica - originales del juego)
    // Nivel 4: Trivia cultural (1er minijuego, accesible temprano)
    // Nivel 5: Memorice especial (Villarrica - original del juego)
    // Nivel 7: Memorice de la zona (2do minijuego, mid-game)
    'norte-4': { name:'Trivia Norte', type:'trivia', icon:'🧠', zone:'norte' },
    'norte-7': { name:'Memorice Norte', type:'memorice', icon:'🎨', photos: nortePhotos },
    'centro-3': { name:'Memorice de Valparaíso', type:'memorice', icon:'🎨', photos: valparaisoPhotos },
    'centro-4': { name:'Trivia Centro', type:'trivia', icon:'🧠', zone:'centro' },
    'centro-7': { name:'Memorice Centro', type:'memorice', icon:'🎨', photos: centroPhotos },
    'sur-5': { name:'Memorice de Villarrica', type:'memorice', icon:'🌋', photos: villarricaPhotos },
    'sur-4': { name:'Trivia Sur', type:'trivia', icon:'🧠', zone:'sur' },
    'sur-7': { name:'Memorice Sur', type:'memorice', icon:'🎨', photos: surPhotos },
    'austral-4': { name:'Trivia Austral', type:'trivia', icon:'🧠', zone:'austral' },
    'austral-7': { name:'Memorice Austral', type:'memorice', icon:'🎨', photos: patagoniaPhotos },
    'argentina-norte-4': { name:'Trivia Arg Norte', type:'trivia', icon:'🧠', zone:'argentina-norte' },
    'argentina-norte-7': { name:'Memorice Arg Norte', type:'memorice', icon:'🎨', photos: argentinaNortePhotos },
    'argentina-centro-4': { name:'Trivia Arg Centro', type:'trivia', icon:'🧠', zone:'argentina-centro' },
    'argentina-centro-7': { name:'Memorice Arg Centro', type:'memorice', icon:'🎨', photos: argentinaCentroPhotos },
    'argentina-patagonia-4': { name:'Trivia Arg Patagonia', type:'trivia', icon:'🧠', zone:'argentina-patagonia' },
    'argentina-patagonia-7': { name:'Memorice Arg Patagonia', type:'memorice', icon:'🎨', photos: argentinaPatagoniaPhotos },
    'argentina-litoral-4': { name:'Trivia Arg Litoral', type:'trivia', icon:'🧠', zone:'argentina-litoral' },
    'argentina-litoral-7': { name:'Memorice Arg Litoral', type:'memorice', icon:'🎨', photos: argentinaLitoralPhotos },
    'mexico-norte-4': { name:'Trivia MX Norte', type:'trivia', icon:'🧠', zone:'mexico-norte' },
    'mexico-norte-7': { name:'Memorice MX Norte', type:'memorice', icon:'🎨', photos: mexicoNortePhotos },
    'mexico-centro-4': { name:'Trivia MX Centro', type:'trivia', icon:'🧠', zone:'mexico-centro' },
    'mexico-centro-7': { name:'Memorice MX Centro', type:'memorice', icon:'🎨', photos: mexicoCentroPhotos },
    'mexico-sur-4': { name:'Trivia MX Sur', type:'trivia', icon:'🧠', zone:'mexico-sur' },
    'mexico-sur-7': { name:'Memorice MX Sur', type:'memorice', icon:'🎨', photos: mexicoSurPhotos },
    'mexico-caribe-4': { name:'Trivia MX Caribe', type:'trivia', icon:'🧠', zone:'mexico-caribe' },
    'mexico-caribe-7': { name:'Memorice MX Caribe', type:'memorice', icon:'🎨', photos: mexicoCaribePhotos }
};
