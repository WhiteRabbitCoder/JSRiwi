export const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    BLOCKED: 'blocked',
    ANNULLED: 'annulled'
};

export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

export const TASK_CATEGORIES = {
    DESIGN: 'Design',
    MATH: 'Mathematics',
    ENGINEERING: 'Engineering',
    OPTIMIZATION: 'Optimization',
    MARKETING: 'Marketing',
    DEVELOPMENT: 'Development',
    OTHER: 'Other'
};

/**
 * Valida una tarea nueva
 */
export function validateTask(task) {
    if (!task.title) throw new Error("Task title is required");
    if (task.priority && !Object.values(TASK_PRIORITY).includes(task.priority)) {
        throw new Error("Invalid priority");
    }
    return true;
}

/**
 * Prepara el payload para una actualización de estado
 */
export function prepareStatusUpdate(newStatus) {
    if (!Object.values(TASK_STATUS).includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
    }
    return { status: newStatus };
}

/**
 * Prepara el payload para una actualización de prioridad
 */
export function preparePriorityUpdate(newPriority) {
    if (!Object.values(TASK_PRIORITY).includes(newPriority)) {
        throw new Error(`Invalid priority: ${newPriority}`);
    }
    return { priority: newPriority };
}

/**
 * Prepara el payload para una actualización general
 * Filtra solo campos permitidos
 */
export function prepareGeneralUpdate(updates) {
    const allowedFields = ['title', 'description', 'dueDate', 'category'];
    const cleanUpdates = {};

    Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
            cleanUpdates[key] = updates[key];
        }
    });

    if (Object.keys(cleanUpdates).length === 0) {
        throw new Error("No valid fields to update");
    }

    return cleanUpdates;
}