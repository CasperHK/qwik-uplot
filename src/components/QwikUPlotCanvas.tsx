import {
  component$,
  noSerialize,
  useContext,
  useSignal,
  useVisibleTask$,
  type Signal,
} from '@builder.io/qwik';
import type uPlot from 'uplot';

import { EMPTY_PLOT_CURSOR, PlotControllerContext } from '../internal/plot-context';

export type UPlotOptions = Omit<uPlot.Options, 'width' | 'height'>;

export type QwikUPlotCanvasProps = {
  options: UPlotOptions;
  data: uPlot.AlignedData;
  height?: number;
};

type PlotState = {
  ctor?: typeof uPlot;
  width: number;
  height: number;
  options?: UPlotOptions;
  data?: uPlot.AlignedData;
};

const DEFAULT_HEIGHT = 400;

async function ensurePlotCtor(state: Signal<PlotState>) {
  if (!state.value.ctor) {
    const imported = await import('uplot');

    state.value = {
      ...state.value,
      ctor: ('default' in imported ? imported.default : imported) as typeof uPlot,
    };
  }

  return state.value.ctor as typeof uPlot;
}

function destroyPlot(
  instance: uPlot | undefined,
  plotState: Signal<PlotState>,
  nextHeight: number,
) {
  if (instance) {
    instance.destroy();
  }

  plotState.value = {
    ...plotState.value,
    height: nextHeight,
  };
}

export const QwikUPlotCanvas = component$<QwikUPlotCanvasProps>((props) => {
  const controller = useContext(PlotControllerContext);
  const plotState = useSignal<PlotState>({
    width: 0,
    height: props.height ?? DEFAULT_HEIGHT,
  });

  useVisibleTask$(({ cleanup, track }) => {
    const host = track(() => controller.hostRef.value);

    if (!host) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(host.getBoundingClientRect().width);

      if (nextWidth !== controller.snapshot.value.width) {
        controller.snapshot.value = {
          ...controller.snapshot.value,
          width: nextWidth,
        };
      }
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(host);

    cleanup(() => {
      observer.disconnect();

      const instance = controller.instance.value;

      destroyPlot(instance, plotState, controller.snapshot.value.height);
      controller.instance.value = undefined;
      controller.snapshot.value = {
        ...controller.snapshot.value,
        status: 'destroyed',
        cursor: EMPTY_PLOT_CURSOR,
      };
    });
  });

  useVisibleTask$(async ({ track }) => {
    const mount = track(() => controller.mountRef.value);
    const width = track(() => controller.snapshot.value.width);
    const height = track(() => props.height ?? DEFAULT_HEIGHT);
    const options = track(() => props.options);
    const data = track(() => props.data);

    if (!mount || width <= 0) {
      return;
    }

    const instance = controller.instance.value;
    const current = plotState.value;
    const shouldRecreate = !instance || current.options !== options || current.height !== height;

    if (shouldRecreate) {
      destroyPlot(instance, plotState, height);

      const UPlot = await ensurePlotCtor(plotState);
      const nextInstance = new UPlot(
        {
          ...options,
          width,
          height,
        },
        data,
        mount,
      );

      controller.instance.value = noSerialize(nextInstance);
      controller.snapshot.value = {
        status: 'ready',
        width,
        height,
        data,
        cursor: EMPTY_PLOT_CURSOR,
      };
      plotState.value = {
        ...plotState.value,
        options,
        data,
        width,
        height,
      };

      return;
    }

    if (instance && current.width !== width) {
      instance.setSize({ width, height });
    }

    if (instance && current.data !== data) {
      instance.setData(data);
    }

    controller.snapshot.value = {
      ...controller.snapshot.value,
      status: 'ready',
      width,
      height,
      data,
    };
    plotState.value = {
      ...plotState.value,
      options,
      data,
      width,
      height,
    };
  });

  useVisibleTask$(({ cleanup, track }) => {
    const instance = track(() => controller.instance.value);

    if (!instance) {
      return;
    }

    const syncCursor = () => {
      const { cursor } = instance;

      controller.snapshot.value = {
        ...controller.snapshot.value,
        cursor: {
          visible: cursor.left != null && cursor.top != null && cursor.idx != null,
          left: cursor.left ?? 0,
          top: cursor.top ?? 0,
          idx: cursor.idx ?? null,
          idxs: cursor.idxs ?? [],
        },
      };
    };

    const clearCursor = () => {
      controller.snapshot.value = {
        ...controller.snapshot.value,
        cursor: EMPTY_PLOT_CURSOR,
      };
    };

    instance.over.addEventListener('mouseenter', syncCursor);
    instance.over.addEventListener('mousemove', syncCursor);
    instance.over.addEventListener('mouseleave', clearCursor);

    cleanup(() => {
      instance.over.removeEventListener('mouseenter', syncCursor);
      instance.over.removeEventListener('mousemove', syncCursor);
      instance.over.removeEventListener('mouseleave', clearCursor);
    });
  });

  return <div ref={controller.mountRef} />;
});
