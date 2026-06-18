"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
} from "lightweight-charts";
import { useTradeStore } from "@/stores/trade-store";

function generateFakeCandles(): CandlestickData[] {
  const candles: CandlestickData[] = [];

  let price = 100000;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 120; i > 0; i--) {
    const time = (now - i * 60) as UTCTimestamp;

    const open = price;
    const close = open + (Math.random() - 0.5) * 800;
    const high = Math.max(open, close) + Math.random() * 300;
    const low = Math.min(open, close) - Math.random() * 300;

    candles.push({
      time,
      open,
      high,
      low,
      close,
    });

    price = close;
  }

  return candles;
}

export function ChartPanel() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const selectedMarket = useTradeStore((state) => state.selectedMarket);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#111827",
        },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: {
          color: "#1f2937",
        },
        horzLines: {
          color: "#1f2937",
        },
      },
      rightPriceScale: {
        borderColor: "#2b3648",
      },
      timeScale: {
        borderColor: "#2b3648",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16c784",
      downColor: "#ea3943",
      borderUpColor: "#16c784",
      borderDownColor: "#ea3943",
      wickUpColor: "#16c784",
      wickDownColor: "#ea3943",
    });

    candleSeries.setData(generateFakeCandles());

    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;

      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [selectedMarket]);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-md border border-border bg-surface">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-3">
        <p className="text-sm font-medium">{selectedMarket} Chart</p>

        <span className="text-xs text-text-muted">1m fake candles</span>
      </div>

      <div ref={containerRef} className="min-h-0 flex-1" />
    </section>
  );
}
