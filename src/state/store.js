import taskService from '../services/taskService.js';
import userService from '../services/userService.js';
import { logout as authLogout } from '../services/authService.js'; // <--- IMPORTANTE: Importar logout
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

    notify() { this.subscribers.forEach(cb => cb(this.state)); }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    // ============================================
    // TASK LOGIC
    // ============================================

    /**
     * Carga tareas dependiendo del rol del usuario
     */
    async loadTasks() {
        this.setState({ loading: true, error: null });
        try {
            const user = this.state.user;
            if (!user) return;

            let tasks;
            // SI ES ADMIN: Ve todo
            if (user.role === 'admin') {
                tasks = await taskService.getAllTasks();
            } 
            // SI ES CLIENTE: Ve solo las suyas (filtro por userId en backend)
            else {
                tasks = await taskService.getTasksByUserId(user.id);
            }
            
            // Filtramos las anuladas visualmente
            const activeTasks = tasks.filter(t => t.status !== 'annulled');
            
            this.setState({ tasks: activeTasks, loading: false });
        } catch (error) {
            this.setState({ error: error.message, loading: false });
        }
    }

    /**
     * Crear tarea asignándola directamente al crearla
     */
    async createTask(taskData, userId = null) {
        this.setState({ loading: true, error: null });
        try {
            validateTask(taskData);
            
            // Inyectamos el userId directamente en la tarea
            const newTask = await taskService.createTask({
                ...taskData,
                userId: userId, // <-- Aquí está la magia de la relación FK
                status: 'pending'
            });

            // Actualizamos estado local
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
     * Asignar tarea (para admins, mueve la tarea de dueño)
     */
    async assignTaskToUser(taskId, userId) {
        this.setState({ loading: true });
        try {
            // Actualizamos la tarea, NO el usuario
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
     * Método interno privado genérico para actualizar
     */
    async _performTaskUpdate(taskId, validPayload) {
        try {
            const updatedTask = await taskService.updateTask(taskId, validPayload);
            
            // Actualizar array local
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
        if (user) this.loadTasks(); // Cargar tareas al loguear
    }

    getUser() { return this.state.user; }

    /**
     * Cierra sesión: Limpia token y resetea el estado global
     */
    logout() {
        authLogout(); // 1. Borrar token del storage
        
        // 2. Limpiar estado en memoria
        this.setState({ 
            user: null, 
            tasks: [], 
            error: null,
            loading: false 
        });
    }
}

export const store = new Store();