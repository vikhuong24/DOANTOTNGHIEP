// Lightbox component - xem ảnh phóng to với navigation
import { useEffect, useState, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import './Lightbox.css';

const Lightbox = ({ images = [], initialIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const goPrev = useCallback(() => {
    setCurrent((p) => (p > 0 ? p - 1 : images.length - 1));
    setScale(1);
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrent((p) => (p < images.length - 1 ? p + 1 : 0));
    setScale(1);
  }, [images.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, goPrev, goNext]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}><FiX size={24} /></button>
        <button className="lightbox-nav lightbox-nav--prev" onClick={goPrev} disabled={images.length <= 1}>
          <FiChevronLeft size={28} />
        </button>
        <div className="lightbox-image-wrap">
          <img
            src={images[current]?.src || images[current]}
            alt={images[current]?.alt || `Ảnh ${current + 1}`}
            style={{ transform: `scale(${scale})` }}
            className="lightbox-image"
          />
        </div>
        <button className="lightbox-nav lightbox-nav--next" onClick={goNext} disabled={images.length <= 1}>
          <FiChevronRight size={28} />
        </button>
        <div className="lightbox-toolbar">
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}><FiZoomOut /></button>
          <span>{current + 1} / {images.length}</span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.25))}><FiZoomIn /></button>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
