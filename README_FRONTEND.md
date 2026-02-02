# CRUDZASO Task Manager - Frontend Documentation

This document details the frontend architecture, components, views, and behavior of the **CRUDZASO Task Manager** application.

## 🏗 Frontend Architecture

The application follows a **component-based architecture** with:
- **Vanilla JavaScript** (ES6 modules)
- **Client-side routing** (hash-based)
- **Reactive state management** via Store subscriptions
- **Modular components** for reusability

### Directory Structure
```
src/
├── components/      # Reusable UI components
├── views/          # Page-level views
├── services/       # API communication layer
├── state/          # Global state management
├── router/         # Client-side routing
└── utils/          # Helper functions and constants
```

---

## 🧩 Components

### 1. **Sidebar** (`src/components/Sidebar.js`)
**Purpose:** Main navigation sidebar with logo and menu items.

**Features:**
- Displays application logo
- Navigation links (Dashboard, My Tasks)
- Admin-only menu items (Users, Annulled Tasks)
- Dynamic visibility based on user role

**Usage:**
```javascript
import { Sidebar } from './components/Sidebar.js';
body.appendChild(Sidebar());
```

---

### 2. **Topbar** (`src/components/Topbar.js`)
**Purpose:** Top navigation bar with user info and logout.

**Features:**
- Displays current user name and email
- User avatar (initials)
- Logout button
- Responsive design

**Usage:**
```javascript
import { Topbar } from './components/Topbar.js';
mainContent.appendChild(Topbar());
```

---

### 3. **PageHeader** (`src/components/PageHeader.js`)
**Purpose:** Reusable page title and subtitle component.

**Props:**
- `title` (string): Main page title
- `subtitle` (string): Page description
- `showNewTaskButton` (boolean): Whether to show "New Task" button

**Usage:**
```javascript
import { PageHeader } from './components/PageHeader.js';
content.appendChild(PageHeader('Dashboard', 'Track your progress', false));
```

---

### 4. **StatsGrid** (`src/components/StatsGrid.js`)
**Purpose:** Grid container for statistics cards.

**Props:**
- `stats` (array): Array of stat objects with `label`, `value`, `iconColor`, `iconSvg`, `footer`

**Usage:**
```javascript
import { StatsGrid } from './components/StatsGrid.js';
const stats = [
    { label: 'Total Tasks', value: 42, iconColor: 'blue', iconSvg: '...', footer: null }
];
content.appendChild(StatsGrid(stats));
```

---

### 5. **StatsCard** (`src/components/StatsCard.js`)
**Purpose:** Individual statistic card component.

**Props:**
- `label` (string): Card title
- `value` (number): Statistic value
- `iconColor` (string): Icon color class
- `iconSvg` (string): SVG icon markup
- `footer` (object|null): Optional footer with `type` and `content`

---

### 6. **TaskTable** (`src/components/TaskTable.js`)
**Purpose:** Reusable task table with actions.

**Features:**
- Displays tasks in table format
- Status badges with color coding
- Priority indicators
- Action buttons (view, delete)
- Handles empty state

**Props:**
- `tasks` (array): Array of task objects
- `onStatusChange` (function): Callback for status updates
- `onDelete` (function): Callback for task deletion
- `onView` (function): Callback for viewing task details

**Usage:**
```javascript
import { TaskTable } from './components/TaskTable.js';
content.appendChild(TaskTable(tasks, handleStatusChange, handleDelete, handleView));
```

---

## 📄 Views

### 1. **LoginView** (`src/views/login.js`)
**Purpose:** User authentication page.

**Features:**
- Email and password input
- Form validation
- Error messaging
- Link to registration
- Auto-redirect on successful login

**Behavior:**
- Calls `authService.login()`
- Stores token in localStorage
- Redirects to dashboard

---

### 2. **RegisterView** (`src/views/register.js`)
**Purpose:** New user registration page.

**Features:**
- Multi-field form (name, email, phone, department, password)
- Department dropdown
- Form validation
- Error handling
- Link to login

**Behavior:**
- Calls `authService.register()`
- Auto-login after successful registration
- Redirects to dashboard

---

### 3. **DashboardView** (`src/views/dashboard.js`)
**Purpose:** Main overview page showing all tasks and statistics.

**Features:**
- Statistics cards (Total, Completed, In Progress, Pending)
- Task filtering (All, Pending, In Progress, Completed, Annulled*)
- Task table with search
- Admin-only features (status dropdowns, delete buttons)

**Behavior:**
- Subscribes to store updates for real-time data
- Filters tasks based on selected filter
- Admin sees all tasks, users see only their own

**Admin Features:**
- Can change task status via dropdown
- Can delete tasks (soft delete)
- Can view annulled tasks

---

### 4. **MyTasksView** (`src/views/mytasks.js`)
**Purpose:** Task management page with create/edit functionality.

**Features:**
- Priority-based statistics
- "New Task" button
- Task table with full CRUD operations
- Modal for creating new tasks
- Modal for editing existing tasks

**Behavior:**
- **Create Task:**
  - Regular users: Auto-assigns to self
  - Admins: Can assign to any user or leave orphaned (unassigned)
- **Edit Task:**
  - Update all task fields
  - Admins can reassign tasks
- **Delete Task:** Soft delete (marks as annulled)

**Admin Assignment Logic:**
- Dropdown shows all active users
- Can create orphan tasks (userId = null)
- Can reassign existing tasks

---

### 5. **AdminUsersView** (`src/views/adminUsers.js`)
**Purpose:** User management page (Admin only).

**Features:**
- User list table
- Search functionality
- "Create New User" button
- User annulment (soft delete)
- Displays user details (name, email, phone, department, role, status)

**Behavior:**
- Loads all users via `userService.getUsers()`
- Create user modal with full form
- Can annul users (status = 'annulled')
- Shows annulled users with reduced opacity

---

### 6. **AnnulledView** (`src/views/annulled.js`)
**Purpose:** View annulled (deleted) tasks (Admin only).

**Features:**
- Displays all annulled tasks
- Read-only table
- Statistics for annulled tasks

**Behavior:**
- Filters tasks where `status === 'annulled'`
- No edit/delete actions available

---

### 7. **ProfileView** (`src/views/profile.js`)
**Purpose:** User profile management.

**Features:**
- Display user information
- Edit profile fields
- Change password
- Update department

**Behavior:**
- Loads current user data
- Updates via `userService.updateUser()`
- Real-time validation

---

## 🛣 Routing

**File:** `src/router/router.js`

### Hash-based Routing
The application uses hash-based routing (`#/path`) for client-side navigation.

### Routes:
| Route | View | Access |
|-------|------|--------|
| `#/login` | LoginView | Public |
| `#/register` | RegisterView | Public |
| `#/dashboard` | DashboardView | Authenticated |
| `#/tasks` | MyTasksView | Authenticated |
| `#/profile` | ProfileView | Authenticated |
| `#/admin/users` | AdminUsersView | Admin only |
| `#/admin/annulled` | AnnulledView | Admin only |

### Route Protection:
- **Public routes:** Login, Register
- **Authenticated routes:** Require valid token
- **Admin routes:** Require `role === 'admin'`

### Navigation Flow:
1. App checks for token on load
2. If token exists, validates user
3. Redirects to appropriate route based on authentication
4. Hash changes trigger route re-evaluation

---

## 🔄 State Management

### Store Subscription Pattern
Views subscribe to store changes for reactive updates:

```javascript
const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    // Re-render UI with new state
    updateUI(state);
});

// Cleanup on view removal
body.remove = () => {
    unsubscribe();
    originalRemove();
};
```

### State Structure:
```javascript
{
    tasks: [],      // Array of task objects
    user: null,     // Current user object
    loading: false, // Loading state
    error: null     // Error message
}
```

---

## 🎨 Styling

**File:** `styles.css`

### Design System:
- **Color Palette:** Modern, professional colors
- **Typography:** Clean, readable fonts
- **Components:** Modular CSS classes
- **Responsive:** Mobile-first approach

### Key CSS Classes:
- `.dashboard-layout`: Main layout container
- `.sidebar`: Navigation sidebar
- `.main-content`: Content area
- `.stats-grid`: Statistics grid
- `.table-container`: Table wrapper
- `.modal-overlay`: Modal backdrop
- `.btn-primary`, `.btn-secondary`: Button styles
- `.status-badge`: Task status indicators
- `.priority-dot`: Priority indicators

---

## 🔐 Authentication Flow

1. **Login:**
   - User enters credentials
   - `authService.login()` validates and returns token
   - Token stored in localStorage
   - User data loaded via `userService.getCurrentUser()`
   - Store updated with user
   - Redirect to dashboard

2. **Registration:**
   - User fills registration form
   - `authService.register()` creates user
   - Auto-login with new credentials
   - Redirect to dashboard

3. **Logout:**
   - `store.logout()` called
   - Token removed from localStorage
   - State cleared
   - Redirect to login

4. **Token Persistence:**
   - Token checked on app load
   - Auto-login if valid token exists
   - Redirect to login if invalid/missing

---

## 🚀 Application Initialization

**File:** `src/app.js`

### Startup Sequence:
1. Check for existing token
2. If token exists:
   - Load user data
   - Set user in store (triggers task loading)
   - Navigate to dashboard
3. If no token:
   - Navigate to login
4. Initialize router
5. Set up hash change listeners

---

## 🎯 Key Features

### Role-Based Access Control (RBAC)
- **Admin:**
  - View all tasks
  - Create tasks for any user
  - Create orphan tasks
  - Reassign tasks
  - Manage users
  - View annulled items
  - Change task status via dropdown

- **User:**
  - View own tasks only
  - Create tasks (auto-assigned to self)
  - Edit own tasks
  - Update task status/priority
  - Soft delete own tasks

### Task Assignment Logic
- **Admin creating task:**
  - Can select user from dropdown
  - Can leave unassigned (orphan)
  - Can reassign later via edit

- **User creating task:**
  - Automatically assigned to self
  - No assignment dropdown shown

### Soft Delete Pattern
- Tasks/users marked as `annulled` instead of deleted
- Annulled items hidden from main views
- Admin can view annulled items in dedicated view
- Maintains data integrity and audit trail

---

## 📱 Responsive Design

- **Desktop:** Full sidebar + content area
- **Tablet:** Collapsible sidebar
- **Mobile:** Hamburger menu, stacked layout

---

## 🔧 Development Guidelines

### Adding a New View:
1. Create file in `src/views/`
2. Export function returning DOM element
3. Add route in `router.js`
4. Subscribe to store if needed
5. Clean up subscriptions on unmount

### Adding a New Component:
1. Create file in `src/components/`
2. Export function accepting props
3. Return DOM element
4. Keep components pure and reusable

### State Updates:
- Always use store methods
- Never mutate state directly
- Subscribe to changes for reactivity
- Unsubscribe on cleanup

---

## 🐛 Error Handling

- Form validation with user-friendly messages
- API error handling with try-catch
- Loading states during async operations
- Empty state handling in tables
- Token expiration handling

---

## 📊 Performance Optimizations

- Lazy loading of views
- Efficient DOM updates (targeted re-renders)
- Event delegation for dynamic content
- Debounced search inputs
- Minimal re-renders via selective subscriptions
