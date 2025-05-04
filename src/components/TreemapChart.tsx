import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Paper, Typography } from '@mui/material';
import { 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

// Data type for each asset in the treemap
interface AssetData {
  name: string;
  percent: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AssetData;
  }>;
}

const TreemapChart: React.FC = () => {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<AssetData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    // Responsive: update dimensions on resize
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.max(width, 200), height: 600 }); // expanded height for treemap
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const basePath = process.env.PUBLIC_URL || '';
      const [assetsRaw, marketsRaw, candlesRaw] = await Promise.all([
        d3.csv(`${basePath}/assets.csv`),
        d3.csv(`${basePath}/markets.csv`),
        d3.csv(`${basePath}/candles.csv`)
      ]);

      // Map market to asset name
      const marketToAsset: Record<string, string> = {};
      marketsRaw.forEach((market: any) => {
        const asset = assetsRaw.find((a: any) => a.symbol === market.base);
        marketToAsset[market.market] = asset ? asset.name : market.base;
      });

      // Find latest close for each market
      const latestClose: Record<string, any> = {};
      candlesRaw.forEach((row: any) => {
        const prev = latestClose[row.market];
        if (!prev || new Date(row.time) > new Date(prev.time)) {
          latestClose[row.market] = row;
        }
      });

      // Aggregate by asset name
      const assetTotals: Record<string, number> = {};
      Object.values(latestClose).forEach((candle: any) => {
        const assetName = marketToAsset[candle.market] || candle.market;
        const close = +candle.close;
        if (!assetTotals[assetName]) assetTotals[assetName] = 0;
        assetTotals[assetName] += close;
      });

      // Convert to array and sort descending
      let chartData: AssetData[] = Object.entries(assetTotals).map(([name, value]) => ({
        name,
        percent: value
      }));
      chartData.sort((a, b) => b.percent - a.percent);

      // Apply log scale to percent values to make smaller assets more visible
      chartData = chartData.map(d => ({
        ...d,
        percent: Math.log10(d.percent + 1)
      }));

      // Normalize to percent
      const total = d3.sum(chartData, d => d.percent);
      chartData.forEach(d => (d.percent = total > 0 ? d.percent / total : 0));

      setData(chartData);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    d3.select(ref.current).selectAll("*").remove();
    const { width, height } = dimensions;
    const root = d3.hierarchy({ children: data } as any).sum((d: any) => d.percent);
    d3.treemap().size([width, height]).padding(2)(root);
    const svg = d3.select(ref.current).attr("width", width).attr("height", height);
    const color = d3.scaleSequential().domain([0, d3.max(data, d => d.percent) || 1]).interpolator(d3.interpolateBlues);
    const nodes = svg.selectAll("g").data(root.leaves()).enter().append("g").attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);
    nodes.append("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("fill", (d: any) => color(d.data.percent))
      .on('mousemove', function(event: MouseEvent, d: any) {
        setTooltip({
          visible: true,
          x: event.offsetX + 10,
          y: event.offsetY + 10,
          content: `${d.data.name} ${(d.data.percent * 100).toFixed(2)}%`
        });
      })
      .on('mouseout', function() {
        setTooltip(t => ({ ...t, visible: false }));
      });
    nodes.append("text")
      .filter((d: any) => (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 24)
      .attr("x", 4)
      .attr("y", 18)
      .style("font-size", "12px")
      .style("fill", "#fff")
      .text((d: any) => `${d.data.name} ${(d.data.percent * 100).toFixed(2)}%`);
  }, [data, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', minHeight: 350, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
        Cryptocurrency Market Cap Distribution
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        Size represents market cap, color indicates asset category
      </Typography>
      <div style={{ flex: '0 0 580px', minHeight: 300, maxHeight: 600, width: '100%' }}>
        <svg ref={ref} style={{ width: '100%', height: '100%', display: 'block' }}></svg>
        {tooltip.visible && (
          <div style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            background: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 4,
            pointerEvents: 'none',
            fontSize: 14,
            zIndex: 10
          }}>
            {tooltip.content}
          </div>
        )}
      </div>
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Market Cap Categories (Log Scale)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#08306b', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Large Cap (darkest blue)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#4292c6', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Mid Cap (medium blue)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#deebf7', borderRadius: 0.5, mr: 1 }} />
            <Typography variant="body2">Small Cap (lightest blue)</Typography>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default TreemapChart; 