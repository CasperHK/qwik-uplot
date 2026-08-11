import { createContextId, type NoSerialize, type Signal } from '@builder.io/qwik';
import type uPlot from 'uplot';

export type PlotStatus = 'idle' | 'ready' | 'destroyed';

export type PlotCursorSnapshot = {
  visible: boolean;
  left: number;
  top: number;
  idx: number | null;
  idxs: (number | null)[];
};

export type PlotSnapshot = {
  status: PlotStatus;
  width: number;
  height: number;
  data: uPlot.AlignedData;
  cursor: PlotCursorSnapshot;
};

export type PlotController = {
  hostRef: Signal<HTMLDivElement | undefined>;
  mountRef: Signal<HTMLDivElement | undefined>;
  instance: Signal<NoSerialize<uPlot> | undefined>;
  snapshot: Signal<PlotSnapshot>;
};

export const EMPTY_PLOT_CURSOR: PlotCursorSnapshot = {
  visible: false,
  left: 0,
  top: 0,
  idx: null,
  idxs: [],
};

export function createEmptyPlotSnapshot(height: number): PlotSnapshot {
  return {
    status: 'idle',
    width: 0,
    height,
    data: [[]] as unknown as uPlot.AlignedData,
    cursor: EMPTY_PLOT_CURSOR,
  };
}

export const PlotControllerContext = createContextId<PlotController>('qwik-uplot.plot-controller');
