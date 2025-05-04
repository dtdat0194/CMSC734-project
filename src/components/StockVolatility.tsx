import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import StockSelector from './StockSelector';
import CandlestickChart from './CandlestickChart';
import VolumeChart from './VolumeChart';
import DateSlider from './DateSlider';
import './StockVolatility.css';

interface StockData {
  market: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockVolatilityProps {
  stocks: string[];
  dataPath?: string; // Optional path to where the CSV files are stored
  onStockSelect?: (stock: string) => void;
  className?: string;
  expanded?: boolean;
}

const StockVolatility: React.FC<StockVolatilityProps> = ({
  stocks,
  dataPath = '/candles',
  onStockSelect,
  className = '',
  expanded = false
}) => {
  const [selectedStock, setSelectedStock] = useState<string>(stocks[0]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [dateRange, setDateRange] = useState<[number, number]>([0, 0]);
  const [filteredData, setFilteredData] = useState<StockData[]>([]);
  const [changeFilter, setChangeFilter] = useState<'Both' | 'Up' | 'Down'>('Both');

  useEffect(() => {
    if (selectedStock) {
      const basePath = process.env.PUBLIC_URL || '';
      d3.csv(`${basePath}/candles/${selectedStock}.csv`).then((data) => {
        const processedData = data.map(d => ({
          market: d.market,
          date: new Date(Number(d.time)),
          open: parseFloat(d.open),
          high: parseFloat(d.high),
          low: parseFloat(d.low),
          close: parseFloat(d.close),
          volume: parseFloat(d.volume),
        }));
    
        processedData.sort((a, b) => a.date.getTime() - b.date.getTime());
        setStockData(processedData);

        // Set default time range to 6 months from 12/31/2022
        const endDate = new Date('2022-12-31');
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 6);

        const startIndex = processedData.findIndex(d => d.date >= startDate);
        const endIndex = processedData.findIndex(d => d.date > endDate);
        
        setDateRange([
          startIndex >= 0 ? startIndex : 0,
          endIndex >= 0 ? endIndex - 1 : processedData.length - 1
        ]);
      });
    }
  }, [selectedStock, dataPath]);

  useEffect(() => {
    const filtered = stockData.slice(dateRange[0], dateRange[1] + 1).filter(d => {
      if (changeFilter === 'Up') return d.close > d.open;
      if (changeFilter === 'Down') return d.close < d.open;
      return true;
    });
    setFilteredData(filtered);
  }, [stockData, dateRange, changeFilter]);

  const handleStockSelect = (stock: string) => {
    setSelectedStock(stock);
    if (onStockSelect) {
      onStockSelect(stock);
    }
  };

  return (
    <div className={`stock-volatility ${className}` + (expanded ? ' expanded' : '')}>
      <h1>Stock Volatility</h1>
      <div className="filter-slider-row">
        <span style={{ fontWeight: 500, marginRight: 8 }}>Cryptocurrency Pairs</span>
        <StockSelector stocks={stocks} onSelect={handleStockSelect} />
        <div className="filter">
          <label>
            <input
              type="radio"
              value="Both"
              checked={changeFilter === 'Both'}
              onChange={() => setChangeFilter('Both')}
            />
            Both
          </label>
          <label>
            <input
              type="radio"
              value="Up"
              checked={changeFilter === 'Up'}
              onChange={() => setChangeFilter('Up')}
            />
            Up
          </label>
          <label>
            <input
              type="radio"
              value="Down"
              checked={changeFilter === 'Down'}
              onChange={() => setChangeFilter('Down')}
            />
            Down
          </label>
        </div>
        <div className="date-slider-container">
          <DateSlider 
            dates={stockData.map(d => d.date.getTime())} 
            range={dateRange} 
            onChange={setDateRange} 
          />
        </div>
      </div>
      <div className={`chart-container${expanded ? ' expanded' : ''}`}>
        <CandlestickChart data={filteredData} />
        <VolumeChart data={filteredData} />
      </div>
      <div className="legend-container">
        <div className="legend">
          <div><span className="legend-color up"></span> Up</div>
          <div><span className="legend-color down"></span> Down</div>
        </div>
        <div className="legend">
          <div><span className="legend-color volume"></span> Volume Intensity</div>
          <div><span className="legend-line"></span> Average Volume</div>
        </div>
      </div>
    </div>
  );
};

export default StockVolatility; 