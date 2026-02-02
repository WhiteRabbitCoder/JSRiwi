export function PageHeader(title, subtitle, showButton = false) {
    const header = document.createElement('div');
    header.classList.add('page-header');

    header.innerHTML = `
        <div>
            <h1 class="page-title">${title}</h1>
            <p class="page-subtitle">${subtitle}</p>
        </div>
        ${showButton ? `
            <button class="btn-new-task" id="new-task-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Task</span>
            </button>
        ` : ''}
    `;

    return header;
}
