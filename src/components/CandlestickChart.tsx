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

interface CandlestickChartProps {
  data: StockData[];
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 180 });

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
      .domain([d3.min(data, (d: StockData) => d.low) || 0, d3.max(data, (d: StockData) => d.high) || 0])
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d") as any));

    g.append("g")
      .call(d3.axisLeft(y));

    g.selectAll("line.stem")
      .data(data)
      .enter().append("line")
      .attr("class", "stem")
      .attr("x1", (d: StockData) => x(d.date))
      .attr("x2", (d: StockData) => x(d.date))
      .attr("y1", (d: StockData) => y(d.low))
      .attr("y2", (d: StockData) => y(d.high))
      .attr("stroke", "black");

    const candleWidth = width / data.length * 0.8;

    g.selectAll("rect.candle")
      .data(data)
      .enter().append("rect")
      .attr("class", "candle")
      .attr("x", (d: StockData) => x(d.date) - candleWidth / 2)
      .attr("y", (d: StockData) => y(Math.max(d.open, d.close)))
      .attr("width", candleWidth)
      .attr("height", (d: StockData) => y(Math.min(d.open, d.close)) - y(Math.max(d.open, d.close)))
      .attr("fill", (d: StockData) => d.open > d.close ? "red" : "green");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2.5)
      .attr("text-anchor", "middle")
      .text("Stock Price");

  }, [data, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '50%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
};

export default CandlestickChart; 