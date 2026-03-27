// Modal component

let activeModal = null;

export const Modal = {
  open(title, content, footer = '') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button type="button" class="modal-close" data-close>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-close]')) {
        this.close();
      }
    });

    document.body.appendChild(overlay);
    activeModal = overlay;

    // Focus first input
    setTimeout(() => {
      const firstInput = overlay.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 100);

    return overlay;
  },

  close() {
    console.log('Modal.close() called');
    if (activeModal) {
      activeModal.style.display = 'none';
      activeModal.style.visibility = 'hidden';
      activeModal.style.opacity = '0';
      activeModal.innerHTML = '';
      document.body.removeChild(activeModal);
      activeModal = null;
      console.log('Modal forcefully closed');
    }
  },

  getContainer() {
    return activeModal;
  }
};
