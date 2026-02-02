# Firefly Task Manager - Backend Logic Documentation

Este documento detalla la arquitectura actual del backend (lógica de negocio) del proyecto **BeautifulFirefly**, refactorizado de una tienda de libros a un **Gestor de Tareas Relacional**.

Esta documentación está dirigida a los desarrolladores del Frontend para que sepan qué métodos utilizar en cada vista.

## 🏗 Arquitectura General

El proyecto utiliza una arquitectura basada en **Servicios y Estado Global (Store)**. 
- **DB Relacional:** Las tareas contienen la referencia a su dueño (`userId`), permitiendo consultas eficientes.
- **Store Centralizado:** Toda la lógica de mutación de estado pasa por `src/state/store.js`.
- **Services:** Capa de comunicación HTTP con la API (`json-server`).

---

## 🧠 State Management (Store)

El `Store` es el cerebro de la aplicación. **La UI debe interactuar casi exclusivamente con el `Store`**, no con los servicios directamente.

**Archivo:** `src/state/store.js`

### API Pública del Store (Para usar en Vistas)

#### Gestión de Sesión
| Método | Descripción |
|--------|-------------|
| `store.setUser(user)` | Establece el usuario actual y carga sus tareas automáticamente. |
| `store.getUser()` | Retorna el objeto usuario actual (o `null`). |
| `store.logout()` | Cierra sesión, borra token y limpia el estado global, redirigiendo efectivamente al usuario. |

#### Gestión de Tareas
| Método | Parámetros | Descripción |
|--------|------------|-------------|
| `store.loadTasks()` | `()` | Recarga las tareas. Si es **Admin**, carga todas. Si es **Cliente**, carga solo las suyas. |
| `store.createTask()` | `(taskData, userId?)` | Crea una tarea. Si pasas `userId`, la asigna inmediatamente (para tareas propias). |
| `store.assignTaskToUser()` | `(taskId, userId)` | (Admin) Reasigna una tarea existente a otro usuario. |
| `store.updateTaskStatus()` | `(taskId, status)` | Cambia el estado (`pending`, `in_progress`, `completed`). |
| `store.updateTaskPriority()` | `(taskId, priority)` | Cambia la prioridad (`low`, `medium`, `high`). |
| `store.updateTaskDetails()` | `(taskId, updates)` | Actualiza título, descripción o fecha. |

#### Suscripción (Reactividad)
| Método | Descripción |
|--------|-------------|
| `store.subscribe(cb)` | Registra una función callback que se ejecutará cada vez que el estado cambie. Útil para re-renderizar la UI. |
| `store.getState()` | Devuelve una copia del estado actual `{ tasks, user, loading, error }`. |

---

## 📡 Servicios (Capa de Datos)

Estos módulos manejan la comunicación directa con `json-server`.

### 1. AuthService (`src/services/authService.js`)
Maneja la autenticación y tokens.
- `login(email, password)`: Valida credenciales y guarda token en localStorage.
- `register(userData)`: Crea nuevo usuario.
- `logout()`: Elimina el token.
- `getToken()`: Recupera el token actual.

### 2. TaskService (`src/services/taskService.js`)
CRUD de tareas.
- `getAllTasks()`: Obtiene TODAS las tareas (Admin).
- `getTasksByUserId(userId)`: Obtiene tareas filtradas por ID de usuario (Cliente).
- `createTask(data)`: POST nueva tarea.
- `updateTask(id, updates)`: PATCH tarea.
- `deleteTask(id)`: **Soft Delete** (marca estado como `annulled`).

### 3. UserService (`src/services/userService.js`)
Información de usuarios.
- `getCurrentUser()`: Decodifica el token actual y busca los datos completos del usuario en la BD.
- `getUserById(id)`: Busca un usuario por ID.

---

## 🛠 Utilidades (Helpers)

### TaskHelper (`src/utils/taskHelper.js`)
Contiene validaciones y lógica de negocio pura. Útil para validar formularios antes de llamar al Store.

**Constantes Exportadas:**
```javascript
export const TASK_STATUS = { PENDING: 'pending', IN_PROGRESS: 'in_progress', COMPLETED: 'completed', BLOCKED: 'blocked' };
export const TASK_PRIORITY = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' };
```

**Funciones:**
- `validateTask(task)`: Valida que una tarea nueva tenga título y prioridad correcta.
- `prepareStatusUpdate(status)`: Valida cambios de estado.

---

## 🚀 Guía Rápida para Frontend

### 1. Inicializar la App (Main)
```javascript
// En tu main.js o al cargar la app
const user = await userService.getCurrentUser();
if (user) {
    store.setUser(user); // Esto dispara la carga de tareas automáticamente
}
```

### 2. Crear una Tarea (Formulario)
```javascript
const newTaskData = {
    title: "Nueva Tarea",
    description: "Descripción...",
    priority: "high",
    dueDate: "2023-12-31"
};
// Asigna la tarea al usuario actual
await store.createTask(newTaskData, store.getUser().id);
```

### 3. Renderizar Tareas
```javascript
function render() {
    const { tasks, loading } = store.getState();
    if (loading) return showSpinner();
    
    tasks.forEach(task => {
        // Dibujar tarea...
    });
}

// Suscribirse a cambios
store.subscribe(render);
```

### 4. Botón "Eliminar" (Soft Delete)
Aunque el Store no expone `delete` directo (usa soft delete via cambios de estado o lógica custom), si necesitas eliminar:
```javascript
import taskService from './services/taskService.js';
// ...
await taskService.deleteTask(taskId);
store.loadTasks(); // Recargar la lista visual
```
