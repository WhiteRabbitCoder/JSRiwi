import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { store } from '../state/store.js';
import userService from '../services/userService.js';

export function AdminUsersView() {
    const body = document.createElement('div');
    body.classList.add('dashboard-layout');

    body.appendChild(Sidebar());

    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content', 'light-bg');

    mainContent.appendChild(Topbar());

    const content = document.createElement('main');
    content.classList.add('content');

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Users Management</h1>
                <p class="page-subtitle">Manage system users and their roles</p>
            </div>
            <button class="btn-new-task" id="create-user-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create New User
            </button>
        </div>

        <div class="table-container">
            <div class="table-header">
                <input type="text" class="search-bar search-bar-wide" id="user-search" placeholder="Search by name, email...">
            </div>

            <table>
                <thead>
                    <tr>
                        <th>USER</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                        <th>DEPARTMENT</th>
                        <th>ROLE</th>
                        <th>STATUS</th>
                        <th>JOINED</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody id="users-tbody">
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px;">
                            <p style="color: #6b7280;">Loading users...</p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="table-footer">
                <span id="user-count">Loading...</span>
            </div>
        </div>
    `;

    // Load users (Initial)
    // Load users (Initial)
    loadUsers(content);

    // Attach button listeners
    attachGlobalListeners(content);

    // Subscribe to store for sidebar updates and potential future user state integrations
    const unsubscribe = store.subscribe(() => {
        updateAdminMenu(body);
        // Could also reload users if we integrated user list into store
    });

    // Cleanup
    const originalRemove = body.remove.bind(body);
    body.remove = () => {
        unsubscribe();
        originalRemove();
    };

    mainContent.appendChild(content);
    body.appendChild(mainContent);

    // Initial check
    updateAdminMenu(body);

    return body;
}

function updateAdminMenu(context = document) {
    const user = store.getUser();
    if (user && user.role === 'admin') {
        const safeQuery = (selector) =>
            (context.querySelector ? context.querySelector(selector) : document.querySelector(selector));

        const usersNav = safeQuery('#admin-users-nav');
        const annulledNav = safeQuery('#admin-annulled-nav');

        if (usersNav) usersNav.style.display = 'block';
        if (annulledNav) annulledNav.style.display = 'block';
    }
}

async function loadUsers(content) {
    try {
        const users = await userService.getUsers();
        const tbody = content.querySelector('#users-tbody');
        const countSpan = content.querySelector('#user-count');
        const searchInput = content.querySelector('#user-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        // Filter users
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );

        if (filteredUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <p style="color: #6b7280;">No users found</p>
                    </td>
                </tr>
            `;
            countSpan.textContent = 'Showing 0 users';
            return;
        }

        tbody.innerHTML = filteredUsers.map(user => `
            <tr data-user-id="${user.id}" style="opacity: ${user.status === 'annulled' ? 0.5 : 1}">
                <td>
                    <div class="task-title">${user.name}${user.status === 'annulled' ? ' (ANNULLED)' : ''}</div>
                    <div class="task-meta">ID: ${user.id.substring(0, 8).toUpperCase()}</div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                    <span class="category-badge">${user.department || 'N/A'}</span>
                </td>
                <td>
                    <span class="status-badge ${user.role === 'admin' ? 'in-progress' : 'completed'}">
                        ${user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${user.status === 'annulled' ? 'pending' : 'completed'}">
                        ${user.status === 'annulled' ? 'Annulled' : 'Active'}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        ${user.status !== 'annulled' ? `
                            <button class="action-btn delete btn-annul-user" data-user-id="${user.id}" title="Annul user">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                            </button>
                        ` : '<span style="color: #9ca3af;">Annulled</span>'}
                    </div>
                </td>
            </tr>
        `).join('');

        countSpan.textContent = `Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`;

        // Attach event listeners
        const annulButtons = tbody.querySelectorAll('.btn-annul-user');
        annulButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.currentTarget.dataset.userId;
                if (confirm('Are you sure you want to annul this user? This action cannot be undone.')) {
                    try {
                        await userService.deleteUser(userId);
                        loadUsers(content);
                    } catch (error) {
                        alert('Failed to annul user: ' + error.message);
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error loading users:', error);
        const tbody = content.querySelector('#users-tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <p style="color: #ef4444;">Error loading users</p>
                </td>
            </tr>
        `;
    }
}

// Helper to attach listeners after initial render
function attachGlobalListeners(content) {
    const createBtn = content.querySelector('#create-user-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            showCreateUserModal();
        });
    }
}

function showCreateUserModal() {
    // Check if modal already exists
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        return;
    }

    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New User</h2>
                <button class="modal-close" id="close-modal">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form id="create-user-form">
                <div class="form-group">
                    <label class="form-label" for="user-name">Full Name</label>
                    <input type="text" id="user-name" class="form-input" placeholder="Enter full name" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="user-email">Email</label>
                    <input type="email" id="user-email" class="form-input" placeholder="user@example.com" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="user-phone">Phone Number</label>
                    <input type="tel" id="user-phone" class="form-input" placeholder="555-0123" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="user-department">Department</label>
                    <select id="user-department" class="form-select" required>
                        <option value="">Select a department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Administrative">Administrative</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Support">Support</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="user-role">Role</label>
                    <select id="user-role" class="form-select" required>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="user-password">Password</label>
                    <input type="password" id="user-password" class="form-input" placeholder="Enter password" required minlength="6">
                </div>
                <p id="user-error" class="form-error" style="display:none;color:red;"></p>
            </form>
            <div class="modal-actions">
                <button type="button" class="btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" class="btn-primary" id="submit-btn">Create User</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    const closeBtn = modal.querySelector('#close-modal');
    const cancelBtn = modal.querySelector('#cancel-btn');

    const closeModal = () => {
        modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    const form = modal.querySelector('#create-user-form');
    const submitBtn = modal.querySelector('#submit-btn');
    const errorMsg = modal.querySelector('#user-error');

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const name = form.querySelector('#user-name').value;
        const email = form.querySelector('#user-email').value;
        const phone = form.querySelector('#user-phone').value;
        const department = form.querySelector('#user-department').value;
        const role = form.querySelector('#user-role').value;
        const password = form.querySelector('#user-password').value;

        try {
            const userData = {
                name,
                email,
                phone,
                department,
                role,
                password,
                status: 'active',
                createdAt: new Date().toISOString()
            };

            // Direct fetch to create user
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to create user');
            }

            closeModal();
            alert('User created successfully!');
            window.location.hash = '#/admin/users';
        } catch (error) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || 'Failed to create user';
        }
    });
}
