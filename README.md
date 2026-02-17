# Observalo — Observatorio de Bitcoin

Análisis de la red Bitcoin, educativo, en español para la comunidad hispanohablante global.

> [observalo.com](https://observalo.com)

<!-- Screenshot placeholder -->
<!-- ![Observalo Dashboard](./screenshot.png) -->

## Qué muestra

El dashboard se divide en 4 secciones:

- **Distribución** — Cómo se reparte el supply de Bitcoin entre direcciones de distintos tamaños (cohortes marinas: Plancton, Camarón, Ballena, etc.)
- **Ondas HODL** — Antigüedad de los UTXO en la red. Muestra cuánto BTC lleva meses o años sin moverse — indicador de convicción colectiva
- **Flujos de Exchanges** — Entradas y salidas de BTC de exchanges centralizados. Salida neta = acumulación. Incluye eventos históricos como el colapso de FTX y la aprobación del ETF
- **Minería** — Hashrate, dificultad, comisiones y recompensa por bloque. Incluye datos en vivo de mempool.space

## Stack tecnológico

- [Next.js](https://nextjs.org/) — Framework React con App Router
- [TypeScript](https://www.typescriptlang.org/) — Tipos estáticos
- [Recharts](https://recharts.org/) — Gráficos
- [mempool.space API](https://mempool.space/docs/api) — Datos en vivo de minería

## Cómo correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Fuentes de datos

- **Datos de minería en vivo**: [mempool.space](https://mempool.space) (hashrate, dificultad, comisiones, último bloque)
- **Distribución, ondas HODL y flujos**: Datos simulados como placeholder — se conectarán a APIs reales en futuras versiones

## Licencia

MIT
