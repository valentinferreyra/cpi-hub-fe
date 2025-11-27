import React from 'react';
import type { TimeFrame } from '../../types/trending';
import './TimeFrameSelector.css';

interface TimeFrameSelectorProps {
  selectedTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const TIME_FRAME_OPTIONS: { value: TimeFrame; label: string }[] = [
  { value: '24h', label: '24 horas' },
  { value: '7d', label: '1 semana' },
  { value: '30d', label: '1 mes' },
  { value: '', label: 'Todo el tiempo' },
];

const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  selectedTimeFrame,
  onTimeFrameChange,
}) => {
  return (
    <div className="time-frame-selector">
      <label htmlFor="timeframe-select" className="time-frame-label">
        Período:
      </label>
      <select
        id="timeframe-select"
        className="time-frame-dropdown"
        value={selectedTimeFrame}
        onChange={(e) => onTimeFrameChange(e.target.value as TimeFrame)}
      >
        {TIME_FRAME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeFrameSelector;
