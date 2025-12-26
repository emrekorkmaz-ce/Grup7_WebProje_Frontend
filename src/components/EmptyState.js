import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon, 
  title = 'Veri bulunamadı', 
  message = 'Henüz burada içerik bulunmamaktadır.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

