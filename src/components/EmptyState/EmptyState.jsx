// EmptyState component - icon, title, description, action button
import { FiInbox } from 'react-icons/fi';
import './EmptyState.css';

const EmptyState = ({
  icon,
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có nội dung nào để hiển thị.',
  action,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-icon">{icon || <FiInbox size={48} />}</div>
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {(action || onAction) && (
        <div className="empty-action">
          {action || (
            <button className="btn btn--primary btn--md" onClick={onAction}>
              {actionLabel || 'Thực hiện ngay'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
