import React from 'react';

interface StockSelectorProps {
  stocks: string[];
  onSelect: (stock: string) => void;
}

const StockSelector: React.FC<StockSelectorProps> = ({ stocks, onSelect }) => {
  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      {stocks.map((stock, index) => (
        <option key={index} value={stock}>
          {stock}
        </option>
      ))}
    </select>
  );
};

export default StockSelector; 