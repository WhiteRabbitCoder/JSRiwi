import { store } from '../state/store.js';

export function Topbar() {
    const header = document.createElement('header');
    header.classList.add('topbar');

    const user = store.getUser();
    const userName = user ? user.name : 'User Name';
    const userRole = user ? (user.role === 'admin' ? 'Admin' : 'User') : 'User';

    header.innerHTML = `
        <div class="breadcrumb">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>›</span>
            <span class="breadcrumb-current">Dashboard</span>
        </div>

        <div class="topbar-right">
            <span class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            </span>

            <div class="user-menu">
                <svg class="user-avatar" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <div class="user-info">
                    <div class="user-name">${userName}</div>
                    <div class="user-role">${userRole}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            <span class="logout-icon" id="logout-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
            </span>
        </div>
    `;

    // Add logout functionality
    const logoutBtn = header.querySelector('#logout-btn');
    logoutBtn.addEventListener('click', () => {
        store.logout();
        window.location.hash = '#/login';
    });

    return header;
}
