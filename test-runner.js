import { store } from './src/state/store.js';
import * as authService from './src/services/authService.js';
import userService from './src/services/userService.js';
import taskService from './src/services/taskService.js';

const log = (msg, type = 'info') => {
    const styles = {
        info: 'color: #00bcd4; font-weight: bold;',
        success: 'color: #4caf50; font-weight: bold; font-size: 1.1em;',
        error: 'color: #f44336; font-weight: bold; font-size: 1.2em;',
        step: 'color: #ff9800; font-weight: bold;'
    };
    console.log(`%c${msg}`, styles[type] || styles.info);
};

export async function runSystemCheck() {
    console.clear();
    log('🚀 TESTING RELATIONAL TASK MANAGER...', 'step');

    const timestamp = Date.now();
    // Agregamos campos extra como pediste
    const testUser = {
        name: `Task Master ${timestamp}`,
        email: `worker_${timestamp}@firefly.com`,
        password: 'password123',
        phone: '555-0199',              // Campo extra
        department: 'Engineering'       // Campo extra
    };

    try {
        log('\n1️⃣ Auth Flow...', 'step');
        
        // 1. Registro
        await authService.register(testUser);
        
        // 2. Login
        await authService.login(testUser.email, testUser.password);
        
        // 3. Carga en Store
        const currentUser = await userService.getCurrentUser();
        store.setUser(currentUser);
        console.log(`   ✅ User Logged in: ${currentUser.email} (ID: ${currentUser.id})`);


        log('\n2️⃣ Creating Relational Task...', 'step');
        
        const taskData = {
            title: "Optimize DB Queries",
            description: "Switch from array references to FK",
            priority: "high",
            dueDate: new Date().toISOString()
        };

        // Creamos tarea vinculada al usuario
        const newTask = await store.createTask(taskData, currentUser.id);
        console.log(`   ✅ Task Created: API ID ${newTask.id}`);


        log('\n3️⃣ Verifying Relationship (Foreign Key)...', 'step');
        
        // Verificamos que la tarea sepa quién es su dueño
        if (newTask.userId !== currentUser.id) {
            throw new Error(`Foreign Key Error: Expected ${currentUser.id}, got ${newTask.userId}`);
        }
        console.log(`   ✅ Foreign Key OK: Task.userId points to User.id`);

        
        log('\n4️⃣ Verifying Filter Query...', 'step');
        
        // Simulamos la carga de tareas del usuario
        const userTasks = await taskService.getTasksByUserId(currentUser.id);
        const relatedTask = userTasks.find(t => t.id === newTask.id);
        
        if (!relatedTask) throw new Error("API Filter failed: Task not found via userId query");
        console.log(`   ✅ API Query OK: GET /tasks?userId=${currentUser.id} worked`);


        log('\n5️⃣ Cleaning Up...', 'step');
        await taskService.deleteTask(newTask.id); // Soft delete
        console.log('   ✅ Soft Delete executed');

        log('\n🏁 SYSTEM RELATIONAL CHECK PASSED 🏁', 'success');

    } catch (err) {
        log(`\n❌ TEST FAILED: ${err.message}`, 'error');
        console.error(err);
    }
}

window.runTest = runSystemCheck;