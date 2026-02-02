# Crudzaso - Task Manager

A modern task management application with a beautiful UI, built with vanilla JavaScript and json-server.

## Features

### Authentication
- ✅ Login with email and password
- ✅ Registration with complete user profile (name, email, phone, department, password)
- ✅ Automatic role assignment (users register as "client", admins must be created manually)
- ✅ Session management with localStorage tokens

### User Interface
- ✅ Gmail-like layout with persistent sidebar and topbar
- ✅ Smooth navigation between views without page reloads
- ✅ Responsive design for desktop and mobile devices
- ✅ Modern, clean UI inspired by contemporary design patterns

### Task Management
- ✅ Dashboard overview with task statistics
- ✅ Create, read, update, and delete (CRUD) tasks
- ✅ Task prioritization (low, medium, high)
- ✅ Task status tracking (pending, in_progress, completed, blocked)
- ✅ Search functionality
- ✅ Inline status updates
- ✅ Soft delete (tasks marked as "annulled")

### Admin Features
- ✅ Admin-only access to annulled tasks view
- ✅ View all tasks from all users
- ✅ Role-based access control

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WhiteRabbitCoder/mjm.git
cd mjm
```

2. Install json-server globally:
```bash
npm install -g json-server
```

### Running the Application

1. Start the json-server backend:
```bash
npm run server
```
This will start the API on http://localhost:3000

2. In a separate terminal, start a web server to serve the frontend:
```bash
python3 -m http.server 8080
```
Or use any other static file server like:
```bash
npx http-server -p 8080
```

3. Open your browser and navigate to:
```
http://localhost:8080
```

### Default Admin Account

You can log in with the default admin account:
- Email: `admin@test.com`
- Password: `password123`

## Project Structure

```
mjm/
├── index.html              # Main HTML file
├── main.js                 # Application entry point
├── styles.css              # Global styles
├── src/
│   ├── app.js             # Application initialization
│   ├── components/        # Reusable UI components
│   │   ├── Sidebar.js
│   │   ├── Topbar.js
│   │   ├── PageHeader.js
│   │   ├── StatsCard.js
│   │   ├── StatsGrid.js
│   │   └── TaskTable.js
│   ├── views/             # Page views
│   │   ├── login.js       # Login page (full view)
│   │   ├── register.js    # Register page (full view)
│   │   ├── dashboard.js   # Dashboard view
│   │   ├── mytasks.js     # Task management view
│   │   └── annulled.js    # Admin-only annulled tasks view
│   ├── services/          # API communication layer
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   └── userService.js
│   ├── state/             # State management
│   │   ├── store.js       # Global state store
│   │   └── db.json        # json-server database
│   ├── router/            # Client-side routing
│   │   └── router.js
│   └── utils/             # Helper functions
│       ├── constants.js
│       └── taskHelper.js
```

## Architecture

### State Management
The application uses a centralized store pattern. All state mutations go through the store, which notifies subscribers of changes. This enables reactive UI updates.

### Routing
Client-side routing using hash-based URLs with guards for:
- Authentication requirements
- Role-based access control
- Public-only pages (login/register)

### Component Pattern
Views return DOM elements that are dynamically inserted into the page. Event listeners are preserved, enabling interactive functionality.

## API Endpoints

The json-server provides the following endpoints:

- `GET /users` - Get all users (admin only)
- `GET /users?email={email}` - Find user by email
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user

- `GET /tasks` - Get all tasks (admin) or user's tasks
- `GET /tasks?userId={userId}` - Get tasks for specific user
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Soft delete task (sets status to 'annulled')

## Data Models

### User
```json
{
  "id": "unique-id",
  "name": "Full Name",
  "email": "user@example.com",
  "phone": "555-1234",
  "password": "hashed-password",
  "role": "admin|client",
  "department": "Engineering",
  "createdAt": "ISO-8601-timestamp"
}
```

### Task
```json
{
  "id": "unique-id",
  "title": "Task Title",
  "description": "Task description",
  "priority": "low|medium|high",
  "status": "pending|in_progress|completed|blocked|annulled",
  "dueDate": "ISO-8601-timestamp",
  "userId": "owner-user-id",
  "createdAt": "ISO-8601-timestamp",
  "updatedAt": "ISO-8601-timestamp"
}
```

## Development

### Adding a New View

1. Create a new file in `src/views/`
2. Export a function that returns a DOM element
3. Register the route in `src/app.js`
4. Add navigation link in `Sidebar.js` if needed

### Adding a New Component

1. Create a new file in `src/components/`
2. Export a function that returns a DOM element
3. Import and use in your views

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

## Contributors

- WhiteRabbitCoder
