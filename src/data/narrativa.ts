// ─── Narrativa centralizada de Observalo ────────────────────────────
// Secuencia: La Red → Distribución → Convicción → Flujos → Acumuladores → Escasez
// Arco: fundamento → observación → patrón → tendencia → contexto → implicación

export const NARRATIVA = {
  // ── Header ──
  tagline: "Un sistema monetario sin secretos. Los datos están aquí.",
  subtitulo:
    "Cada transacción, cada bloque, cada regla de Bitcoin es pública y verificable. Este observatorio traduce esos datos para que cualquiera pueda leerlos.",

  // ── Footer ──
  footerAtribucion:
    "OBSERVALO · Observatorio de Bitcoin · Datos: mempool.space + bitcoin-data.com",
  footerContexto:
    "En 2009, alguien publicó un sistema monetario con reglas que ningún gobierno puede cambiar. Estos datos muestran qué pasó después.",
  footerDisclaimer:
    "Este sitio es informativo. No constituye asesoría financiera, tributaria ni de inversión. Los datos provienen de fuentes públicas y pueden contener estimaciones.",

  // ── Tabs ──
  tabs: {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TAB 1: LA RED (antes Minería)
    // Pregunta: ¿Qué es esto y por qué es seguro?
    // Construye: fundamento — reglas matemáticas, no políticas
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    mineria: {
      concepto: {
        titulo: "¿Qué protege a Bitcoin? Electricidad, matemáticas y cero excepciones.",
        cuerpo:
          "Todo sistema monetario tiene reglas. La diferencia es quién las controla. En el dinero tradicional, un comité decide cuánto se emite, cuándo, y a quién beneficia. En Bitcoin, las reglas están escritas en código abierto: la emisión se reduce a la mitad cada ~4 años (sin votación), la dificultad se ajusta cada 2.016 bloques (sin comité), y cada bloque requiere gastar electricidad real para ser válido (sin atajos). El resultado es la red computacional más grande del planeta — y la más cara de atacar.",
        senal: "Revertir un solo bloque requiere más energía que la producción anual de países enteros.",
      },
      panelEdu: {
        icono: "⛏",
        titulo: "Reglas que se ejecutan, no se negocian",
        color: "#f0b429",
        cuerpo: `**La emisión sigue un calendario público.** 50 → 25 → 12,5 → 6,25 → 3,125 BTC por bloque. En 2028 será 1,5625. Ningún banco central del mundo ha publicado su calendario de emisión para los próximos 100 años. Bitcoin lo hizo en 2009.

**La seguridad no depende de confianza.** Cada segundo, la red procesa cientos de millones de billones de cálculos. La dificultad se ajusta sola para mantener un bloque cada 10 minutos — sin importar cuántos mineros se sumen o se retiren.

**Cuando la recompensa baja, las comisiones compensan.** El incentivo económico se recalibra con cada bloque. Los mineros ineficientes desaparecen, los eficientes sobreviven — selección natural económica.

A lo largo de este observatorio vas a ver qué hace la gente con un sistema que funciona así. La siguiente sección muestra cómo se reparte la propiedad.`,
        cierre:
          "Es el único sistema monetario donde la seguridad no depende de la buena fe de nadie — depende de la física.",
      },
      senales: [
        { etiqueta: "HASHRATE", estado: "Máximo histórico — la red nunca fue más cara de atacar" },
        { etiqueta: "4to HALVING", estado: "3,125 BTC por bloque desde abril 2024" },
        { etiqueta: "COMISIONES", estado: "Ingreso complementario creciendo — sustentabilidad verificable" },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TAB 2: DISTRIBUCIÓN
    // Pregunta: ¿De quién es la red?
    // Construye: observación — la propiedad se descentraliza sin coordinación
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    distribucion: {
      concepto: {
        titulo: "¿De quién es realmente la red?",
        cuerpo:
          "En La Red viste cómo funciona el sistema. Ahora: ¿quién lo usa? El dinero tradicional no publica quién tiene cuánto — Bitcoin sí. Cada dirección tiene un saldo público, verificable, en tiempo real. Al clasificarlas por tamaño aparece un patrón que se repite ciclo tras ciclo: las cohortes pequeñas y medianas crecen mientras las mega-direcciones se comprimen. Sin que nadie lo coordine, la propiedad se dispersa.",
        senal: "43 millones de direcciones con saldo — más que la población de Argentina.",
      },
      panelEdu: {
        icono: "◆",
        titulo: "Lo que la distribución revela",
        color: "#06b6d4",
        cuerpo: `Las mega-direcciones pierden peso. Las cohortes medianas y pequeñas ganan. No es un trimestre — es una tendencia de más de una década.

Una dirección no es una persona. Un exchange puede tener millones de usuarios detrás de una sola dirección. Pero lo inverso es más revelador: cada nueva billetera pequeña con saldo sí representa una decisión individual de acumular.

En ningún otro sistema monetario puedes verificar públicamente la distribución de la propiedad. En el dinero tradicional, los balances son privados y las reglas cambian sin aviso.

Pero tener Bitcoin es una cosa. No venderlo es otra. La siguiente sección muestra quién decidió retener — incluso durante los peores crashes.`,
        cierre:
          "Millones de decisiones individuales, sin coordinación, empujando la propiedad en la misma dirección — hacia abajo en la escala.",
      },
      senales: [
        { etiqueta: "DISTRIBUCIÓN", estado: "La propiedad se dispersa — sin que nadie lo coordine" },
        { etiqueta: "GRANDES TENEDORES", estado: "Las mega-direcciones pierden peso ciclo tras ciclo" },
        { etiqueta: "MINORISTAS", estado: "Más billeteras individuales con saldo que nunca" },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TAB 3: CONVICCIÓN (antes Ondas HODL)
    // Pregunta: ¿Quién no vende — y por qué?
    // Construye: patrón — después de cada crash, más gente retiene
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ondas: {
      concepto: {
        titulo: "El Bitcoin que no se vende. Ni en crashes. Ni en máximos.",
        cuerpo:
          "En Distribución viste quién tiene Bitcoin. Ahora: ¿quién lo retiene a pesar de todo? Cada UTXO (unidad gastable de Bitcoin) registra públicamente cuándo se movió por última vez. Al agrupar toda la oferta por antigüedad, aparece un patrón sin precedente en ningún mercado: las bandas frías — BTC que lleva más de 3 años sin moverse — se expanden con cada ciclo. Ese capital sobrevivió caídas del 80%, quiebras de exchanges y pánico mediático. Y no se vendió.",
        senal: "Más del 40% de todo el BTC lleva más de 3 años sin moverse.",
      },
      panelEdu: {
        icono: "◈",
        titulo: "Lo que las ondas revelan sobre la convicción",
        color: "#a855f7",
        cuerpo: `**Bandas calientes (menos de 6 meses):** Cuando se expanden, hay dinero nuevo entrando — compradores recientes. Cuando se comprimen, nadie está vendiendo lo que acaba de comprar.

**Bandas frías (más de 3 años):** Capital que sobrevivió caídas del 80%, la quiebra de FTX, el pánico de Luna/UST — y no se movió. Estas bandas crecen con cada ciclo. Nunca se han contraído de forma sostenida.

En los mercados tradicionales, los crashes generan capitulación masiva. En Bitcoin, cada crash deja una base más grande de personas que deciden no vender.

Pero retener no es lo mismo que retirar. La siguiente sección muestra hacia dónde se mueve físicamente el Bitcoin — y de dónde está saliendo.`,
        cierre:
          "No tiene precedente en ningún otro activo: un mercado donde, después de cada pánico, más gente decide retener.",
      },
      senales: [
        { etiqueta: "CONVICCIÓN", estado: "Máxima proporción de BTC sin moverse en la historia de la red" },
        { etiqueta: "BANDAS CALIENTES", estado: "Comprimidas — el BTC recién comprado no se está vendiendo" },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TAB 4: FLUJOS
    // Pregunta: ¿De dónde sale y a dónde va?
    // Construye: tendencia — migración de exchanges a custodia propia
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    flujos: {
      concepto: {
        titulo: "Los exchanges se vacían. ¿A dónde va el Bitcoin?",
        cuerpo:
          "En Convicción viste que la gente retiene. Ahora: ¿dónde lo guarda? Cuando retiras BTC de un exchange a tu propia billetera, dejas de depender de la promesa de un tercero. Después del colapso de FTX en 2022, millones aprendieron la diferencia entre custodiar y confiar. Las reservas en exchanges están en niveles no vistos desde 2018. Y los ETFs al contado, aprobados en enero 2024, aceleran las salidas. El patrón no es cíclico — es estructural.",
        senal: "Reservas en exchanges en mínimos de 7 años. Más BTC saliendo que entrando.",
      },
      panelEdu: {
        icono: "⇄",
        titulo: "Cinco años de flujos — la tubería se vacía",
        color: "#06b6d4",
        cuerpo: `**2021:** La euforia llenó los exchanges. Todo el mundo depositaba para vender en máximos.

**2022:** FTX demostró que "confía en nosotros" no es una garantía. Las salidas se aceleraron.

**2023:** Silencio en los titulares. Éxodo constante en los datos. El mercado acumulaba mientras los medios lo ignoraban.

**2024:** Los ETFs al contado empezaron a absorber oferta. El halving recortó la emisión a la mitad. Dos fuerzas convergiendo sobre una oferta fija.

**2025-26:** Reservas en mínimos de 7 años. ¿Cuándo fue la última vez que la oferta de dólares, euros o pesos disminuyó?

Pero los exchanges no son los únicos acumulando menos. La siguiente sección muestra quién está comprando a escala institucional.`,
        cierre:
          "Un sistema con oferta fija donde la demanda es estructural y creciente. Los flujos muestran la consecuencia en tiempo real.",
      },
      senales: [
        { etiqueta: "RESERVAS", estado: "Mínimos de 7 años — el tanque de venta se vacía" },
        { etiqueta: "EFECTO ETF", estado: "Los ETFs drenan exchanges a escala industrial desde ene. 2024" },
        { etiqueta: "CUSTODIA PROPIA", estado: "Después de FTX, la tendencia es irreversible" },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TAB 5: ACUMULADORES (antes Holders)
    // Pregunta: ¿Quién está comprando a escala?
    // Construye: contexto — instituciones, corporaciones, gobiernos
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    holders: {
      concepto: {
        titulo: "ETFs, corporaciones, gobiernos. Todos acumulando.",
        cuerpo:
          "En Flujos viste el capital saliendo de exchanges. Parte va a billeteras individuales. Otra parte — creciente — va a instituciones. BlackRock lanzó un ETF en enero 2024 y en meses acumuló más BTC que la mayoría de los países. Strategy lleva años convirtiendo su tesorería. Los gobiernos incautan pero no venden. Lo que antes era \"activo especulativo\" ahora aparece en balances auditados y prospectos regulados. Esta tabla muestra la fracción visible — la mayoría del Bitcoin está en manos de tenedores anónimos.",
        senal: "Los 11 ETFs al contado de EE.UU. acumularon más de 1.1M BTC en 14 meses.",
      },
      panelEdu: {
        icono: "⬡",
        titulo: "La acumulación que no sale en los titulares",
        color: "#818cf8",
        cuerpo: `BlackRock, Fidelity, Strategy, gobiernos — cada uno acumulando por razones distintas pero con el mismo efecto: comprimen la oferta disponible.

Mientras tanto, los bancos centrales repiten que Bitcoin "no tiene valor intrínseco". Las instituciones que ellos regulan lo acumulan a ritmo récord.

Esta tabla muestra solo la punta visible. La mayoría del Bitcoin está en billeteras anónimas de individuos que no reportan a ningún regulador. Ambas fuerzas — la institucional visible y la individual silenciosa — aprietan la oferta desde los dos lados.

¿Cuánto queda después de restar todo lo que ya está acumulado? La última sección hace la cuenta.`,
        cierre:
          "Los datos institucionales son la punta de un fenómeno más profundo — y ambas fuerzas comprimen la oferta disponible.",
      },
      senales: [
        { etiqueta: "ETFs", estado: "BlackRock + Fidelity: los nuevos mega-tenedores" },
        { etiqueta: "TREASURIES", estado: "Corporaciones convirtiendo efectivo en BTC" },
        { etiqueta: "GOBIERNOS", estado: "Incautan pero no venden — incluso ellos retienen" },
      ],
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TAB 6: ESCASEZ (antes Soberanía)
    // Pregunta: ¿Cuánto queda para individuos?
    // Construye: implicación — ahora que entiendes todo, haz las cuentas
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    soberania: {
      concepto: {
        titulo: "21 millones. Resta lo perdido, lo institucional, lo no minado. ¿Cuánto queda?",
        cuerpo:
          "Has visto cómo funciona la red, cómo se distribuye la propiedad, quién retiene, de dónde sale el capital y quién acumula a escala. Ahora la cuenta final. De los 21 millones de BTC que existirán, hay que restar lo que aún no se minó, lo perdido para siempre, y lo que ya absorbieron ETFs, corporaciones, gobiernos y exchanges. Lo que queda — la oferta disponible para que individuos la custodien directamente — se reduce cada día. Esta sección muestra exactamente cuánto.",
        senal: "Menos de 5M BTC disponibles para autocustodia individual — de 21M totales.",
      },
      panelEdu: {
        icono: "⚡",
        titulo: "La aritmética que nadie hace",
        color: "#f0b429",
        cuerpo: `Cada sistema monetario de la historia ha funcionado igual: alguien controla la emisión y eventualmente emite más de lo prometido. Bitcoin eliminó ese rol. La oferta es fija. Las reglas son código. La auditoría es pública.

**Autocustodia** significa que tú — y solo tú — controlas tus llaves privadas. Es la diferencia entre tener un número en la base de datos de un banco y tener un activo que ningún tercero puede congelar, confiscar o diluir.

Si los 5.500 millones de adultos del planeta quisieran una fracción, la cuenta no da. Y cada día da menos: los ETFs, corporaciones y gobiernos absorben oferta a un ritmo que se acelera.

Todo lo que viste en las secciones anteriores — la seguridad, la distribución, la convicción, los flujos, la acumulación institucional — converge aquí: en un número que se achica bloque a bloque.`,
        cierre:
          "No es una opinión — es aritmética verificable en cada bloque que se mina.",
      },
      senales: [
        { etiqueta: "OFERTA DISPONIBLE", estado: "Menos de 5M BTC para autocustodia individual" },
        { etiqueta: "PRESIÓN INSTITUCIONAL", estado: "Cada ETF que compra reduce lo que queda" },
        { etiqueta: "ESCASEZ", estado: "Si todos quisieran, no alcanza — y cada día alcanza menos" },
      ],
    },
  },
} as const;
