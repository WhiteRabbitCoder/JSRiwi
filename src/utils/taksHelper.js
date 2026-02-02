export const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

/**
 * Valida los datos de una tarea antes de enviarla al servicio
 * @param {object} task - Objeto tarea
 * @throws {Error} Si la validación falla
 */
export function validateTask(task) {
    if (!task.title || typeof task.title !== 'string') {
        throw new Error("La tarea debe tener un título válido.");
    }

    if (task.status && !Object.values(TASK_STATUS).includes(task.status)) {
        throw new Error("Estado de tarea inválido.");
    }

    if (task.priority && !Object.values(TASK_PRIORITY).includes(task.priority)) {
        throw new Error("Prioridad de tarea inválida.");
    }

    if (task.dueDate) {
        const date = new Date(task.dueDate);
        if (isNaN(date.getTime())) {
            throw new Error("La fecha de vencimiento (Due Date) no es válida.");
        }
    }

    return true;
}

/**
 * Helper para formatear fechas en la vista
 */
export function formatDate(isoString) {
    if (!isoString) return 'Sin fecha';
    return new Date(isoString).toLocaleDateString();
}