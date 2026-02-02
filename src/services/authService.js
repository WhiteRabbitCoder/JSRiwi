/* src/services/authService.js */
import {API_URLS} from "../utils/constants.js";

/**
 * Generates a simple session token
 * @param {object} user
 * @returns {string}
 */
function generateToken(user) {
    const payload = `${user.id}_${Date.now()}`;
    return btoa(payload);
}

/**
 * Logs in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function login(email, password) {
    try {
        const response = await fetch(`${API_URLS.base}/users?email=${email}`);

        if (!response.ok) {
            throw new Error('Server connection error');
        }

        const users = await response.json();
        const user = users[0];

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // --- NUEVA VALIDACIÓN: Soft Delete Check ---
        if (user.status === 'annulled') {
            return { success: false, error: 'Esta cuenta ha sido desactivada. Contacte con administración.' };
        }
        // -------------------------------------------

        if (user.password !== password) {
            return { success: false, error: 'Incorrect password' };
        }

        // Generate and save only the token
        const token = generateToken(user);
        localStorage.setItem('authToken', token);

        return { success: true, token };

    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Registers a new user in the database.
 * @param {object} userData - Object with user data (name, email, password, etc.)
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function register(userData) {
    try {
        // 1. Check if email already exists
        const checkRef = await fetch(`${API_URLS.base}/users?email=${userData.email}`);
        const existingUsers = await checkRef.json();

        if (existingUsers.length > 0) {
            return { success: false, error: 'Email is already registered' };
        }

        // 2. Create the user
        const response = await fetch(`${API_URLS.base}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...userData,
                role: "client",
                status: "active", // <--- NUEVO: Definimos el estado inicial explícitamente
                createdAt: new Date().toISOString(),
            })
        });

        if (!response.ok) {
            throw new Error('Could not create user');
        }

        const newUser = await response.json();

        // Generate and save only the token
        const token = generateToken(newUser);
        localStorage.setItem('authToken', token);

        return { success: true, token };

    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: error.message || 'Error registering user' };
    }
}

/**
 * Gets the stored authentication token.
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Checks if there is a valid authentication token.
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Logs out the current user.
 */
export function logout() {
    localStorage.removeItem('auth_token');
    window.location.hash = '#/login'; // Corregido el hash para coincidir con tu Router
}
