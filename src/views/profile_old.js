import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { store } from '../state/store.js';
import userService from '../services/userService.js';

export function ProfileView() {
    const body = document.createElement('div');
    body.classList.add('dashboard-layout');

    body.appendChild(Sidebar());

    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content', 'light-bg');

    mainContent.appendChild(Topbar());

    const content = document.createElement('main');
    content.classList.add('content');

    const user = store.getUser();
    if (!user) {
        content.innerHTML = '<p>Please log in to view your profile.</p>';
        mainContent.appendChild(content);
        body.appendChild(mainContent);
        return body;
    }

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">My Profile</h1>
                <p class="page-subtitle">Manage your personal information</p>
            </div>
        </div>

        <div style="max-width: 800px;">
            <div class="form-card">
                <form id="profile-form">
                    <div class="form-group">
                        <label class="form-label" for="profile-name">Full Name</label>
                        <input type="text" class="form-input" id="profile-name" value="${user.name || ''}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="profile-email">Email</label>
                        <input type="email" class="form-input" id="profile-email" value="${user.email || ''}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="profile-phone">Phone Number</label>
                        <input type="tel" class="form-input" id="profile-phone" value="${user.phone || ''}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Department</label>
                        <input type="text" class="form-input" value="${user.department || 'N/A'}" disabled style="background-color: #f9fafb; color: #6b7280;">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Role</label>
                        <input type="text" class="form-input" value="${user.role === 'admin' ? 'Administrator' : 'User'}" disabled style="background-color: #f9fafb; color: #6b7280;">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Member Since</label>
                        <input type="text" class="form-input" value="${new Date(user.createdAt).toLocaleDateString()}" disabled style="background-color: #f9fafb; color: #6b7280;">
                    </div>

                    <div class="stat-footer info" style="padding: 12px; background: #f0f9ff; border-radius: 8px; margin-bottom: 20px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        You can only modify your name, email, and phone number.
                    </div>

                    <div id="profile-error" style="display: none; color: #ef4444; padding: 12px; background: #fee2e2; border-radius: 8px; margin-bottom: 16px;"></div>
                    <div id="profile-success" style="display: none; color: #10b981; padding: 12px; background: #d1fae5; border-radius: 8px; margin-bottom: 16px;"></div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Handle form submission
    setTimeout(() => {
        const form = content.querySelector('#profile-form');
        const errorMsg = content.querySelector('#profile-error');
        const successMsg = content.querySelector('#profile-success');
        const cancelBtn = content.querySelector('#cancel-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';

            const name = form.querySelector('#profile-name').value;
            const email = form.querySelector('#profile-email').value;
            const phone = form.querySelector('#profile-phone').value;

            try {
                const response = await fetch(`http://localhost:3000/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, phone })
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile');
                }

                const updatedUser = await response.json();
                store.setUser(updatedUser);

                successMsg.textContent = 'Profile updated successfully!';
                successMsg.style.display = 'block';
            } catch (error) {
                errorMsg.textContent = error.message || 'Failed to update profile';
                errorMsg.style.display = 'block';
            }
        });

        cancelBtn.addEventListener('click', () => {
            window.location.hash = '#/dashboard';
        });
    }, 0);

    mainContent.appendChild(content);
    body.appendChild(mainContent);

    // Show admin menu if user is admin
    updateAdminMenu();

    return body;
}

function updateAdminMenu() {
    const user = store.getUser();
    if (user && user.role === 'admin') {
        const adminNav = document.querySelector('#admin-annulled-nav');
        if (adminNav) {
            adminNav.style.display = 'block';
        }
    }
}
