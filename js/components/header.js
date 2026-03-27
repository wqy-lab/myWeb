// Header component

export const Header = {
  render(pageTitle, actions = []) {
    return `
      <header class="header">
        <h1 class="page-title">${pageTitle}</h1>
        <div class="header-actions">
          ${actions.map(action => `
            <button class="btn btn-${action.type || 'secondary'}" data-action="${action.action}">
              ${action.icon ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${action.icon}"/></svg>` : ''}
              ${action.label}
            </button>
          `).join('')}
        </div>
      </header>
    `;
  }
};
