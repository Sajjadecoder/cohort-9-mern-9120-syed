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
│                              │
│  Authentication              │
│  Dashboard                   │
│  Notes Management            │
│  Rich Text Editor            │
│  User Profile                │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│       Node.js Backend        │
│                              │
│  Authentication Services     │
│  Note Services               │
│  API Routes                  │
│  Middleware                  │
│  Exception Handling          │
│  JWT Authentication          │
│  Pino Logging                │
└──────────────┬───────────────┘
               │
               │ Sequelize
               ▼
┌──────────────────────────────┐
│      PostgreSQL Database     │
│                              │
│  Users                       │
│  Notes                       │
│  Token Blacklist             │
└──────────────────────────────┘