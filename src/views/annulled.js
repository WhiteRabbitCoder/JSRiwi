import { Sidebar } from '../components/Sidebar.js';
import { Topbar } from '../components/Topbar.js';
import { PageHeader } from '../components/PageHeader.js';
import { TaskTable } from '../components/TaskTable.js';
import taskService from '../services/taskService.js';
import { store } from '../state/store.js';

export function AnnulledTasksView() {
    const body = document.createElement('div');
    body.classList.add('dashboard-layout');

    body.appendChild(Sidebar());

    const mainContent = document.createElement('div');
    mainContent.classList.add('main-content', 'dark-bg');

    mainContent.appendChild(Topbar());

    const content = document.createElement('main');
    content.classList.add('content');

    content.appendChild(PageHeader('Annulled Tasks', 'View all cancelled and deleted tasks', false));

    const render = () => {
        content.innerHTML = ''; // Clear previous content
        content.appendChild(PageHeader('Annulled Tasks', 'View all cancelled and deleted tasks', false));
        loadAnnulledTasks(content);
        updateAdminMenu(body);
    };

    // Initial render
    render();

    // Subscribe
    const unsubscribe = store.subscribe(render);

    // Cleanup
    const originalRemove = body.remove.bind(body);
    body.remove = () => {
        unsubscribe();
        originalRemove();
    };

    mainContent.appendChild(content);
    body.appendChild(mainContent);

    return body;
}

async function loadAnnulledTasks(content) {
    try {
        // Get all tasks from store
        const state = store.getState();
        const allTasks = state.tasks || [];

        // Filter only annulled tasks
        const annulledTasks = allTasks.filter(t => t.status === 'annulled');

        // Create info section
        const infoSection = document.createElement('div');
        infoSection.style.cssText = 'background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 24px;';
        infoSection.innerHTML = `
            <h3 style="margin: 0 0 8px 0; color: #1a1a1a;">Annulled Tasks</h3>
            <p style="margin: 0; color: #6b7280;">
                Found <strong>${annulledTasks.length}</strong> annulled task${annulledTasks.length !== 1 ? 's' : ''}. 
                These tasks have been soft-deleted and are only visible to administrators.
            </p>
        `;
        content.appendChild(infoSection);

        // Add task table
        content.appendChild(TaskTable(annulledTasks, null, null));
    } catch (error) {
        console.error('Error loading annulled tasks:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'background: #fee; padding: 20px; border-radius: 8px; color: #c00;';
        errorDiv.textContent = 'Failed to load annulled tasks: ' + error.message;
        content.appendChild(errorDiv);
    }
}

function updateAdminMenu(context = document) {
    const user = store.getUser();
    if (user && user.role === 'admin') {
        const safeQuery = (selector) =>
            (context.querySelector ? context.querySelector(selector) : document.querySelector(selector));

        const usersNav = safeQuery('#admin-users-nav');
        const annulledNav = safeQuery('#admin-annulled-nav');

        // Estado deseado
        if (usersNav) usersNav.style.display = 'block';
        if (annulledNav) annulledNav.style.display = 'block';
    }
}
