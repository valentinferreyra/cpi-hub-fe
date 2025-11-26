import React from 'react';
import './TrendingViewSelector.css';

export type TrendingView = 'posts' | 'comments' | 'users';

interface TrendingViewSelectorProps {
  selectedView: TrendingView;
  onChange: (view: TrendingView) => void;
}

const options: { key: TrendingView; label: string }[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'comments', label: 'Comentarios' },
  { key: 'users', label: 'Usuarios' },
];

const TrendingViewSelector: React.FC<TrendingViewSelectorProps> = ({ selectedView, onChange }) => {
  return (
    <div className="trending-view-selector">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`trending-view-btn ${selectedView === opt.key ? 'active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default TrendingViewSelector;
