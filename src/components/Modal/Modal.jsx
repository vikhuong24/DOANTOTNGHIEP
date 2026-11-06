// Modal component - title, children, footer, onClose, overlay
import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closable ? onClose : undefined}>
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {(title || closable) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {closable && (
              <button className="modal-close" onClick={onClose} aria-label="Đóng">
                <FiX size={20} />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
