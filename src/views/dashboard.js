import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatsGrid } from '../components/StatsGrid.js';
import { store } from '../state/store.js';
import { formatDate } from '../utils/taksHelper.js';

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DashboardView() {
    const body = document.createElement('div');
    body.classList.add('dashboard-layout');

    body.appendChild(Sidebar());

    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content', 'light-bg');

    mainContent.appendChild(Topbar());

    const content = document.createElement('main');
    content.classList.add('content');

    // Header
    content.appendChild(PageHeader('Dashboard Overview', 'Track your task performance and progress', false));

    // Stats
    const state = store.getState();
    const currentUser = store.getUser();
    const allTasks = state.tasks || [];
    
    const stats = calculateDashboardStats(allTasks);
    content.appendChild(StatsGrid(stats));

    // Filter buttons
    const filterContainer = document.createElement('div');
    filterContainer.style.cssText = 'margin: 24px 0; display: flex; gap: 12px; flex-wrap: wrap;';
    
    const filters = [
        { label: 'All Tasks', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' }
    ];
    
    // Add 'Annulled' filter only for admin
    if (currentUser && currentUser.role === 'admin') {
        filters.push({ label: 'Annulled', value: 'annulled' });
    }
    
    let currentFilter = 'all';
    
    filters.forEach(filter => {
        const btn = document.createElement('button');
        btn.textContent = filter.label;
        btn.classList.add('filter-btn');
        if (filter.value === 'all') btn.classList.add('active');
        btn.dataset.filter = filter.value;
        btn.addEventListener('click', () => {
            // Update active button
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = filter.value;
            
            // Filter tasks and re-render table
            const filteredTasks = filterTasks(allTasks, currentFilter);
            const tableContainer = content.querySelector('.task-table-container');
            if (tableContainer) {
                tableContainer.remove();
            }
            content.appendChild(createTaskTable(filteredTasks, currentUser));
        });
        filterContainer.appendChild(btn);
    });
    
    content.appendChild(filterContainer);

    // Table - show all tasks with initial filter
    const initialTasks = filterTasks(allTasks, currentFilter);
    content.appendChild(createTaskTable(initialTasks, currentUser));

    mainContent.appendChild(content);
    body.appendChild(mainContent);

    // Subscribe to store updates
    const unsubscribe = store.subscribe(() => {
        // Re-render stats and table when state changes
        const state = store.getState();
        const allTasks = state.tasks || [];
        
        // Update stats
        const stats = {
            total: allTasks.filter(t => t.status !== 'annulled').length,
            completed: allTasks.filter(t => t.status === 'completed').length,
            inProgress: allTasks.filter(t => t.status === 'in_progress').length,
            pending: allTasks.filter(t => t.status === 'pending').length,
            annulled: allTasks.filter(t => t.status === 'annulled').length
        };
        
        const statsGrid = body.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">📋</div>
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${stats.completed}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-value">${stats.inProgress}</div>
                    <div class="stat-label">In Progress</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${stats.pending}</div>
                    <div class="stat-label">Pending</div>
                </div>
                ${currentUser.role === 'admin' ? `
                <div class="stat-card">
                    <div class="stat-icon">🚫</div>
                    <div class="stat-value">${stats.annulled}</div>
                    <div class="stat-label">Annulled</div>
                </div>
                ` : ''}
            `;
        }
        
        // Update task table based on current filter
        const activeFilterBtn = body.querySelector('.filter-btn.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
        let filteredTasks = allTasks;
        
        if (activeFilter !== 'all') {
            filteredTasks = allTasks.filter(task => task.status === activeFilter);
        }
        
        const tableBody = body.querySelector('.task-list tbody');
        if (tableBody) {
            renderTaskRows(tableBody, filteredTasks);
        }
    });

    // Show admin menu if user is admin
    updateAdminMenu();

    return body;
}

function filterTasks(tasks, filter) {
    if (filter === 'all') {
        return tasks.filter(t => t.status !== 'annulled');
    } else if (filter === 'annulled') {
        return tasks.filter(t => t.status === 'annulled');
    } else {
        return tasks.filter(t => t.status === filter);
    }
}

function createTaskTable(tasks, currentUser) {
    const container = document.createElement('div');
    container.classList.add('task-table-container', 'table-container');

    container.innerHTML = `
        <div class="table-header">
            <input type="text" class="search-bar search-bar-wide" id="task-search" placeholder="Search by title, description...">
        </div>

        <table>
            <thead>
                <tr>
                    <th>TASK NAME</th>
                    <th>ASSIGNED TO</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DUE DATE</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody id="task-tbody">
                ${renderTasks(tasks, currentUser)}
            </tbody>
        </table>

        <div class="table-footer">
            <span>Showing ${tasks.length} task${tasks.length !== 1 ? 's' : ''}</span>
        </div>
    `;

    // Search functionality
    const searchInput = container.querySelector('#task-search');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tbody = container.querySelector('#task-tbody');
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
        tbody.innerHTML = renderTasks(filteredTasks, currentUser);
        attachEventListeners(tbody, currentUser);
    });

    // Attach event listeners to buttons
    const tbody = container.querySelector('#task-tbody');
    attachEventListeners(tbody, currentUser);

    return container;
}

function renderTasks(tasks, currentUser) {
    if (tasks.length === 0) {
        return `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <p style="color: #6b7280;">No tasks found</p>
                </td>
            </tr>
        `;
    }

    return tasks.map(task => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const statusCell = isAdmin ? 
            `<select class="status-select" data-task-id="${task.id}">
                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="blocked" ${task.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                <option value="annulled" ${task.status === 'annulled' ? 'selected' : ''}>Annulled</option>
            </select>` :
            `<span class="status-badge status-${task.status}">${capitalizeFirst(task.status.replace('_', ' '))}</span>`;
        
        return `
        <tr data-task-id="${task.id}">
            <td>
                <div class="task-title">${task.title}</div>
                <div class="task-meta">${task.description || 'No description'}</div>
            </td>
            <td>
                <span class="user-badge">${task.userId || 'Unassigned'}</span>
            </td>
            <td>
                <div class="priority">
                    <span class="priority-dot ${task.priority}"></span>
                    <span>${capitalizeFirst(task.priority)}</span>
                </div>
            </td>
            <td>${statusCell}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td>
                <div class="actions">
                    <button class="action-btn view btn-view" data-task-id="${task.id}" title="View task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    ${isAdmin ? `
                    <button class="action-btn delete btn-delete" data-task-id="${task.id}" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>` : ''}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function attachEventListeners(tbody, currentUser) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    // Status change listeners (admin only)
    if (isAdmin) {
        const statusSelects = tbody.querySelectorAll('.status-select');
        statusSelects.forEach(select => {
            select.addEventListener('change', async (e) => {
                const taskId = e.target.dataset.taskId;
                const newStatus = e.target.value;
                await handleStatusChange(taskId, newStatus);
            });
        });

        // Delete button listeners (admin only)
        const deleteButtons = tbody.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const taskId = e.currentTarget.dataset.taskId;
                if (confirm('Are you sure you want to delete this task?')) {
                    await handleDelete(taskId);
                }
            });
        });
    }

    // View button listeners (all users)
    const viewButtons = tbody.querySelectorAll('.btn-view');
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.taskId;
            handleViewTask(taskId);
        });
    });
}

function calculateDashboardStats(tasks) {
    const activeTasks = tasks.filter(t => t.status !== 'annulled');
    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = activeTasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = activeTasks.filter(t => t.status === 'pending').length;
    
    return [
        {
            label: 'Total Tasks',
            value: totalTasks,
            iconColor: 'blue',
            iconSvg: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
            `,
            footer: null
        },
        {
            label: 'Completed',
            value: completedTasks,
            iconColor: 'green',
            iconSvg: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            `,
            footer: totalTasks > 0 ? {
                type: 'positive',
                content: `${Math.round((completedTasks / totalTasks) * 100)}% completion rate`
            } : null
        },
        {
            label: 'In Progress',
            value: inProgressTasks,
            iconColor: 'orange',
            iconSvg: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            `,
            footer: null
        },
        {
            label: 'Pending',
            value: pendingTasks,
            iconColor: 'red',
            iconSvg: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `,
            footer: null
        }
    ];
}

async function handleStatusChange(taskId, newStatus) {
    try {
        await store.updateTaskStatus(taskId, newStatus);
        console.log(`Task ${taskId} status updated to ${newStatus}`);
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('Failed to update task status');
    }
}

async function handleDelete(taskId) {
    try {
        const taskService = await import('../services/taskService.js');
        await taskService.default.deleteTask(taskId);
        await store.loadTasks();
        console.log(`Task ${taskId} deleted`);
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

function handleViewTask(taskId) {
    // Redirect to tasks page with view functionality
    window.location.hash = '#/tasks';
    setTimeout(() => {
        // Try to find and trigger the view for this task
        const viewBtn = document.querySelector(`[data-task-id="${taskId}"].btn-view`);
        if (viewBtn) {
            viewBtn.click();
        }
    }, 500);
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
