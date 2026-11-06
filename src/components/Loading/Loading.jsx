// Loading component - spinner và skeleton loader
import './Loading.css';

const Loading = ({ type = 'spinner', rows = 3, fullScreen = false, text = 'Đang tải...' }) => {
  if (type === 'skeleton') {
    return (
      <div className="skeleton-wrap">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton skeleton--line" style={{ width: `${60 + (i % 3) * 15}%` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`loading-wrap ${fullScreen ? 'loading-wrap--fullscreen' : ''}`}>
      <div className="loading-spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
