# 📝 Notes App

A full-stack **Node.js + React.js Notes Management Application** built with **Node.js, React.js, and PostgreSQL**. The application allows authenticated users to securely create, view, search, edit, and delete their personal notes through a responsive React interface.

The project also incorporates **JWT-based authentication, password hashing, rich-text note editing, structured application logging, centralized exception handling, unit testing, Git version control, and SonarQube code-quality analysis**.

---

## 🚀 Project Overview

The Notes App provides a secure and user-friendly platform for managing personal notes.

Users can:

- Create an account and securely log in
- Access a personalized dashboard
- Create and manage notes
- Edit notes using rich-text content
- Search through their notes
- View individual notes
- Delete notes
- View their account information
- Log out securely

Each note is associated with its authenticated user, ensuring that users can only access and modify their own notes.

The backend follows a service-oriented architecture with dedicated authentication and note-management logic, while the React frontend provides an interactive user interface.

---

## ✨ Key Features

### 🔐 User Authentication & Authorization

- User registration and login
- JWT-based authentication
- Secure password hashing using **bcrypt**
- Password validation with:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Email format validation
- Duplicate email detection
- Authentication-protected note operations
- Secure logout through JWT token blacklisting
- User profile retrieval

### 📒 Note Management

Authenticated users can:

- Create notes
- View all their notes
- View an individual note
- Update existing notes
- Delete notes
- Search notes by title
- Automatically associate notes with their owner
- Work with rich-text note content

Notes are ordered by their most recently updated time, making recently modified notes easier to access.

### 🔎 Note Search

The application provides note searching functionality.

Users can search their notes using a search query, with matching performed against note titles.

### 📝 Rich Text Editing

Notes support rich-text content, providing a more flexible editing experience than a traditional plain-text input.

This allows users to create notes with formatted content through the application's editor.

### 📊 User Dashboard

The React frontend provides a centralized dashboard where authenticated users can:

- View their notes
- Search notes
- Create new notes
- Open existing notes
- Edit notes
- Delete notes
- Access their profile
- Log out

### 📋 Application Logging

The backend uses **Pino Logger** for structured application logging.

Important application events are logged, including:

- User registration
- Successful login
- Failed login attempts
- Note creation
- Note updates
- Note deletion
- Token revocation
- Application exceptions

Logs include relevant contextual information such as user IDs and note IDs where appropriate.

### ⚠️ Centralized Exception Handling

The backend implements centralized exception handling through middleware and a custom `ApiError` utility.

The application validates requests and returns meaningful HTTP errors for situations such as:

- Missing required fields
- Invalid email addresses
- Weak passwords
- Duplicate accounts
- Invalid credentials
- Invalid note IDs
- Unauthorized note access
- Missing notes
- Invalid note content

Exceptions are also logged through the application's logging system.

### 🛡️ Ownership & Access Control

Notes are explicitly associated with their owning user.

Before accessing, modifying, or deleting a note, the backend verifies:

1. The supplied note ID is valid.
2. The note exists.
3. The note belongs to the authenticated user.

This prevents users from accessing or modifying another user's notes.

### 🧪 Testing

The project incorporates automated testing to verify critical application functionality.

Testing technologies include:

- **Jest** for frontend testing
- **Mocha/Chai** for backend testing

Testing focuses on important application behavior such as authentication, services, controllers, and data-access functionality.

### 📈 SonarQube Integration

**SonarQube** is integrated into the project for static code analysis and quality monitoring.

It helps identify:

- Bugs
- Code smells
- Maintainability issues
- Potential vulnerabilities
- Code-quality problems

This provides an additional layer of quality control beyond automated tests.

### 🔀 Git Version Control

Git is used for source-code management and collaborative development.

The project follows a branch-based development workflow to support:

- Feature development
- Testing
- Code reviews
- Merging
- Version tracking

---

## 🛠️ Technology Stack

### Frontend

- **React.js**
- JavaScript
- HTML5
- CSS
- Rich Text Editor

### Backend

- **Node.js**
- **Express.js**
- JavaScript
- RESTful APIs
- JWT Authentication
- bcrypt

### Database

- **PostgreSQL**
- **Sequelize ORM**

The database stores user accounts, notes, and revoked authentication tokens.

### Development & Quality Tools

- **Pino** — Application logging
- **Jest** — Frontend testing
- **Mocha/Chai** — Backend testing
- **SonarQube** — Static code analysis
- **Git** — Version control

---

## 🏗️ Application Architecture

The application follows a **client-server architecture**.

```text
┌──────────────────────────────┐
│        React Frontend        │
│                               │
│  Authentication               │
│  Dashboard                    │
│  Notes Management             │
│  Rich Text Editor             │
│  User Profile                 │
└──────────────┬────────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│       Node.js Backend        │
│                               │
│  Authentication Services      │
│  Note Services                │
│  API Routes                   │
│  Middleware                   │
│  Exception Handling           │
│  JWT Authentication           │
│  Pino Logging                 │
└──────────────┬────────────────┘
               │
               │ Sequelize
               ▼
┌──────────────────────────────┐
│      PostgreSQL Database     │
│                               │
│  Users                        │
│  Notes                        │
│  Token Blacklist              │
└──────────────────────────────┘
```

---

## 🔑 Authentication Flow

The authentication system uses JSON Web Tokens (JWT).

### Registration

1. User submits name, email, and password.
2. Backend validates the supplied information.
3. The email is checked for an existing account.
4. Password is hashed using bcrypt.
5. User account is stored in the database.
6. A successful registration response is returned.

### Login

1. User submits email and password.
2. Backend searches for the corresponding account.
3. Password is compared against the stored bcrypt hash.
4. A JWT is generated after successful authentication.
5. The token is returned to the frontend.
6. Authenticated requests use the token for authorization.

### Logout

When a user logs out, their JWT is added to a token blacklist along with its expiration time.

Subsequent authentication middleware can use the blacklist to reject revoked tokens.

---

## 📡 Core API Functionality

The backend exposes REST APIs for authentication and note management.

### Authentication

| Operation | Description |
|---|---|
| Register | Create a new user account |
| Login | Authenticate an existing user |
| Get Profile | Retrieve authenticated user information |
| Logout | Revoke the current authentication token |

### Notes

| Operation | Description |
|---|---|
| Create | Create a new note |
| Get All | Retrieve the authenticated user's notes |
| Get By ID | Retrieve a specific owned note |
| Update | Modify an existing note |
| Delete | Delete an existing note |
| Search | Search notes by title |

All note-management operations are protected and scoped to the authenticated user.

---

## 🗄️ Database Design

The application uses PostgreSQL with Sequelize as its ORM.

The primary data entities include:

### User

Stores user account information such as:

- User ID
- Name
- Email
- Hashed password
- Account creation timestamp

### Note

Stores user-created notes including:

- Note ID
- Title
- Content
- Owner/User ID
- Creation timestamp
- Last updated timestamp

### Token Blacklist

Stores revoked JWTs to support secure logout and token invalidation.

The relationship between users and notes ensures that every note belongs to a specific authenticated user.

---

## 🔒 Security

Security is an important part of the application.

The project implements:

- Password hashing with bcrypt
- JWT-based authentication
- JWT token expiration
- Token blacklisting on logout
- User-specific note ownership checks
- Input validation
- Email validation
- Password-strength validation
- UUID validation for note identifiers
- Centralized exception handling
- Structured security-related logging

Passwords are never stored in plaintext.

---

## 🖥️ Application Screens

### 1. Sign Up / Log In

Provides authentication screens for:

- User registration
- Existing-user login
- Authentication validation
- Redirecting authenticated users to the main application

### 2. Dashboard

The main notes-management screen provides:

- User-specific note listing
- Note search
- Create-note functionality
- Navigation to individual notes
- Note editing and deletion

### 3. Note Editor

The note editor provides:

- Note title
- Rich-text content editing
- Save functionality
- Cancel functionality
- Creation of new notes
- Editing of existing notes

### 4. User Profile

The profile section provides:

- User information
- Account details
- Logout functionality

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/10pshine-cohort-9/cohort-9-mern-9120-syed
cd https://github.com/10pshine-cohort-9/cohort-9-mern-9120-syed
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional environment variables required by your local configuration.

> Never commit `.env` files or production secrets to Git.

### 5. Configure PostgreSQL

Create a PostgreSQL database and configure the database connection using the backend environment variables.

Run the required database migrations or setup scripts provided by the project.

### 6. Start the Backend

```bash
npm run dev
```

### 7. Start the Frontend

From the frontend directory:

```bash
npm run dev
```

The React application can then be accessed through the local development URL provided by Vite.

---

## 🧪 Testing

### Backend

Backend tests use Mocha/Chai.

```bash
npm test
```

### Frontend

Frontend tests use Jest.

```bash
npm test
```

Test coverage can also be generated using the project's configured testing scripts.

---

## 📊 Code Quality

SonarQube is used to continuously analyze the project and identify potential quality and security issues.

The analysis covers JavaScript code and can be used to monitor:

- Reliability
- Security
- Maintainability
- Code smells
- Bugs
- Test coverage

---

## 🔄 Typical User Workflow

```text
Register
   │
   ▼
Login
   │
   ▼
Dashboard
   │
   ├───────────────┐
   │               │
   ▼               ▼
Create Note     Search Notes
   │               │
   ▼               ▼
Note Editor     Open Note
   │               │
   └───────┬───────┘
           ▼
        Edit Note
           │
           ▼
       Save Changes
           │
           ▼
        Dashboard
           │
           ▼
         Logout
```

---

## 🎯 Project Objectives

This project was developed to demonstrate practical implementation of a modern full-stack web application while following software engineering best practices.

The main objectives are to demonstrate:

- Full-stack JavaScript development
- REST API development
- Secure user authentication
- Relational database integration
- ORM-based database operations
- User-specific data access
- Rich-text content management
- Structured application logging
- Centralized error handling
- Automated testing
- Static code-quality analysis
- Git-based development workflow

---

## 🔮 Potential Future Enhancements

The architecture can be extended with additional functionality such as:

- Real-time note synchronization using Socket.IO
- Note export and import
- Advanced search and filtering
- Note categories and tags
- Note sharing
- Pagination
- Sorting and filtering options
- Password reset functionality
- Email verification
- Refresh-token authentication
- Enhanced user profile management

---

## 👨‍💻 Development

The project follows a separation of concerns between the frontend, backend services, database layer, authentication, logging, and error handling.

This makes the application easier to test, maintain, extend, and deploy as additional functionality is introduced.