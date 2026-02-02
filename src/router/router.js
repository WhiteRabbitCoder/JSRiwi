/* src/router/router.js */
import { isAuthenticated } from '../services/authService.js';
import { store } from '../state/store.js';

// Map to store route configuration
const routes = new Map();

/**
 * Registra una nueva ruta en el enrutador.
 * @param {string} path - El hash de la ruta (ej: "#/admin")
 * @param {Function} viewFunction - Función asíncrona que retorna el elemento DOM o string HTML de la vista
 * @param {object} options - Opciones de seguridad: { requiresAuth, publicOnly, allowedRoles }
 */
export function addRoute(path, viewFunction, options = {}) {
    routes.set(path, { view: viewFunction, options });
}

/**
 * Navega programáticamente a una ruta.
 * @param {string} path - Hash de destino
 */
export function navigate(path) {
    if (window.location.hash === path) return;
    window.location.hash = path;
}

/**
 * Función principal que decide qué mostrar en pantalla.
 * Verifica 404, autenticación y roles.
 */
async function renderRoute() {
    const app = document.getElementById('app');
    const path = window.location.hash || '#/';
    const route = routes.get(path);

    // 1. Manejo de error 404 (Ruta no encontrada)
    if (!route) {
        app.innerHTML = `
            <div class="view-404">
                <h1>404 Not Found</h1>
                <p>La página que buscas no existe.</p>
                <a href="#/">Volver al inicio</a>
            </div>
        `;
        return;
    }

    const { view, options } = route;
    const currentUser = store.getUser();

    // --- NEW: Solution to "Phantom User" and Crash on Reload ---
    // If the route requires auth, we have a token, BUT the user is not yet in memory...
    // This means initApp is still fetching data ("Hydration gap").
    // DO NOT render the view to avoid crashing when accessing 'role' of null.
    if (options.requiresAuth && isAuthenticated() && !currentUser) {
        console.log('⏳ Token detectado, esperando datos de usuario...');
        app.innerHTML = '<div class="loading-state" style="text-align:center; padding: 50px;"><h2>Cargando sesión...</h2><p>Por favor espere mientras recuperamos sus datos.</p></div>';

        // Nos suscribimos temporalmente al store.
        // As soon as initApp does 'store.setUser(user)', this will fire and we'll retry rendering.
        const unsubscribe = store.subscribe((state) => {
            if (state.user) {
                // Data received! Cancel subscription and render for real.
                unsubscribe();
                renderRoute();
            } else if (!isAuthenticated()) {
                // If token expired or load failed (initApp did logout), go to login.
                unsubscribe();
                navigate('#/login');
            }
        });
        return; // IMPORTANT: Stop execution here.
    }
    // -------------------------------------------------------------

    // 2. Guard: Rutas protegidas (Requieren Login)
    if (options.requiresAuth && !isAuthenticated()) {
        console.warn('Acceso denegado: Usuario no autenticado.');
        navigate('#/login');
        return;
    }

    // 3. Guard: Public-only routes (Login/Register not accessible if already logged in)
    if (options.publicOnly && isAuthenticated()) {
        console.log('Redirigiendo: Usuario ya autenticado.');
        navigate('#/');
        return;
    }

    // 4. Guard: Specific roles (Admin/User protection)
    if (options.allowedRoles && options.allowedRoles.length > 0) {
        // A este punto, currentUser YA EXISTE gracias a la espera de arriba.
        if (!options.allowedRoles.includes(currentUser.role)) {
            console.warn(`Acceso prohibido. Rol requerido: ${options.allowedRoles}, Rol actual: ${currentUser.role}`);
            app.innerHTML = `
                <div class="error-container" style="text-align: center; color: red;">
                    <h1>403 Forbidden</h1>
                    <p>No tienes permisos de administrador para ver esta página.</p>
                    <a href="#/">Volver al inicio</a>
                </div>
            `;
            return;
        }
    }

    // --- Renderizado de la Vista ---
    try {
        const result = await view();

        // Clear the app container
        app.innerHTML = '';

        // If result is a DOM element, append it; otherwise set as innerHTML
        if (result instanceof HTMLElement) {
            app.appendChild(result);
        } else if (typeof result === 'string') {
            app.innerHTML = result;
        } else {
            console.error('View function must return HTMLElement or string');
        }
    } catch (error) {
        console.error('Error renderizando vista:', error);
        app.innerHTML = '<h1>Error interno al cargar la página.</h1>';
    }
}

/**
 * Inicializa el router escuchando eventos del navegador.
 */
export function initRouter() {
    window.addEventListener('hashchange', renderRoute);
    window.addEventListener('load', renderRoute);
}
