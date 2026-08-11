import {
  Slot,
  component$,
  useContextProvider,
  useSignal,
  type PropsOf,
} from '@builder.io/qwik';

import {
  PlotControllerContext,
  createEmptyPlotSnapshot,
  type PlotController,
} from '../internal/plot-context';

const DEFAULT_HEIGHT = 400;

export type QwikUPlotRootProps = PropsOf<'div'> & {
  initialHeight?: number;
};

export const QwikUPlotRoot = component$<QwikUPlotRootProps>((props) => {
  const { initialHeight = DEFAULT_HEIGHT, ...divProps } = props;

  const controller: PlotController = {
    hostRef: useSignal<HTMLDivElement>(),
    mountRef: useSignal<HTMLDivElement>(),
    instance: useSignal(),
    snapshot: useSignal(createEmptyPlotSnapshot(initialHeight)),
  };

  useContextProvider(PlotControllerContext, controller);

  return (
    <div {...divProps}>
      <div ref={controller.hostRef} style={{ position: 'relative', width: '100%' }}>
        <Slot />
      </div>
    </div>
  );
});
