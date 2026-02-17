// ─── Narrativa centralizada de Observalo ────────────────────────────
// Toda la capa de texto del sitio en un solo lugar.
// Tono: provocador + contraste dinero tradicional vs Bitcoin.

export const NARRATIVA = {
  // ── Header ──
  tagline: "Lo que el dinero tradicional esconde, la cadena lo registra",
  subtitulo:
    "Cada transacción, cada bloque, cada regla — verificable por cualquiera. El primer sistema monetario sin secretos.",

  // ── Footer ──
  footerAtribucion:
    "OBSERVALO · Datos verificables de la red Bitcoin · mempool.space + bitcoin-data.com",
  footerContexto:
    "Bitcoin nació como respuesta a un sistema que rescata bancos con el dinero de todos. Los datos de la cadena son la evidencia de que la respuesta funciona.",
  footerDisclaimer:
    "Este sitio es solo informativo. No constituye asesoría financiera, tributaria ni de inversión de ningún tipo. Los datos provienen de fuentes públicas y pueden contener estimaciones.",

  // ── Tabs ──
  tabs: {
    soberania: {
      concepto: {
        titulo: "21 millones. Sin excepciones. Haz las cuentas.",
        cuerpo:
          "En el sistema tradicional, la oferta de dinero cambia cada vez que un banco central lo decide — y lo decide a puertas cerradas. Bitcoin eliminó esa puerta. Son 21 millones de unidades, escritas en código abierto, verificables por cualquiera en cualquier momento. Pero de esos 21 millones, hay que restar lo perdido para siempre, lo que aún no se minó, y lo que ya acapararon ETFs, corporaciones y gobiernos. Lo que queda — la oferta soberana — se achica cada día. Esta sección muestra exactamente cuánto.",
        senal: "La oferta soberana se reduce cada trimestre. Las instituciones no esperan.",
      },
      panelEdu: {
        icono: "⚡",
        titulo: "Las matemáticas que nadie te enseñó",
        color: "#f0b429",
        cuerpo: `Cada sistema monetario de la historia ha funcionado igual: alguien controla la emisión, y ese alguien eventualmente imprime más de lo prometido. Bitcoin eliminó ese rol. La oferta es fija. Las reglas son código. La auditoría es pública.

**Autocustodia** significa que tú — y solo tú — controlas tus llaves privadas. Es la diferencia entre tener un número en la base de datos de un banco y tener un activo que ningún tercero puede congelar, confiscar o diluir.

Si los 5.500 millones de adultos del planeta quisieran una fracción, la cuenta no da. Y cada día da menos: los ETFs, corporaciones y gobiernos absorben oferta a un ritmo que se acelera.`,
        cierre:
          "No es una opinión — es aritmética verificable en cada bloque que se mina.",
      },
      senales: [
        { etiqueta: "OFERTA SOBERANA", estado: "Solo el 22% queda para individuos soberanos" },
        { etiqueta: "PRESIÓN INSTITUCIONAL", estado: "Cada ETF que compra reduce lo que queda" },
        { etiqueta: "ESCASEZ", estado: "Si todos quisieran, no alcanza" },
      ],
    },

    distribucion: {
      concepto: {
        titulo: "¿De quién es realmente la red?",
        cuerpo:
          "El dinero tradicional no publica quién tiene cuánto. Bitcoin sí. Cada dirección tiene un saldo público, verificable, en tiempo real. Al clasificarlas por tamaño — desde las más pequeñas hasta las ballenas — se revela un patrón que se repite ciclo tras ciclo: las cohortes pequeñas y medianas crecen, las mega-direcciones se comprimen. En un sistema donde nadie coordina la distribución, la propiedad se dispersa por millones de decisiones individuales. En Soberanía viste cuánto BTC queda disponible. Aquí ves cómo se reparte.",
        senal: "Más direcciones individuales que nunca acumulan su propio Bitcoin",
      },
      panelEdu: {
        icono: "◆",
        titulo: "Lo que la distribución revela",
        color: "#06b6d4",
        cuerpo: `Las mega-direcciones pierden peso. Las cohortes medianas y pequeñas ganan. No es un trimestre — es una tendencia de más de una década. Los exchanges acumulan menos, los ETF redistribuyen propiedad fraccional, y millones de billeteras individuales suman fracciones que, en conjunto, desplazan a los grandes tenedores.

Una dirección no es una persona — un exchange puede tener millones de usuarios detrás de una sola dirección. Pero la dirección inversa es más reveladora: cada nueva billetera pequeña con saldo sí es una decisión individual.

En ningún otro sistema monetario se puede verificar públicamente quién tiene cuánto. En el dinero tradicional, los balances son privados, las reglas cambian sin aviso, y la distribución es opaca por diseño.`,
        cierre:
          "Aquí, las decisiones se acumulan bloque a bloque — sin que nadie las coordine, sin que nadie las pueda revertir.",
      },
      senales: [
        { etiqueta: "DISTRIBUCIÓN", estado: "La propiedad se dispersa — sin que nadie lo ordene" },
        { etiqueta: "GRANDES TENEDORES", estado: "Las ballenas pesan menos ciclo tras ciclo" },
        { etiqueta: "MINORISTAS", estado: "Más billeteras individuales que nunca" },
      ],
    },

    ondas: {
      concepto: {
        titulo: "El BTC que no se vende. Ni en crashes. Ni en máximos.",
        cuerpo:
          "En los mercados tradicionales, el pánico genera ventas masivas — es la norma. En Bitcoin, algo distinto está ocurriendo. Cada UTXO registra públicamente cuándo se movió por última vez. Cuando agrupas toda la oferta por antigüedad, aparece un patrón sin precedente: las bandas frías — BTC que lleva más de 3 años sin moverse — se expanden ciclo tras ciclo. Ese capital sobrevivió caídas del 80%, quiebras de exchanges y pánico mediático sin venderse. En Distribución viste quién tiene Bitcoin. Aquí ves quién decidió no soltarlo.",
        senal:
          "El 40% de todo el BTC lleva más de 3 años sin moverse — convicción en máximos",
      },
      panelEdu: {
        icono: "◈",
        titulo: "Lo que las ondas revelan sobre la convicción",
        color: "#a855f7",
        cuerpo: `**Bandas calientes (menos de 6 meses):** Cuando se expanden, es dinero nuevo entrando — compradores de último momento. Cuando se comprimen, nadie está vendiendo lo que acaba de comprar. Hoy están comprimidas.

**Bandas frías (más de 3 años):** Capital que sobrevivió a caídas del 80%, a la quiebra de FTX, al pánico de Luna/UST — y no se movió. Cada ciclo, estas bandas crecen. Nunca se han contraído.

En los mercados tradicionales, los crashes generan capitulación masiva. En Bitcoin, cada crash deja una base más grande de tenedores que no vendieron.`,
        cierre:
          "No tiene precedente en ningún otro activo: un mercado donde, después de cada pánico, más gente decide retener en lugar de huir.",
      },
      senales: [
        { etiqueta: "CONVICCIÓN", estado: "Máxima convicción registrada en la historia de la red" },
        { etiqueta: "FASE DEL CICLO", estado: "Bandas calientes comprimidas — nadie vende" },
      ],
    },

    flujos: {
      concepto: {
        titulo: "Los exchanges se vacían. ¿A dónde va el Bitcoin?",
        cuerpo:
          "En el sistema bancario, tu dinero es una promesa del banco — un número en su base de datos. Cuando retiras BTC de un exchange a tu propia billetera, dejas de depender de promesas. Después del colapso de FTX, millones aprendieron la diferencia entre custodiar y confiar. Las reservas en exchanges están en niveles no vistos desde 2018. Los ETFs al contado aceleran las salidas desde enero 2024. El patrón es estructural, no cíclico. En Ondas viste que la convicción crece — aquí ves cómo se materializa: el capital migra de custodios hacia soberanía individual.",
        senal: "Reservas en mínimos de 7 años. Más gente retirando que depositando.",
      },
      panelEdu: {
        icono: "⇄",
        titulo: "Cómo se vació la tubería — cinco años en datos",
        color: "#06b6d4",
        cuerpo: `**2021:** La euforia llenó los exchanges. Todo el mundo depositaba para vender en máximos.

**2022:** FTX demostró que "confía en nosotros" no es una garantía — es lo mismo que prometen los bancos, con la misma fragilidad. Las salidas se aceleraron.

**2023:** Silencio en los titulares. Éxodo constante en los datos. El mercado acumulaba mientras los medios lo ignoraban.

**2024:** Los ETFs al contado empezaron a absorber oferta a escala industrial. El halving recortó la emisión a la mitad. Dos fuerzas convergiendo.

**2025-26:** Reservas en mínimos de 7 años. Compare esto con cualquier moneda fiduciaria: ¿cuándo fue la última vez que la oferta de dólares, euros o pesos disminuyó?`,
        cierre:
          "El sistema diseñado para tener un suministro fijo está mostrando exactamente lo que pasa cuando la demanda es estructural y la oferta no negocia.",
      },
      senales: [
        { etiqueta: "RESERVAS", estado: "El tanque de venta se vacía. Mínimos de 7 años." },
        { etiqueta: "EFECTO ETF", estado: "Los ETFs drenan exchanges a ritmo industrial" },
        { etiqueta: "CUSTODIA PROPIA", estado: "Después de FTX, la gente eligió sus propias llaves" },
      ],
    },

    mineria: {
      concepto: {
        titulo: "Cada bloque cuesta electricidad real. Eso es lo que lo hace distinto.",
        cuerpo:
          "El dinero tradicional se crea con un clic — literalmente. Un banco central decide, un teclado ejecuta. Bitcoin invirtió la lógica: para crear un bloque, hay que gastar electricidad real. No hay atajo, no hay privilegio, no hay amigos del comité. El hashrate — el poder computacional total que protege la red — está en máximos históricos. Atacar Bitcoin hoy costaría más que el PIB de muchos países. Y cada ~4 años, la emisión se corta a la mitad — sin votación, sin excepciones. En Flujos viste el capital migrando a custodia propia. Aquí ves la fortaleza del sistema que eligieron.",
        senal: "Atacar Bitcoin es más caro que nunca. Y mañana será más caro.",
      },
      panelEdu: {
        icono: "⛏",
        titulo: "Reglas escritas en código, no en decretos",
        color: "#f0b429",
        cuerpo: `**La emisión no se discute. Se ejecuta.** Cada ~4 años el código reduce la recompensa a la mitad. No hubo voto. No hubo lobby. No hubo excepción. 50 → 25 → 12,5 → 6,25 → 3,125 BTC por bloque. En 2028 será 1,5625. Compara esto con cualquier banco central del mundo: ¿cuándo publicaron su calendario de emisión para los próximos 100 años?

**Seguridad:** Cada segundo, la red procesa cientos de millones de billones de cálculos. Revertir un solo bloque requeriría más energía que la producción anual de países enteros. Y la dificultad se ajusta sola — sin comité, sin votación.

**Sustentabilidad:** Cuando la recompensa baja, las comisiones suben proporcionalmente. El incentivo se recalibra con cada bloque.`,
        cierre:
          "Es el único sistema monetario donde la seguridad no depende de la buena fe de nadie — depende de la física y las matemáticas.",
      },
      senales: [
        { etiqueta: "HASHRATE", estado: "Nunca fue más caro atacar Bitcoin" },
        { etiqueta: "4to HALVING", estado: "3,125 BTC por bloque. En 2028, la mitad." },
      ],
    },

    holders: {
      concepto: {
        titulo: "ETFs, corporaciones, gobiernos. Todos acumulando.",
        cuerpo:
          "Durante décadas, las instituciones financieras ignoraron Bitcoin. Ahora compiten por acumularlo. BlackRock lanzó un ETF y en meses acumuló más BTC que la mayoría de los países. Strategy lleva años convirtiendo su tesorería. Los gobiernos incautan pero no venden. Lo que antes era \"activo especulativo\" ahora aparece en balances corporativos auditados y prospectos regulados. Esta tabla muestra solo la fracción visible — la mayoría del Bitcoin está en manos de tenedores anónimos que no responden ante ningún regulador. La asimetría de información se está cerrando.",
        senal: "Las instituciones ya decidieron. La pregunta es cuándo decides tú.",
      },
      panelEdu: {
        icono: "⬡",
        titulo: "La carrera que no sale en los titulares",
        color: "#818cf8",
        cuerpo: `En enero 2024, BlackRock lanzó un ETF de Bitcoin. En meses, acumuló más BTC que la mayoría de los países. Fidelity le sigue. Strategy lleva años convirtiendo su tesorería. Hasta los gobiernos — que incautan Bitcoin a criminales — prefieren retenerlo antes que venderlo.

Mientras tanto, los bancos centrales siguen repitiendo que Bitcoin "no tiene valor intrínseco" — mientras las instituciones que ellos regulan lo acumulan a ritmo récord.

Esta tabla muestra solo la fracción identificable. La mayoría del Bitcoin está en billeteras anónimas de individuos que acumulan sin comunicar a regulador alguno.`,
        cierre:
          "Los datos institucionales son la punta visible de un fenómeno mucho más profundo — y ambas fuerzas, la visible y la silenciosa, comprimen la oferta desde los dos lados.",
      },
      senales: [
        { etiqueta: "ETFs", estado: "BlackRock + Fidelity: los nuevos mega-tenedores" },
        { etiqueta: "TREASURIES", estado: "Las corporaciones convierten efectivo en Bitcoin" },
        { etiqueta: "GOBIERNOS", estado: "Incautan pero no venden — incluso ellos retienen" },
      ],
    },
  },
} as const;
