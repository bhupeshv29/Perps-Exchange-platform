"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";

import { useTradeStore } from "@/stores/trade-store";

export function ChartPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<any>(null);

  const seriesRef = useRef<any>(null);

  const candles = useTradeStore((s) => s.candles);

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

      width: containerRef.current.clientWidth,

      height: containerRef.current.clientHeight,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16c784",
      downColor: "#ea3943",

      borderUpColor: "#16c784",
      borderDownColor: "#ea3943",

      wickUpColor: "#16c784",
      wickDownColor: "#ea3943",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;

    seriesRef.current.setData(candles);
  }, [candles]);

  useEffect(() => {
    if (!chartRef.current) return;

    const handleResize = () => {
      if (!containerRef.current) return;

      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="h-full w-full rounded-md border border-border bg-surface">
      <div ref={containerRef} className="h-full w-full" />
    </section>
  );
}
