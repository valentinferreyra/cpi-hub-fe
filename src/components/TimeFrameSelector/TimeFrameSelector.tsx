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
      <div className="time-frame-buttons">
        {TIME_FRAME_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`time-frame-button ${selectedTimeFrame === option.value ? 'active' : ''
              }`}
            onClick={() => onTimeFrameChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeFrameSelector;
