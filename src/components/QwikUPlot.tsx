import { component$, type PropsOf } from '@builder.io/qwik';

import {
  QwikUPlotCanvas,
  type QwikUPlotCanvasProps,
} from './QwikUPlotCanvas';
import { QwikUPlotRoot } from './QwikUPlotRoot';

export type QwikUPlotProps = Omit<PropsOf<'div'>, 'children'> & QwikUPlotCanvasProps;

export const QwikUPlot = component$<QwikUPlotProps>((props) => {
  const { options, data, height, ...divProps } = props;

  return (
    <QwikUPlotRoot {...divProps} initialHeight={height}>
      <QwikUPlotCanvas options={options} data={data} height={height} />
    </QwikUPlotRoot>
  );
});