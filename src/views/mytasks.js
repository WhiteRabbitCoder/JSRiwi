import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatsGrid } from '../components/StatsGrid.js';
import { TaskTable } from '../components/TaskTable.js';
import { store } from '../state/store.js';
import userService from '../services/userService.js';

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

    // Containers for Stats and Table (to update them dynamically)
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container-wrapper';
    content.appendChild(statsContainer);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container-wrapper';
    content.appendChild(tableContainer);

    // Add "New Task" button handler (Event delegation is safer here)
    content.addEventListener('click', (e) => {
        if (e.target.closest('#new-task-btn')) {
            showNewTaskModal();
        }
    });

    mainContent.appendChild(content);
    body.appendChild(mainContent);

    // =========================================================
    // CENTRALIZED RENDERING FUNCTION
    // =========================================================
    const render = () => {
        // Security validation: If the view is no longer in the DOM, stop
        // (Although we handle unsubscribe, this is a double protection)

        const state = store.getState();
        // IMPORTANT: Request FRESH user from store, don't use an old closed variable
        const currentUser = store.getUser();

        // 3. UPDATE SIDEBAR: Check permissions when user data arrives
        updateAdminMenu(body);

        if (!currentUser) return; // Waiting for data...

        const allTasks = state.tasks || [];

        // Robust filtering logic
        const userTasks = allTasks.filter(t => {
            // Protection against corrupt/null tasks in the array
            if (!t) return false;

            // If admin: sees everything except annulled
            if (currentUser.role === 'admin') {
                return t.status !== 'annulled';
            }
            // If user: sees only their own and not annulled
            return t.userId === currentUser.id && t.status !== 'annulled';
        });

        // 1. Update Stats
        const stats = calculateTaskStats(userTasks);
        statsContainer.innerHTML = '';
        statsContainer.appendChild(StatsGrid(stats));

        // 2. Update Table
        tableContainer.innerHTML = '';
        // If no tasks and loading, show spinner
        if (state.loading && userTasks.length === 0) {
            tableContainer.innerHTML = '<div style="padding:20px; text-align:center">Loading tasks...</div>';
        } else {
            tableContainer.appendChild(TaskTable(userTasks, handleStatusChange, handleDelete, handleViewTask));
        }
    };

    // Initial render immediately
    render();

    // Subscribe to changes
    const unsubscribe = store.subscribe(render);

    // Monkey-patch remove to clean up subscription when navigating away
    const originalRemove = body.remove.bind(body);
    body.remove = () => {
        unsubscribe(); // Stop listening to changes
        originalRemove();
    };

    // Show admin menu if user is admin (Side effect)
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
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
            footer: null
        },
        {
            label: 'Medium Priority',
            value: mediumPriority,
            iconColor: 'orange',
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 7l-5 5-5-5"></path></svg>`,
            footer: null
        },
        {
            label: 'Low Priority',
            value: lowPriority,
            iconColor: 'blue',
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-20M7 17l5-5 5 5"></path></svg>`,
            footer: null
        },
        {
            label: 'Completed',
            value: completedTasks,
            iconColor: 'green',
            iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            footer: null
        }
    ];
}

async function handleStatusChange(taskId, newStatus) {
    try {
        await store.updateTaskStatus(taskId, newStatus);
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('Failed to update task status');
    }
}

async function handleDelete(taskId) {
    try {
        // Soft delete via Store method if available, strictly speaking we should use annullment
        // Assuming store.updateTaskStatus to 'annulled' is the "delete" logic based on previous context
        await store.updateTaskStatus(taskId, 'annulled');
        console.log(`Task ${taskId} annulled`);
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

async function showTaskDetailsModal(task) {
    // Check if modal already exists
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        return;
    }

    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');

    const categoriesOptions = `
        <option value="Design">Design</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Engineering">Engineering</option>
        <option value="Optimization">Optimization</option>
        <option value="Marketing">Marketing</option>
        <option value="Development">Development</option>
        <option value="Other">Other</option>
    `;

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
                    <label class="form-label" for="edit-task-category">Category</label>
                    <select id="edit-task-category" class="form-select" required>
                        ${categoriesOptions}
                    </select>
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

                <div class="form-group" id="edit-assign-to-group" style="display: none;">
                    <label class="form-label" for="edit-task-assign-to">Assigned To</label>
                    <select id="edit-task-assign-to" class="form-select">
                        <option value="">-- Orphan Task --</option>
                    </select>
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

    // Set existing category (must be done after append or on the element specifically)
    if (task.category) {
        const categorySelect = modal.querySelector('#edit-task-category');
        if (categorySelect) categorySelect.value = task.category;
    }

    // Handle Admin Assignment Logic for Edit
    const currentUser = store.getUser();
    if (currentUser && currentUser.role === 'admin') {
        const assignGroup = modal.querySelector('#edit-assign-to-group');
        const assignSelect = modal.querySelector('#edit-task-assign-to');
        assignGroup.style.display = 'block';

        try {
            const users = await userService.getUsers();
            const validUsers = users.filter(u => u.status !== 'annulled');

            validUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.email})`;
                assignSelect.appendChild(option);
            });

            // Set current assigned user
            if (task.userId) {
                assignSelect.value = task.userId;
            } else {
                assignSelect.value = ""; // Orphan
            }

        } catch (err) {
            console.error('Failed to load users for assignment', err);
        }
    }

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
        const category = form.querySelector('#edit-task-category').value;
        const priority = form.querySelector('#edit-task-priority').value;
        const status = form.querySelector('#edit-task-status').value;
        const dueDate = form.querySelector('#edit-task-duedate').value;

        try {
            const taskData = {
                title,
                description,
                category,
                priority,
                status,
                dueDate: new Date(dueDate).toISOString()
            };

            // Use store helpers to maintain state sync
            await store.updateTaskDetails(task.id, taskData);
            // If status changes, use the specific helper or this general one if it works with backend
            if (status !== task.status) await store.updateTaskStatus(task.id, status);
            if (priority !== task.priority) await store.updateTaskPriority(task.id, priority);

            // Handle Re-assignment if changed (Admin only)
            if (currentUser && currentUser.role === 'admin') {
                const newAssigneeId = form.querySelector('#edit-task-assign-to').value;
                // Convert empty string to null for comparison/update
                const normalizedNewId = newAssigneeId === "" ? null : newAssigneeId;
                const normalizedCurrentId = task.userId || null;

                if (normalizedNewId !== normalizedCurrentId) {
                    await store.assignTaskToUser(task.id, normalizedNewId);
                }
            }

            closeModal();
            console.log('Task updated successfully');
        } catch (error) {
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || 'Failed to update task';
        }
    });
}
async function showNewTaskModal() {
    // Check if modal already exists
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        return; // Don't create another modal
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');

    // Import categories safely
    const categoriesOptions = `
        <option value="Design">Design</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Engineering">Engineering</option>
        <option value="Optimization">Optimization</option>
        <option value="Marketing">Marketing</option>
        <option value="Development">Development</option>
        <option value="Other">Other</option>
    `;

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
                    <label class="form-label" for="task-category">Category</label>
                    <select id="task-category" class="form-select" required>
                        ${categoriesOptions}
                    </select>
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
                
                <div class="form-group" id="assign-to-group" style="display: none;">
                    <label class="form-label" for="task-assign-to">Assign To (Optional)</label>
                    <select id="task-assign-to" class="form-select">
                        <option value="">-- Orphan Task (No User) --</option>
                    </select>
                    <small style="color: #6b7280; display: block; margin-top: 4px;">Leave empty to create an orphan task (Admin only)</small>
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

    // Set minimum date to today
    const dueDateInput = form.querySelector('#task-duedate');
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.setAttribute('min', today);
    dueDateInput.value = today;

    // Check if Admin to show assignment options
    const currentUser = store.getUser();
    if (currentUser && currentUser.role === 'admin') {
        const assignGroup = form.querySelector('#assign-to-group');
        const assignSelect = form.querySelector('#task-assign-to');
        assignGroup.style.display = 'block';

        // Load users for dropdown
        try {
            const users = await userService.getUsers();
            const validUsers = users.filter(u => u.status !== 'annulled');

            validUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.email})`;
                assignSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Failed to load users for assignment', err);
        }
    }

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const title = form.querySelector('#task-title').value;
        const description = form.querySelector('#task-description').value;
        const category = form.querySelector('#task-category').value;
        const priority = form.querySelector('#task-priority').value;
        const dueDate = form.querySelector('#task-duedate').value;

        try {
            const currentUser = store.getUser();
            if (!currentUser) throw new Error("User not found");

            let assignedUserId = currentUser.id; // Default: assign to self

            if (currentUser.role === 'admin') {
                const selectedUser = form.querySelector('#task-assign-to').value;
                if (selectedUser) {
                    assignedUserId = selectedUser;
                } else {
                    assignedUserId = null; // Orphan task
                }
            }

            const taskData = {
                title,
                description,
                category,
                priority,
                dueDate: new Date(dueDate).toISOString()
            };

            await store.createTask(taskData, assignedUserId);
            closeModal();
            console.log('Task created successfully');
        } catch (error) {
            console.error("Task creation failed:", error);
            errorMsg.style.display = 'block';
            errorMsg.textContent = error.message || 'Failed to create task';
        }
    });
}
function updateAdminMenu(context = document) {
    const user = store.getUser(); // SIEMPRE pedir usuario fresco
    if (user && user.role === 'admin') {
        // Buscamos dentro del contexto (body) si se provee, o en document
        const safeQuery = (selector) =>
            (context.querySelector ? context.querySelector(selector) : document.querySelector(selector));

        const usersNav = safeQuery('#admin-users-nav');
        const annulledNav = safeQuery('#admin-annulled-nav');

        // Estado deseado
        const displayStyle = 'block';

        // Apply to both menu elements
        if (usersNav) usersNav.style.display = displayStyle;
        if (annulledNav) annulledNav.style.display = displayStyle;
    }
}
