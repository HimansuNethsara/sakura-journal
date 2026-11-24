<h1 align="center">🌸 Sakura Journal</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <strong>Sakura Journal</strong> is a mobile-first personal organization application built with React Native and Expo. It features secure account creation, task management with date-aware tracking, and structured note-taking.
</p>

> *Note: This is one of my early foundational projects, built to explore cross-platform mobile development, local data persistence, and REST API integration. It served as a stepping stone to my later enterprise-grade applications.*

---

## 📖 Overview

**Sakura Journal** is a productivity app designed to help users manage their daily tasks and notes in one place. It uses a component-based React Native architecture with `AsyncStorage` for robust offline persistence. User authentication and profile management are handled via an external HTTP backend API, while local state is managed securely via React Context.

## ✨ Key Features

### 🔐 Authentication & Profiles
- Email/password sign-in and account creation.
- Custom profile creation (full name, birthday, avatar upload).
- Persistent login sessions via `AsyncStorage`.
- Frontend password-strength validation.

### 📝 Task Management (To-Do)
- Create, edit, complete, and delete tasks.
- Due-date and time tracking with automated overdue detection (checks every 30 seconds).
- Swipe actions and animated forms.
- Active, Completed, and Archived task views.

### 📚 Note Management
- Create and edit rich text notes.
- Move notes to Archive or Trash (Bin).
- Restore or permanently delete notes.
- Modal-based editing interface.

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React Native, Expo, TypeScript |
| **Navigation** | React Navigation (Native Stack, Bottom Tabs) |
| **Local Storage** | `@react-native-async-storage/async-storage` |
| **UI/UX** | React Native Gesture Handler, Expo Image Picker, Custom Alerts |
| **Backend** | External Java/REST API (via Ngrok during development) |

## 🏗️ System Architecture

The application follows a **client-server, component-based architecture**:

1. **Entry Point (`App.tsx`):** Restores user sessions from `AsyncStorage` and wraps the app in an `AuthContext`.
2. **Routing:** Unauthenticated users are routed to the Sign-In/Sign-Up stack, while authenticated users see the main Bottom Tab navigation.
3. **Data Persistence:** Tasks and Notes are stored locally as JSON strings in `AsyncStorage`.
4. **Backend Communication:** Sign-in and registration make `POST` requests to a remote HTTP backend to verify credentials and fetch profile images.

## 🗄️ Data Models

### User Profile
- **full_name**: string
- **username**: string
- **email**: string
- **profile_image**: string

### Task Entity (Stored in AsyncStorage)
- **id**: string
- **title**: string
- **description**: string
- **dueDate**: string
- **status**: "pending" | "completed" | "archived"

### Note Entity (Stored in AsyncStorage)
- **id**: string
- **title**: string
- **description**: string
- **status**: "active" | "archived" | "bin"

## 🚀 Known Limitations & Future Enhancements

*(Note: As an early foundational project, the following production-level improvements were identified for future iterations).*
- [ ] **Security:** Implement JWT or OAuth token handling (current auth trusts locally cached user data without server-side token validation).
- [ ] **Security:** Encrypt local `AsyncStorage` data for sensitive user info.
- [ ] **Infrastructure:** Replace the hard-coded Ngrok URL with dynamic environment variables.
- [ ] **Features:** Add Cloud Sync so tasks and notes synchronize across multiple devices.
- [ ] **UX:** Add offline-state handling and confirmation dialogs for permanent deletion.

## 👨‍💻 Author

**Himansu Nethsara Ranasinghe**
- 🎓 BSc (Hons) Software Engineering Undergraduate (JIAT / BCU)
- 🔗 [LinkedIn](https://www.linkedin.com/in/himansu-nethsara/)
- 🐙 [GitHub](https://github.com/HimansuNethsara)