export function TaskTable(tasks, onStatusChange, onDelete, onView) {
    const container = document.createElement('div');
    container.classList.add('table-container');

    container.innerHTML = `
        <div class="table-header">
            <input type="text" class="search-bar search-bar-wide" id="task-search" placeholder="Search by title, description...">
        </div>

        <table>
            <thead>
                <tr>
                    <th>TASK NAME</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>DUE DATE</th>
                    <th>ACTIONS</th>
                </tr>
            </thead>
            <tbody id="task-tbody">
                ${renderTasks(tasks)}
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
        tbody.innerHTML = renderTasks(filteredTasks);
        attachEventListeners(tbody, onStatusChange, onDelete, onView);
    });

    // Attach event listeners to buttons
    const tbody = container.querySelector('#task-tbody');
    attachEventListeners(tbody, onStatusChange, onDelete, onView);

    return container;
}

function renderTasks(tasks) {
    if (tasks.length === 0) {
        return `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <p style="color: #6b7280;">No tasks found</p>
                </td>
            </tr>
        `;
    }

    return tasks.map(task => `
        <tr data-task-id="${task.id}">
            <td>
                <div class="task-title">${task.title}</div>
                <div class="task-meta">${task.description || 'No description'}</div>
            </td>
            <td>
                <div class="priority">
                    <span class="priority-dot ${task.priority}"></span>
                    <span>${capitalizeFirst(task.priority)}</span>
                </div>
            </td>
            <td>
                <select class="status-select" data-task-id="${task.id}">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="blocked" ${task.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                </select>
            </td>
            <td>${formatDate(task.dueDate)}</td>
            <td>
                <div class="actions">
                    <button class="action-btn view btn-view" data-task-id="${task.id}" title="View/Edit task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="action-btn delete btn-delete" data-task-id="${task.id}" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function attachEventListeners(tbody, onStatusChange, onDelete, onView) {
    // Status change listeners
    const statusSelects = tbody.querySelectorAll('.status-select');
    statusSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const taskId = e.target.dataset.taskId;
            const newStatus = e.target.value;
            if (onStatusChange) {
                onStatusChange(taskId, newStatus);
            }
        });
    });

    // View button listeners
    const viewButtons = tbody.querySelectorAll('.btn-view');
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.taskId;
            if (onView) {
                onView(taskId);
            }
        });
    });

    // Delete button listeners
    const deleteButtons = tbody.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.taskId;
            if (confirm('Are you sure you want to delete this task?')) {
                if (onDelete) {
                    onDelete(taskId);
                }
            }
        });
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
        return 'Due today';
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffDays <= 7) {
        return `Due in ${diffDays} days`;
    } else {
        return date.toLocaleDateString();
    }
}
