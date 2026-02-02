import { addRoute, initRouter } from './router/router.js';
import { LoginView } from './views/login.js';
import { RegisterView } from './views/register.js';
import { DashboardView } from './views/dashboard.js';
import { MyTasksView } from './views/mytasks.js';
import { AnnulledTasksView } from './views/annulled.js';
import { ProfileView } from './views/profile.js';
import { AdminUsersView } from './views/adminUsers.js';
import { isAuthenticated } from './services/authService.js';
import userService from './services/userService.js';
import { store } from './state/store.js';

/**
 * Initialize the application
 */
export async function initApp() {
    console.log('🚀 Initializing Crudzaso Task Manager...');

    // Register all routes
    registerRoutes();

    // Initialize router
    initRouter();

    // Load user if authenticated
    if (isAuthenticated()) {
        try {
            const currentUser = await userService.getCurrentUser();
            if (currentUser) {
                store.setUser(currentUser);
                console.log('✅ User loaded:', currentUser.email);
                
                // Show admin menu items if user is admin
                if (currentUser.role === 'admin') {
                    setTimeout(() => {
                        const adminUsersNav = document.querySelector('#admin-users-nav');
                        const adminAnnulledNav = document.querySelector('#admin-annulled-nav');
                        if (adminUsersNav) adminUsersNav.style.display = 'block';
                        if (adminAnnulledNav) adminAnnulledNav.style.display = 'block';
                    }, 100);
                }
            }
        } catch (error) {
            console.error('❌ Error loading user:', error);
            // If there's an error loading user, clear auth and redirect to login
            localStorage.removeItem('authToken');
            window.location.hash = '#/login';
        }
    } else {
        // Not authenticated, redirect to login if not already there
        if (!window.location.hash.includes('login') && !window.location.hash.includes('register')) {
            window.location.hash = '#/login';
        }
    }
}

/**
 * Register all application routes
 */
function registerRoutes() {
    // Public routes (only accessible when not logged in)
    addRoute('#/login', renderLogin, { publicOnly: true });
    addRoute('#/register', renderRegister, { publicOnly: true });

    // Protected routes (require authentication)
    addRoute('#/', renderDashboard, { requiresAuth: true });
    addRoute('#/dashboard', renderDashboard, { requiresAuth: true });
    addRoute('#/tasks', renderMyTasks, { requiresAuth: true });
    addRoute('#/profile', renderProfile, { requiresAuth: true });

    // Admin-only routes
    addRoute('#/annulled', renderAnnulled, { 
        requiresAuth: true, 
        allowedRoles: ['admin'] 
    });
    addRoute('#/admin/users', renderAdminUsers, { 
        requiresAuth: true, 
        allowedRoles: ['admin'] 
    });
}

// Route render functions - return DOM elements directly
async function renderLogin() {
    return LoginView();
}

async function renderRegister() {
    return RegisterView();
}

async function renderDashboard() {
    // Ensure tasks are loaded before rendering
    await store.loadTasks();
    return DashboardView();
}

async function renderMyTasks() {
    // Ensure tasks are loaded before rendering
    await store.loadTasks();
    return MyTasksView();
}

async function renderAnnulled() {
    // Ensure tasks are loaded before rendering
    await store.loadTasks();
    return AnnulledTasksView();
}

async function renderProfile() {
    return ProfileView();
}

async function renderAdminUsers() {
    return AdminUsersView();
}
