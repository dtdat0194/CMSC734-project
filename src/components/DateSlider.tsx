import React from 'react';
import ReactSlider from 'react-slider';
import './DateSlider.css';

interface DateSliderProps {
  dates: number[];
  range: [number, number];
  onChange: (range: [number, number]) => void;
}

const DateSlider: React.FC<DateSliderProps> = ({ dates, range, onChange }) => {
  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      onChange([value[0], value[1]]);
    }
  };

  const formatDate = (index: number) => {
    if (index >= 0 && index < dates.length) {
      return new Date(dates[index]).toLocaleDateString();
    }
    return '';
  };

  return (
    <div className="date-slider">
      <div className="date-labels">
        <span>{formatDate(range[0])}</span>
        <span>{formatDate(range[1])}</span>
      </div>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="example-thumb"
        trackClassName="example-track"
        defaultValue={[0, dates.length - 1]}
        value={range}
        onChange={handleSliderChange}
        min={0}
        max={dates.length - 1}
        renderTrack={(props, state) => (
          <div
            {...props}
            key={state.index}
            className={`example-track ${state.index === 1 ? 'example-track-1' : 'example-track-0'}`}
          />
        )}
      />
    </div>
  );
};

export default DateSlider; 