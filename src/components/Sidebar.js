export function Sidebar() {
    const aside = document.createElement('aside');
    aside.classList.add('sidebar');

    aside.innerHTML = `
        <div class="logo-container">
            <div class="logo">C</div>
            <div class="logo-text">CRUDZASO</div>
        </div>

        <ul class="nav-menu">
            <li class="nav-item">
                <a href="#/dashboard" class="nav-link">
                    <span class="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </span>
                    <span>Dashboard</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="#/tasks" class="nav-link">
                    <span class="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                    </span>
                    <span>My Tasks</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="#/profile" class="nav-link">
                    <span class="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </span>
                    <span>Profile</span>
                </a>
            </li>
            <li class="nav-item" id="admin-users-nav" style="display: none;">
                <a href="#/admin/users" class="nav-link">
                    <span class="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </span>
                    <span>Users</span>
                </a>
            </li>
            <li class="nav-item" id="admin-annulled-nav" style="display: none;">
                <a href="#/annulled" class="nav-link">
                    <span class="nav-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                        </svg>
                    </span>
                    <span>Annulled Tasks</span>
                </a>
            </li>
        </ul>
    `;

    // Add active class handling
    const links = aside.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Set initial active state based on current hash
    const currentHash = window.location.hash || '#/dashboard';
    links.forEach(link => {
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        }
    });

    return aside;
}
