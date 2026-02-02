import taskService from '../services/taskService.js';
import userService from '../services/userService.js';
import { logout as authLogout } from '../services/authService.js'; // IMPORTANT: Import logout
import {
    validateTask,
    prepareStatusUpdate,
    preparePriorityUpdate,
    prepareGeneralUpdate
} from '../utils/taskHelper.js';

class Store {
    constructor() {
        this.state = {
            tasks: [],
            user: null,
            loading: false,
            error: null
        };
        this.subscribers = [];
    }

    getState() { return { ...this.state }; }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    notify() {
        this.subscribers.forEach(cb => {
            try {
                cb(this.state);
            } catch (error) {
                console.warn("⚠️ Error in view update (probably waiting for data):", error);
            }
        });
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    // ============================================
    // TASK LOGIC
    // ============================================

    /**
     * Load tasks based on user role
     */
    async loadTasks() {
        this.setState({ loading: true, error: null });
        try {
            const user = this.state.user;
            if (!user) return;

            // ALWAYS load all tasks from the system
            let tasks = await taskService.getAllTasks();

            // MANUAL JOIN: Fetch users to populate user details (replacing _expand=user)
            try {
                const users = await userService.getUsers();
                const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

                tasks = tasks.map(task => ({
                    ...task,
                    user: task.userId ? userMap[task.userId] : undefined
                }));
            } catch (uError) {
                console.warn("Could not populate user details for tasks:", uError);
                // Continue without expanded user details
            }

            // DO NOT filter by user here - we'll do it in the views as needed
            // This allows the dashboard to show all tasks

            this.setState({ tasks, loading: false });
        } catch (error) {
            this.setState({ error: error.message, loading: false });
        }
    }

    /**
     * Create task and assign it directly upon creation
     */
    async createTask(taskData, userId = null) {
        this.setState({ loading: true, error: null });
        try {
            validateTask(taskData);

            // Inject userId directly into the task
            const newTask = await taskService.createTask({
                ...taskData,
                userId: userId, // <-- Here's the magic of the FK relationship
                status: 'pending'
            });

            // Update local state
            this.setState({
                tasks: [...this.state.tasks, newTask],
                loading: false
            });

            return newTask;
        } catch (error) {
            this.setState({ error: error.message, loading: false });
            throw error;
        }
    }

    /**
     * Assign task (for admins, moves task ownership)
     */
    async assignTaskToUser(taskId, userId) {
        this.setState({ loading: true });
        try {
            // Update the task, NOT the user
            await this._performTaskUpdate(taskId, { userId: userId });
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ error: error.message, loading: false });
        }
    }

    // ============================================
    // UPDATE METHODS (Atomic)
    // ============================================

    async updateTaskStatus(taskId, newStatus) {
        return this._performTaskUpdate(taskId, prepareStatusUpdate(newStatus));
    }

    async updateTaskPriority(taskId, newPriority) {
        return this._performTaskUpdate(taskId, preparePriorityUpdate(newPriority));
    }

    async updateTaskDetails(taskId, updates) {
        return this._performTaskUpdate(taskId, prepareGeneralUpdate(updates));
    }

    /**
     * Generic private internal method for updates
     */
    async _performTaskUpdate(taskId, validPayload) {
        try {
            const updatedTask = await taskService.updateTask(taskId, validPayload);

            // Update local array
            const updatedTasks = this.state.tasks.map(t =>
                t.id === taskId ? updatedTask : t
            );

            this.setState({ tasks: updatedTasks });
            return updatedTask;
        } catch (error) {
            this.setState({ error: error.message });
            throw error;
        }
    }

    // ============================================
    // AUTH LOGIC
    // ============================================
    setUser(user) {
        this.setState({ user });
        if (user) this.loadTasks(); // Load tasks on login
    }

    getUser() { return this.state.user; }

    /**
     * Logout: Clear token and reset global state
     */
    logout() {
        authLogout(); // 1. Delete token from storage

        // 2. Clear state in memory
        this.setState({
            user: null,
            tasks: [],
            error: null,
            loading: false
        });
    }
}

export const store = new Store();