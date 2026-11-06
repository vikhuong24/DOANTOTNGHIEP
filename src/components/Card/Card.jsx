// Card component - title, children, footer, hoverable
import './Card.css';

const Card = ({ title, children, footer, hoverable = false, className = '', onClick, padding = true }) => {
  return (
    <div
      className={`card ${hoverable ? 'card--hoverable' : ''} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="card-header">
          {typeof title === 'string' ? <h3 className="card-title">{title}</h3> : title}
        </div>
      )}
      <div className={`card-body ${!padding ? 'card-body--no-padding' : ''}`}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
