import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface StockData {
  market: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MovingAveragePoint {
  date: Date;
  avg: number;
}

interface VolumeChartProps {
  data: StockData[];
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 120 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new window.ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = Math.max(dimensions.width - margin.left - margin.right, 0);
    const height = Math.max(dimensions.height - margin.top - margin.bottom, 0);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: StockData) => d.volume) || 0])
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d") as any));

    g.append("g")
      .call(d3.axisLeft(y));

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data, (d: StockData) => d.volume) || 0])
      .interpolator(d3.interpolateRgb("#eee", "#000"));

    const candleWidth = width / data.length * 0.8;

    g.selectAll("rect.volume")
      .data(data)
      .enter().append("rect")
      .attr("class", "volume")
      .attr("x", (d: StockData) => x(d.date) - candleWidth / 2)
      .attr("y", (d: StockData) => y(d.volume))
      .attr("width", candleWidth)
      .attr("height", (d: StockData) => height - y(d.volume))
      .attr("fill", (d: StockData) => colorScale(d.volume));

    const movingAvg = (data: StockData[], windowSize: number): MovingAveragePoint[] => {
      let means: MovingAveragePoint[] = [];
      for (let i = windowSize - 1; i < data.length; i++) {
        const window = data.slice(i - windowSize + 1, i + 1);
        const avg = d3.mean(window, d => d.volume) || 0;
        means.push({
          date: data[i].date,
          avg: avg
        });
      }
      return means;
    };

    const avgData = movingAvg(data, 5);

    const line = d3.line<MovingAveragePoint>()
      .x(d => x(d.date))
      .y(d => y(d.avg));

    g.append("path")
      .datum(avgData)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    g.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .text("Volume");

  }, [data, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '50%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default VolumeChart; 