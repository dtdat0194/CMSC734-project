import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Paper, Typography } from '@mui/material';
import { useCrypto } from '../context/CryptoContext';

// Data type for each asset in the treemap
interface AssetData {
  name: string;
  percent: number;
  displayPercent: number;
  children?: AssetData[];
}

interface HierarchyNode extends d3.HierarchyNode<AssetData> {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AssetData;
  }>;
}

const TreemapChart: React.FC = () => {
  const { selectedCrypto, setSelectedCrypto } = useCrypto();
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
        percent: value,
        displayPercent: 0  // Will be calculated later
      }));
      chartData.sort((a, b) => b.percent - a.percent);

      // Calculate total for percentage
      const total = d3.sum(chartData, d => d.percent);
      
      // Update display percentages
      chartData = chartData.map(d => ({
        ...d,
        displayPercent: (d.percent / total) * 100
      }));

      // Apply log scale only to the size values
      chartData = chartData.map(d => ({
        ...d,
        percent: Math.log10(d.percent + 1)
      }));

      // Normalize the log-scaled values for square sizes
      const logTotal = d3.sum(chartData, d => d.percent);
      chartData = chartData.map(d => ({
        ...d,
        percent: logTotal > 0 ? d.percent / logTotal : 0
      }));

      setData(chartData);

      // Update the visualization with highlighting
      const svg = d3.select(ref.current);
      if (!svg) return;
      svg.selectAll('*').remove();

      const width = containerRef.current?.clientWidth || 700;
      const height = containerRef.current?.clientHeight || 500;

      const treemap = d3.treemap<AssetData>()
        .size([width, height])
        .padding(1)
        .round(true);

      const root = d3.hierarchy<AssetData>({ 
        name: 'root', 
        percent: 0, 
        displayPercent: 0, 
        children: chartData 
      })
        .sum(d => d.percent)
        .sort((a, b) => b.value! - a.value!);

      treemap(root);

      const cell = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${(d as HierarchyNode).x0},${(d as HierarchyNode).y0})`);

      cell.append('rect')
        .attr('width', d => (d as HierarchyNode).x1 - (d as HierarchyNode).x0)
        .attr('height', d => (d as HierarchyNode).y1 - (d as HierarchyNode).y0)
        .attr('fill', d => {
          const market = d.data.name;
          const opacity = selectedCrypto ? (market === selectedCrypto ? 1 : 0.3) : 1;
          const color = d3.color('#1f77b4');
          return color ? color.copy({ opacity }).toString() : '#1f77b4';
        })
        .attr('stroke', '#fff')
        .on('mouseover', function(event, d) {
          const market = d.data.name;
          const opacity = selectedCrypto ? (market === selectedCrypto ? 1 : 0.3) : 1;
          const color = d3.color('#1f77b4');
          d3.select(this)
            .attr('fill', color ? color.copy({ opacity: opacity + 0.1 }).toString() : '#1f77b4');
          
          setTooltip({
            visible: true,
            x: event.pageX,
            y: event.pageY,
            content: `${market}<br/>Market Cap: $${(d.data.percent / 1e9).toFixed(1)}B`
          });
        })
        .on('mouseout', function(event, d) {
          const market = d.data.name;
          const opacity = selectedCrypto ? (market === selectedCrypto ? 1 : 0.3) : 1;
          const color = d3.color('#1f77b4');
          d3.select(this)
            .attr('fill', color ? color.copy({ opacity }).toString() : '#1f77b4');
          
          setTooltip({ visible: false, x: 0, y: 0, content: '' });
        })
        .on('click', function(event, d) {
          setSelectedCrypto(d.data.name);
        });

      cell.append('text')
        .attr('x', 4)
        .attr('y', 14)
        .text(d => d.data.name.split('-')[0])
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('opacity', d => {
          const market = d.data.name;
          return selectedCrypto ? (market === selectedCrypto ? 1 : 0.3) : 1;
        });
    };
    loadData();
  }, [selectedCrypto, setSelectedCrypto]);

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
          content: `${d.data.name} ${d.data.displayPercent.toFixed(2)}%`
        });
      })
      .on('mouseout', function() {
        setTooltip(t => ({ ...t, visible: false }));
      });
    nodes.append("text")
      .filter((d: any) => (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 24)
      .attr("x", 6)
      .attr("y", 16)
      .style("font-size", "11px")
      .style("fill", "#999999")
      .call(wrap, (d: any) => d.x1 - d.x0 - 12)
      .text((d: any) => d.data.name);

    // Add text wrapping function
    function wrap(text: any, width: any) {
      text.each(function(this: any) {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy"));
        let tspan = text.text(null).append("tspan").attr("x", 6).attr("y", y).attr("dy", dy + "em");
        
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          const node = tspan.node();
          if (node && node.getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 6).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }
  }, [data, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', minHeight: 350, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
        <span className="glossary-term" title="A visualization showing the relative size of different cryptocurrencies based on their total market value. Larger boxes represent cryptocurrencies with higher market capitalization.">Cryptocurrency Market Cap Distribution</span>
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
        <span className="glossary-term" title="The size of each box represents the total market value of the cryptocurrency, while the color intensity indicates its market cap category (large, mid, or small cap).">Size represents market cap, color indicates asset category</span>
      </Typography>
      <div style={{ flex: '0 0 500px', minHeight: 300, maxHeight: 600, width: '100%' }}>
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
            <div dangerouslySetInnerHTML={{ __html: tooltip.content }} />
          </div>
        )}
      </div>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ p: 2, bgcolor: 'background.paper', maxWidth: 400, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              <span className="glossary-term" title="Market cap categories are divided into large, mid, and small cap based on the total value of all coins in circulation. This helps investors understand the relative size and potential risk of different cryptocurrencies.">Market Cap Categories</span> (Log Scale)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <span className="glossary-term" title="A logarithmic scale is used to better visualize cryptocurrencies with vastly different market caps. This means each step represents a multiplication rather than addition, making it easier to compare both large and small cryptocurrencies.">Size and color intensity are based on log scale of market cap</span>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#08306b', borderRadius: 0.5, mr: 1 }} />
                <Typography variant="body2"><span className="glossary-term" title="Cryptocurrencies with the highest market capitalization, typically over $10 billion. These are usually more established and potentially less volatile.">Large Cap</span> (darkest blue)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#4292c6', borderRadius: 0.5, mr: 1 }} />
                <Typography variant="body2"><span className="glossary-term" title="Cryptocurrencies with medium market capitalization, typically between $1 billion and $10 billion. These often represent a balance of growth potential and risk.">Mid Cap</span> (medium blue)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#deebf7', borderRadius: 0.5, mr: 1 }} />
                <Typography variant="body2"><span className="glossary-term" title="Cryptocurrencies with smaller market capitalization, typically under $1 billion. These often have higher growth potential but also higher risk.">Small Cap</span> (lightest blue)</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default TreemapChart; 