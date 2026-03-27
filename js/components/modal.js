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
    console.log('Modal.close called, activeModal:', activeModal);
    if (activeModal) {
      const modalEl = activeModal.querySelector('.modal');
      console.log('Modal element:', modalEl);
      if (modalEl) {
        modalEl.style.display = 'none';
        console.log('Set modal display to none');
      }
      activeModal.style.display = 'none';
      console.log('Set overlay display to none');
      setTimeout(() => {
        if (activeModal && activeModal.parentNode) {
          activeModal.parentNode.removeChild(activeModal);
          console.log('Force removed from DOM');
        }
        activeModal = null;
        console.log('Modal closed and removed');
      }, 10);
    } else {
      console.log('No active modal to close');
    }
  },

  getContainer() {
    return activeModal;
  }
};
