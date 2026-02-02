# CRUDZASO Task Manager

A modern, full-featured task management application built with Vanilla JavaScript, featuring role-based access control, real-time state management, and a clean, professional UI.

## 📋 Overview

**CRUDZASO** is a comprehensive task management system designed for teams and organizations. It provides powerful features for administrators to manage users and tasks, while offering an intuitive interface for regular users to track their work.

### Key Features

- ✅ **Role-Based Access Control** - Admin and User roles with different permissions
- ✅ **Task Management** - Create, edit, delete, and track tasks with priorities and statuses
- ✅ **User Management** - Admin can create and manage users
- ✅ **Task Assignment** - Admins can assign tasks to users or leave them orphaned
- ✅ **Real-time Updates** - Reactive state management with automatic UI updates
- ✅ **Soft Delete** - Maintains data integrity with annulled status instead of hard deletes
- ✅ **Authentication** - Secure JWT-based authentication with token persistence
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ✅ **Statistics Dashboard** - Visual overview of task metrics and progress

---

## 🏗 Architecture

### Technology Stack

- **Frontend:** Vanilla JavaScript (ES6 Modules)
- **Backend:** JSON Server (REST API)
- **State Management:** Custom Store with pub/sub pattern
- **Routing:** Hash-based client-side routing
- **Styling:** Custom CSS with modern design system
- **Authentication:** JWT tokens with localStorage persistence

### Project Structure

```
mjm/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Sidebar.js
│   │   ├── Topbar.js
│   │   ├── PageHeader.js
│   │   ├── StatsGrid.js
│   │   ├── StatsCard.js
│   │   └── TaskTable.js
│   ├── views/           # Page-level views
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── mytasks.js
│   │   ├── profile.js
│   │   ├── adminUsers.js
│   │   └── annulled.js
│   ├── services/        # API communication
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   └── userService.js
│   ├── state/           # State management
│   │   ├── store.js
│   │   └── db.json
│   ├── router/          # Client-side routing
│   │   └── router.js
│   ├── utils/           # Helper functions
│   │   ├── taskHelper.js
│   │   ├── constants.js
│   │   └── taksHelper.js
│   └── app.js           # Application entry point
├── index.html           # Main HTML file
├── styles.css           # Global styles
├── main.js              # Application bootstrap
├── logo.svg             # Application logo
└── package.json         # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mjm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run server
   ```

4. **Open the application:**
   Navigate to `http://localhost:3000` in your browser

### Default Credentials

**Admin Account:**
- Email: `admin@test.com`
- Password: `password123`

**User Account:**
- Email: `user@test.com`
- Password: `password123`

---

## 📚 Documentation

- **[Frontend Documentation](./README_FRONTEND.md)** - Detailed guide on components, views, and frontend architecture
- **[Backend Documentation](./README_BACKEND.md)** - API endpoints, services, and state management
- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed installation and configuration instructions

---

## 🎯 Features by Role

### Admin Features

- **Dashboard:**
  - View all tasks from all users
  - Filter by status (All, Pending, In Progress, Completed, Annulled)
  - Change task status via dropdown
  - Delete tasks (soft delete)
  - Search tasks by title/description

- **Task Management:**
  - Create tasks and assign to any user
  - Create orphan tasks (unassigned)
  - Reassign existing tasks
  - Edit all task details
  - View task statistics by priority

- **User Management:**
  - Create new users
  - View all users
  - Annul users (soft delete)
  - Search users by name/email
  - View user details (role, department, status)

- **Annulled Items:**
  - View all annulled tasks
  - Access historical data

### User Features

- **Dashboard:**
  - View personal tasks only
  - Filter by status
  - Search own tasks
  - View completion statistics

- **Task Management:**
  - Create tasks (auto-assigned to self)
  - Edit own tasks
  - Update task status and priority
  - Delete own tasks (soft delete)
  - View task details

- **Profile:**
  - View and edit profile information
  - Update personal details
  - Change password

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. User logs in with email and password
2. Server validates credentials and returns JWT token
3. Token stored in localStorage
4. Token included in subsequent API requests
5. Auto-login on page refresh if valid token exists

### Authorization Levels

- **Public Routes:** Login, Register
- **Authenticated Routes:** Dashboard, Tasks, Profile
- **Admin Routes:** User Management, Annulled Items

---

## 🗄 Data Model

### User Object
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string,
  phone: string,
  role: 'admin' | 'user',
  department: string,
  status: 'active' | 'annulled',
  createdAt: ISO8601 timestamp
}
```

### Task Object
```javascript
{
  id: string,
  title: string,
  description: string,
  category: string,
  priority: 'low' | 'medium' | 'high',
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'annulled',
  dueDate: ISO8601 timestamp,
  userId: string | null,  // null for orphan tasks
  createdAt: ISO8601 timestamp,
  updatedAt: ISO8601 timestamp
}
```

---

## 🎨 Design System

### Color Palette

- **Primary:** Blue tones for main actions
- **Success:** Green for completed/positive states
- **Warning:** Orange for in-progress/medium priority
- **Danger:** Red for high priority/delete actions
- **Neutral:** Gray scale for text and backgrounds

### Typography

- **Headings:** Bold, clear hierarchy
- **Body:** Readable, professional font
- **Code:** Monospace for technical content

### Components

- **Buttons:** Primary, Secondary, Danger variants
- **Cards:** Stats cards, task cards
- **Tables:** Sortable, searchable data tables
- **Modals:** Form modals for create/edit operations
- **Badges:** Status and priority indicators

---

## 🔄 State Management

### Store Pattern

The application uses a centralized store with a pub/sub pattern:

```javascript
// Subscribe to state changes
const unsubscribe = store.subscribe((state) => {
  // Update UI with new state
  renderUI(state);
});

// Update state
await store.createTask(taskData, userId);

// Cleanup
unsubscribe();
```

### State Structure

```javascript
{
  tasks: Task[],      // All tasks (filtered by role)
  user: User | null,  // Current authenticated user
  loading: boolean,   // Loading state
  error: string | null // Error message
}
```

---

## 🛣 Routing

### Available Routes

| Route | View | Access Level |
|-------|------|--------------|
| `#/login` | Login | Public |
| `#/register` | Register | Public |
| `#/dashboard` | Dashboard | Authenticated |
| `#/tasks` | My Tasks | Authenticated |
| `#/profile` | Profile | Authenticated |
| `#/admin/users` | User Management | Admin |
| `#/admin/annulled` | Annulled Tasks | Admin |

---

## 🧪 Development

### Available Scripts

```bash
# Start JSON Server (backend)
npm run server

# Run tests (if configured)
npm test

# Build for production (if configured)
npm run build
```

### Code Style

- ES6+ JavaScript
- Modular architecture
- Component-based design
- Functional programming patterns
- Clear naming conventions
- Comprehensive comments

---

## 🐛 Known Issues & Limitations

- JSON Server is for development only (not production-ready)
- No real-time collaboration features
- Limited offline support
- Basic search functionality (no advanced filters)

---

## 🚧 Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Advanced filtering and sorting
- [ ] Task comments and attachments
- [ ] Email notifications
- [ ] Export tasks to CSV/PDF
- [ ] Dark mode
- [ ] Drag-and-drop task reordering
- [ ] Calendar view
- [ ] Mobile app (React Native)
- [ ] Backend migration to Node.js/Express

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Contributors

- Development Team

---

## 📞 Support

For issues, questions, or contributions, please open an issue in the repository.

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular task management tools
- Designed for simplicity and efficiency
