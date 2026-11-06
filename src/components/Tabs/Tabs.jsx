// Tabs component - tabs array, active, onChange
import './Tabs.css';

const Tabs = ({ tabs = [], active, onChange, className = '' }) => {
  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-nav" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active === tab.value}
            className={`tabs-tab ${active === tab.value ? 'tabs-tab--active' : ''} ${
              tab.disabled ? 'tabs-tab--disabled' : ''
            }`}
            onClick={() => !tab.disabled && onChange(tab.value)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="tabs-icon">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="tabs-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
