/* src/router/router.js */
import { isAuthenticated } from '../services/authService.js';
import { store } from '../state/store.js';

// Mapa para almacenar la configuración de las rutas
const routes = new Map();

/**
 * Registra una nueva ruta en el enrutador.
 * @param {string} path - El hash de la ruta (ej: "#/admin")
 * @param {Function} viewFunction - Función asíncrona que retorna el string HTML de la vista
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

    // 2. Guard: Rutas protegidas (Requieren Login)
    if (options.requiresAuth && !isAuthenticated()) {
        console.warn('Acceso denegado: Usuario no autenticado.');
        navigate('#/login');
        return;
    }

    // 3. Guard: Rutas solo públicas (Login/Registro no accesibles si ya estás logueado)
    if (options.publicOnly && isAuthenticated()) {
        console.log('Redirigiendo: Usuario ya autenticado.');
        navigate('#/');
        return;
    }

    // 4. Guard: Roles específicos (Protección Admin/Users)
    if (options.allowedRoles && options.allowedRoles.length > 0) {
        // Asegurar que tenemos datos del usuario antes de verificar roles
        if (!currentUser || !currentUser.role) {
            // Si está autenticado pero el store no tiene info, forzamos login para recargar
            navigate('#/login');
            return;
        }

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
        const html = await view();
        app.innerHTML = html;
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
