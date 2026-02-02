import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatsGrid } from '../components/StatsGrid.js';
import { TaskTable } from '../components/TaskTable.js';
import { store } from '../state/store.js';

export function MyTasksView() {
    const body = document.createElement('div');
    body.classList.add('dashboard-layout');

    body.appendChild(Sidebar());

    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content', 'dark-bg');

    mainContent.appendChild(Topbar());

    const content = document.createElement('main');
    content.classList.add('content');

    content.appendChild(PageHeader('Task Management', 'Organize and track all your tasks', true));

    // Stats
    const state = store.getState();
    const currentUser = store.getUser();
    const allTasks = state.tasks || [];
    
    // Filter tasks to show only user's own tasks (unless admin)
    const userTasks = currentUser && currentUser.role === 'admin' 
        ? allTasks.filter(t => t.status !== 'annulled')  // Admin sees all non-annulled tasks
        : allTasks.filter(t => t.userId === currentUser.id && t.status !== 'annulled');  // Users see only their own
    
    const stats = calculateTaskStats(userTasks);
    content.appendChild(StatsGrid(stats));

    // Table
    content.appendChild(TaskTable(userTasks, handleStatusChange, handleDelete, handleViewTask));

    // Add "New Task" button handler
    setTimeout(() => {
        const newTaskBtn = content.querySelector('#new-task-btn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => {
                showNewTaskModal();
            });
        }
    }, 0);

    mainContent.appendChild(content);
    body.appendChild(mainContent);

    // Subscribe to store updates
    const unsubscribe = store.subscribe(() => {
        // Re-render stats and table when state changes
        const state = store.getState();
        const tasks = state.tasks || [];
        const userTasks = currentUser.role === 'admin' ? tasks : tasks.filter(t => t.userId === currentUser.id);
        
        // Update stats
        const stats = calculateTaskStats(userTasks);
        const statsGrid = body.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon">🔴</div>
                    <div class="stat-value">${stats.high}</div>
                    <div class="stat-label">High Priority</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🟡</div>
                    <div class="stat-value">${stats.medium}</div>
                    <div class="stat-label">Medium Priority</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🟢</div>
                    <div class="stat-value">${stats.low}</div>
                    <div class="stat-label">Low Priority</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${stats.completed}</div>
                    <div class="stat-label">Completed</div>
                </div>
            `;
        }
        
        // Update task table
        const tableBody = body.querySelector('.task-list tbody');
        if (tableBody) {
            renderTaskRows(tableBody, userTasks);
        }
    });

    // Show admin menu if user is admin
    updateAdminMenu();

    return body;
}

function calculateTaskStats(tasks) {
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    return [
        {
            label: 'High Priority',
            value: highPriority,
            iconColor: 'red',
            iconSvg: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `,
            footer: null
        },
        {
            label: 'Medium Priority',
            value: mediumPriority,
            iconColor: 'orange',
            iconSvg: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v20M17 7l-5 5-5-5"></path>
                </svg>
            `,
            footer: null
        },
        {
            label: 'Low Priority',
            value: lowPriority,
            iconColor: 'blue',
            iconSvg: `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22v-20M7 17l5-5 5 5"></path>
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
    const state = store.getState();
    const task = state.tasks.find(t => t.id === taskId);
    
    if (!task) {
        alert('Task not found');
        return;
    }
    
    showTaskDetailsModal(task);
}

function showTaskDetailsModal(task) {
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
                <h2>Task Details</h2>
                <button class="modal-close" id="close-modal">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form id="edit-task-form">
                <div class="form-group">
                    <label class="form-label" for="edit-task-title">Title</label>
                    <input type="text" id="edit-task-title" class="form-input" value="${task.title}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-task-description">Description</label>
                    <textarea id="edit-task-description" class="form-input" rows="3">${task.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-task-priority">Priority</label>
                    <select id="edit-task-priority" class="form-select" required>
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-task-status">Status</label>
                    <select id="edit-task-status" class="form-select" required>
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="blocked" ${task.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="edit-task-duedate">Due Date</label>
                    <input type="date" id="edit-task-duedate" class="form-input" value="${task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}" required>
                </div>
                
                <div style="padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #6b7280;">
                    <div style="margin-bottom: 8px;"><strong>Created:</strong> ${new Date(task.createdAt).toLocaleString()}</div>
                    <div><strong>Last Updated:</strong> ${new Date(task.updatedAt).toLocaleString()}</div>
                </div>
                
                <p id="edit-task-error" class="form-error" style="display:none;color:red;"></p>
            </form>
            <div class="modal-actions">
                <button type="button" class="btn-secondary" id="cancel-edit-btn">Cancel</button>
                <button type="submit" class="btn-primary" id="submit-edit-btn">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#close-modal');
    const cancelBtn = modal.querySelector('#cancel-edit-btn');
    
    const closeModal = () => {
        modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    const form = modal.querySelector('#edit-task-form');
    const submitBtn = modal.querySelector('#submit-edit-btn');
    const errorMsg = modal.querySelector('#edit-task-error');

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const title = form.querySelector('#edit-task-title').value;
        const description = form.querySelector('#edit-task-description').value;
        const priority = form.querySelector('#edit-task-priority').value;
        const status = form.querySelector('#edit-task-status').value;
        const dueDate = form.querySelector('#edit-task-duedate').value;

        try {
            const taskData = {
                title,
                description,
                priority,
                status,
                dueDate: new Date(dueDate).toISOString()
            };

            const taskService = await import('../services/taskService.js');
            await taskService.default.updateTask(task.id, taskData);
            await store.loadTasks();
            
            closeModal();
            console.log('Task updated successfully');
            window.location.hash = '#/tasks';
        } catch (error) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || 'Failed to update task';
        }
    });
}

function showNewTaskModal() {
    // Check if modal already exists
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        return; // Don't create another modal
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Create New Task</h2>
                <button class="modal-close" id="close-modal">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form id="new-task-form">
                <div class="form-group">
                    <label class="form-label" for="task-title">Title</label>
                    <input type="text" id="task-title" class="form-input" placeholder="Task title" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="task-description">Description</label>
                    <textarea id="task-description" class="form-input" placeholder="Task description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="task-priority">Priority</label>
                    <select id="task-priority" class="form-select" required>
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="task-duedate">Due Date</label>
                    <input type="date" id="task-duedate" class="form-input" required>
                </div>
                <p id="task-error" class="form-error" style="display:none;color:red;"></p>
            </form>
            <div class="modal-actions">
                <button type="button" class="btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" class="btn-primary" id="submit-btn">Create Task</button>
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
    const form = modal.querySelector('#new-task-form');
    const submitBtn = modal.querySelector('#submit-btn');
    const errorMsg = modal.querySelector('#task-error');

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const title = form.querySelector('#task-title').value;
        const description = form.querySelector('#task-description').value;
        const priority = form.querySelector('#task-priority').value;
        const dueDate = form.querySelector('#task-duedate').value;

        try {
            const user = store.getUser();
            if (!user) {
                throw new Error('User not logged in');
            }

            const taskData = {
                title,
                description,
                priority,
                dueDate: new Date(dueDate).toISOString()
            };

            await store.createTask(taskData, user.id);
            closeModal();
            console.log('Task created successfully');
        } catch (error) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || 'Failed to create task';
        }
    });

    // Set minimum date to today
    const dueDateInput = form.querySelector('#task-duedate');
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.setAttribute('min', today);
    dueDateInput.value = today;
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
