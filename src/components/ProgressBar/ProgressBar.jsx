// ProgressBar component - percent, showLabel, color
import './ProgressBar.css';

const ProgressBar = ({
  percent = 0,
  showLabel = true,
  color,
  height = 10,
  className = '',
  label,
}) => {
  const clamped = Math.min(100, Math.max(0, percent));
  const barColor =
    color ||
    (clamped >= 100 ? 'var(--success)' : clamped >= 70 ? 'var(--primary)' : clamped >= 40 ? 'var(--secondary)' : 'var(--warning)');

  return (
    <div className={`progress-wrap ${className}`}>
      {showLabel && (
        <div className="progress-label">
          <span>{label || 'Tiến độ'}</span>
          <span className="progress-percent">{clamped.toFixed(0)}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className="progress-bar"
          style={{ width: `${clamped}%`, background: barColor, transition: 'width 0.6s ease' }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
