import {API_URLS} from "../utils/constants.js";
import { getToken } from "./authService.js"; 


class UserService {

    /**
     * Gets all users from the database.
     * @returns {Promise<Array>}
     */
    async getUsers() {
        try {
            const response = await fetch(`${API_URLS.base}/users`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    /**
     * Gets a user by email and password (used in login).
     * @param {string} email
     * @param {string} password
     * @returns {Promise<object|null>}
     */
    async getUser(email, password) {
        try {
            const response = await fetch(`${API_URLS.base}/users?email=${email}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.statusText}`);
            }

            const users = await response.json();
            const user = users[0];

            if (!user || user.password !== password) {
                return null;
            }

            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }

    /**
     * Gets the current authenticated user using the token.
     * Extracts the user ID from the token and fetches the user data.
     * @returns {Promise<object|null>}
     */
    async getCurrentUser() {
        try {
            const token = getToken();

            if (!token) {
                return null;
            }

            // Decode token to get user ID
            const decodedToken = atob(token);
            console.log(decodedToken)
            const userId = decodedToken.split('_')[0];

            const response = await fetch(`${API_URLS.base}/users/${userId}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.statusText}`);
            }

            const user = await response.json();
            // Do not return the password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error("Error fetching current user:", error);
            return null;
        }
    }

    /**
     * Gets a user by ID.
     * @param {number} id
     * @returns {Promise<object>}
     */
    async getUserById(id) {
        try {
            const response = await fetch(`${API_URLS.base}/users/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.statusText}`);
            }

            const user = await response.json();
            // Do not return the password
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    }

    /**
     * Updates a user by ID.
     * @param {number} id
     * @param {object} userData
     * @returns {Promise<object>}
     */
    async updateUser(id, userData) {
        try {
            const response = await fetch(`${API_URLS.base}/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({userData, updatedAt: new Date().toISOString()})
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    }

    /**
     * Annul a user by ID.
     * @param {number} id
     * @returns {Promise<object>}
     */
    async deleteUser(id) {
        try {
            const response = await fetch(`${API_URLS.base}/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    updatedAt: new Date().toISOString(),
                    status: "annulled"
                })

            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    }

    /**
     * Creates a new user programmatically (e.g., for Admins creating other users).
     * Unlike authService.register, this does strictly database insertion without handling session.
     * @param {object} userData - Object with user data (must include email, password, role)
     * @returns {Promise<object>} Created user
     * @throws {Error} If email exists or request fails
     */
    async createUser(userData) {
        try {
            // 1. Check if email already exists
            const checkRef = await fetch(`${API_URLS.base}/users?email=${userData.email}`);
            const existingUsers = await checkRef.json();

            if (existingUsers.length > 0) {
                throw new Error('Email is already registered');
            }

            // 2. Create the user
            const response = await fetch(`${API_URLS.base}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({userData, createdAt: new Date().toISOString()})
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }

}

export default new UserService();
