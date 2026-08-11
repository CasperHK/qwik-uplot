import { component$, useContext } from '@builder.io/qwik';

import { PlotControllerContext } from '../internal/plot-context';

export type QwikUPlotTooltipProps = {
  class?: string;
  offset?: number;
};

const DEFAULT_OFFSET = 12;

export const QwikUPlotTooltip = component$<QwikUPlotTooltipProps>((props) => {
  const { class: className, offset = DEFAULT_OFFSET } = props;
  const controller = useContext(PlotControllerContext);
  const instance = controller.instance.value;
  const snapshot = controller.snapshot.value;
  const cursor = snapshot.cursor;

  if (!instance || !cursor.visible || cursor.idx === null) {
    return null;
  }

  const xValues = snapshot.data[0] as ArrayLike<number> | undefined;
  const xValue = xValues?.[cursor.idx];
  const left = instance.over.offsetLeft + cursor.left + offset;
  const top = instance.over.offsetTop + cursor.top + offset;

  return (
    <div
      class={className}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: '10',
        minWidth: '160px',
        pointerEvents: 'none',
        borderRadius: '8px',
        border: '1px solid rgba(15, 23, 42, 0.14)',
        background: 'rgba(255, 255, 255, 0.96)',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
        padding: '10px 12px',
        color: '#0f172a',
        fontSize: '12px',
        lineHeight: '1.4',
      }}
    >
      <div style={{ fontWeight: '600', marginBottom: '6px' }}>{xValue ?? 'No data'}</div>
      <div>
        {instance.series.slice(1).map((series, seriesIdx) => {
          const dataIdx = cursor.idxs[seriesIdx + 1] ?? cursor.idx;
          const seriesData = snapshot.data[seriesIdx + 1] as ArrayLike<number | null | undefined> | undefined;
          const value = dataIdx == null ? null : seriesData?.[dataIdx] ?? null;
          const stroke = typeof series.stroke === 'string' ? series.stroke : '#2563eb';
          const label = typeof series.label === 'string' ? series.label : `Series ${seriesIdx + 1}`;

          return (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: stroke,
                  }}
                />
                <span>{label}</span>
              </div>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value ?? '—'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
