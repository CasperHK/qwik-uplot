# qwik-uplot 🚀

[![npm version](https://shields.io)](https://npmjs.com)
[![license](https://shields.io)](https://github.com)

The fastest time-series charting library (**uPlot**) meets the fastest web framework (**Qwik**). 

`qwik-uplot` provides a high-performance, responsive wrapper around `uPlot` designed specifically for Qwik's **Resumability** architecture. It bypasses server-side canvas rendering and lazy-loads zero JavaScript until it is required on the client side.

---

## ✨ Features

- ⚡ **Zero Hydration Cost:** Leverages Qwik's lazy-loading. Absolutely no charting code is processed on initial SSR layout.
- 📉 **Ultra High Performance:** Powered by uPlot's raw HTML5 Canvas rendering engine. Capable of updating millions of points smoothly.
- 📐 **Auto-Responsive:** Built-in `ResizeObserver` automatically recalibrates and scales chart width to fit its parent container seamlessly.
- 🔄 **Efficient Data Updates:** Uses uPlot's native `.setData()` delta mechanism instead of tearing down and recreating the chart instance on data refreshes.
- 🦺 **Fully Typed:** Built with TypeScript for auto-completion and compile-time validation.

---

## 📦 Installation

Ensure you have both `uplot` and `@builder.io/qwik` in your project dependencies.

```bash
npm install qwik-uplot uplot
# or via yarn / pnpm / bun
pnpm add qwik-uplot uplot
```

---

## 🚀 Quick Start

Here is how you can render a responsive, high-performance time-series chart inside any Qwik component:

```tsx
import { component\$, useStore } from '@builder.io/qwik';
import { QwikUPlot } from 'qwik-uplot';

export default component\$(() => {
  // 1. Maintain your time-series data streams reactively via stores or signals
  const state = useStore({
    seriesData: [, // Unix Timestamps (X-Axis),         // Series 1 Metrics (Y-Axis)
    ] as any,
  });

  // 2. Configure uPlot Options (Leave width out, it auto-resizes!)
  const chartOptions = {
    title: "Server CPU Performance",
    series: [
      {}, // Baseline X-axis config
      {
        label: "CPU Usage (%)",
        stroke: "#3b82f6", // Beautiful blue line
        width: 2,
      },
    ],
    axes: [
      {},
      {
        values: (self: any, splits: number[]) => splits.map(v => v + "%"),
      },
    ],
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>System Dashboard</h2>
      
      {/* Dynamic, auto-resizable container */}
      <div style={{ width: '100%', background: '#fff', border: '1px solid #ddd' }}>
        <QwikUPlot 
          options={chartOptions} 
          data={state.seriesData} 
          height={400} 
        />
      </div>
    </div>
  );
});
```

---

## ⚙️ Component API (Props)

The `<QwikUPlot />` component accepts the following declarative props:

| Prop | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `options` | `Omit<uPlot.Options, 'width' \| 'height'>` | **Yes** | — | Standard `uPlot` configuration options. Width and height are managed internally. |
| `data` | `uPlot.AlignedData` | **Yes** | — | Multidimensional array matching uPlot's `[ [x-ticks], [series-1], ... ]` layout. |
| `height` | `number` | No | `400` | Fixed pixel height of the generated canvas chart. |

---

## 🛠️ Performance Optimization Tips

When feeding streaming data (e.g., from WebSockets or `setInterval`), make sure you are mutating your Qwik state optimally. Because `qwik-uplot` tracks your `data` prop reactively via Qwik's reactive engine, modifying the top-level array layout will trigger lightning-fast canvas rerenders without remounting the DOM component tree.

```tsx
// Correct streaming update approach inside a hook/task:
state.seriesData = [
  [...state.seriesData[0], newTimestamp],
  [...state.seriesData[1], newMetricValue]
];
```

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
