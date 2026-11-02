import { useEffect } from 'react';

// A simple "Are you sure?" pop-up. The page decides when to show it.
function ConfirmDialog({ title, message, confirmLabel, isBusy, onConfirm, onCancel }) {
  // Pressing Escape cancels.
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape' && !isBusy) {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isBusy, onCancel]);

  return (
    <div className="dialog-overlay" data-testid="confirm-dialog">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p data-testid="confirm-message">{message}</p>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isBusy}
            data-testid="confirm-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isBusy}
            data-testid="confirm-yes"
          >
            {isBusy ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;