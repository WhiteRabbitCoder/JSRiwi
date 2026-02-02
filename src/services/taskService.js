import { API_URLS } from "../utils/constants.js";

class TaskService {

    // Obtener TODAS (Para Admin)
    async getAllTasks() {
        try {
            // Include user details directly using json-server expand capability
            const response = await fetch(`${API_URLS.base}/tasks`);
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error("Error fetching tasks:", error);
            throw error;
        }
    }


    async getTasksByUserId(userId) {
        try {
            // JSON-Server automatically filters with ?userId=...
            const response = await fetch(`${API_URLS.base}/tasks?userId=${userId}`);
            if (!response.ok) throw new Error(response.statusText);
            return await response.json();
        } catch (error) {
            console.error("Error fetching user tasks:", error);
            throw error;
        }
    }

    async createTask(taskData) {
        try {
            const response = await fetch(`${API_URLS.base}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...taskData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            });
            if (!response.ok) throw new Error("Error creating task");
            return await response.json();
        } catch (error) { console.error(error); throw error; }
    }

    async updateTask(id, updates) {
        try {
            const response = await fetch(`${API_URLS.base}/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...updates,
                    updatedAt: new Date().toISOString()
                })
            });
            if (!response.ok) throw new Error("Error updating task");
            return await response.json();
        } catch (error) { console.error(error); throw error; }
    }

    async deleteTask(id) {
        try {
            const response = await fetch(`${API_URLS.base}/tasks/${id}`, {
                method: "PATCH", // Soft delete
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: 'annulled',
                    updatedAt: new Date().toISOString()
                })
            });
            if (!response.ok) throw new Error("Error deleting task");
            return true;
        } catch (error) { console.error(error); throw error; }
    }
}

export default new TaskService();