import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { store } from '../state/store.js';

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

    // Get user tasks count
    const state = store.getState();
    const userTasks = (state.tasks || []).filter(t => t.userId === user.id && t.status !== 'annulled');
    const taskCount = userTasks.length;

    // Format role badge
    const roleBadge = user.role === 'admin' ? 'System Admin' : 'User';
    const roleClass = user.role === 'admin' ? 'pill--blue' : 'pill--green';

    content.innerHTML = `
        <header class="profile-header">
            <h1>My Profile</h1>
        </header>

        <section class="profile-layout">
            <article class="profile-card">
                <div class="profile-card__cover"></div>
                <div class="profile-card__body">
                    <div class="profile-card__avatar"></div>
                    <h2>${user.name || 'User'}</h2>
                    <span class="profile-card__badge">${roleBadge}</span>
                    <div class="profile-card__email">
                        <span class="email-icon">✉</span>
                        ${user.email}
                    </div>
                    <div class="profile-card__divider"></div>
                    <div class="profile-card__stat">
                        <div class="profile-card__stat-value">${taskCount}</div>
                        <div class="profile-card__stat-label">Tasks</div>
                    </div>
                </div>
            </article>

            <article class="info-card" id="info-card">
                <div class="info-card__header">
                    <h3>Personal Information</h3>
                    <button class="button-secondary button-secondary--icon" type="button" id="edit-btn">
                        ✎ Edit Profile
                    </button>
                </div>
                <div class="info-grid" id="info-display">
                    <div>
                        <div class="info-label">Full Name</div>
                        <div class="info-value">${user.name || 'N/A'}</div>
                    </div>
                    <div>
                        <div class="info-label">User ID</div>
                        <div class="info-value">CZ-${user.id.substring(0, 6).toUpperCase()}</div>
                    </div>
                    <div>
                        <div class="info-label">Phone</div>
                        <div class="info-value">${user.phone || 'N/A'}</div>
                    </div>
                    <div>
                        <div class="info-label">Department</div>
                        <div class="info-value">
                            <span class="pill pill--amber">${user.department || 'N/A'}</span>
                        </div>
                    </div>
                    <div>
                        <div class="info-label">Role Level</div>
                        <div class="info-value">${user.role === 'admin' ? 'System Administrator' : 'Standard User'}</div>
                    </div>
                    <div>
                        <div class="info-label">Join Date</div>
                        <div class="info-value">${new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>

                <form id="info-edit" style="display: none;">
                    <div class="info-grid">
                        <div>
                            <div class="info-label">Full Name</div>
                            <input type="text" class="form-input" id="edit-name" value="${user.name || ''}" required>
                        </div>
                        <div>
                            <div class="info-label">User ID</div>
                            <div class="info-value">CZ-${user.id.substring(0, 6).toUpperCase()}</div>
                        </div>
                        <div>
                            <div class="info-label">Phone</div>
                            <input type="tel" class="form-input" id="edit-phone" value="${user.phone || ''}" required>
                        </div>
                        <div>
                            <div class="info-label">Department</div>
                            <div class="info-value">
                                <span class="pill pill--amber">${user.department || 'N/A'}</span>
                            </div>
                        </div>
                        <div>
                            <div class="info-label">Role Level</div>
                            <div class="info-value">${user.role === 'admin' ? 'System Administrator' : 'Standard User'}</div>
                        </div>
                        <div>
                            <div class="info-label">Join Date</div>
                            <div class="info-value">${new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>
                    
                    <div id="profile-error" style="display: none; color: #ef4444; padding: 12px; background: #fee2e2; border-radius: 8px; margin-top: 20px;"></div>
                    <div id="profile-success" style="display: none; color: #10b981; padding: 12px; background: #d1fae5; border-radius: 8px; margin-top: 20px;"></div>
                    
                    <div class="edit-actions">
                        <button type="button" class="btn-cancel" id="cancel-edit-btn">Cancel</button>
                        <button type="submit" class="btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </article>
        </section>
    `;

    // Handle edit mode toggle
    setTimeout(() => {
        const editBtn = content.querySelector('#edit-btn');
        const infoDisplay = content.querySelector('#info-display');
        const infoEdit = content.querySelector('#info-edit');
        const cancelEditBtn = content.querySelector('#cancel-edit-btn');
        const form = content.querySelector('#info-edit');
        const errorMsg = content.querySelector('#profile-error');
        const successMsg = content.querySelector('#profile-success');

        editBtn.addEventListener('click', () => {
            infoDisplay.style.display = 'none';
            infoEdit.style.display = 'block';
            editBtn.style.display = 'none';
        });

        cancelEditBtn.addEventListener('click', () => {
            infoDisplay.style.display = 'grid';
            infoEdit.style.display = 'none';
            editBtn.style.display = 'inline-flex';
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';

            const name = form.querySelector('#edit-name').value;
            const phone = form.querySelector('#edit-phone').value;

            try {
                const response = await fetch(`http://localhost:3000/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, phone })
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile');
                }

                const updatedUser = await response.json();
                store.setUser(updatedUser);

                successMsg.textContent = 'Profile updated successfully!';
                successMsg.style.display = 'block';

                // Reload the view after a short delay
                setTimeout(() => {
                    window.location.hash = '#/profile';
                }, 1500);
            } catch (error) {
                errorMsg.textContent = error.message || 'Failed to update profile';
                errorMsg.style.display = 'block';
            }
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
