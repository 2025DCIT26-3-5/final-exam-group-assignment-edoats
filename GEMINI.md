# Project: CVSked (ScheduleApp)

## Overview
CVSked is a modern, offline-first mobile scheduling application designed for students, featuring a "Dark Academia" aesthetic. It moves away from traditional calendars to a block-based scheduling system.

## Technology Stack
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State Management:** Zustand
- **Persistence:** AsyncStorage (Local Storage)
- **Navigation:** React Navigation (Native Stack & Bottom Tabs)
- **UI Component Library:** React Native Paper (Material Design)
- **Styling:** React Native Paper Theming & StyleSheet
- **Notifications:** Expo Notifications (Local)
- **File Handling:** Expo Print (PDF), Expo Sharing/FileSystem (JSON Export/Import)
- **Icons:** MaterialCommunityIcons

## Visual Design System ("Dark Academia")
- **Theme Mode:** Primarily Dark Mode by default.
- **Color Palette:**
  - **Background:** `#121212` (Deep Charcoal/Black)
  - **Surface/Cards:** `#252525` (Dark Gray)
  - **Primary Text:** `#E0E0E0` (Off-white)
  - **Secondary Text:** `#A0A0A0` (Muted Gray)
  - **Brand/Secondary Color:** `#057b06` (Cavite State University Green)
  - **Course Accents:** Muted Pastels (Sage, Clay, Desaturated Purple)
- **Typography:**
  - **Headings:** Serif (Prestige/Academia feel)
  - **Body:** Sans-Serif (Clean readability)

## Functional Requirements

### 1. Scheduling System (Core)
- **Grid View:** A visual timetable (Monday-Saturday, Time Intervals).
- **Block Interaction:** Create, Edit, Delete course blocks.
- **Conflict Detection:** Visual warning for overlapping blocks.

### 2. Course Management
- **Data Fields:** Course Code, Subject Name, Instructor, Color.
- **Search:** Filter courses from a local list.

### 3. Notifications
- **Custom Alarms:** Push notifications triggered `N` minutes before class starts.

### 4. Notes
- **Context:** Attach notes to specific blocks (e.g., "Quiz on Friday").

### 5. Sharing & Export
- **JSON Export/Import:** Share schedule configurations between users.
- **PDF Export:** Generate a clean, printer-friendly version of the schedule.

### 6. Authentication (Local)
- **Mock Auth:** Secure login flow persisting user session locally.

## Architecture
- **`src/components`**: Reusable UI (ScheduleGrid, CourseCard, CustomInput).
- **`src/screens`**: Login, Dashboard (Grid), CourseList, Settings.
- **`src/store`**: Zustand stores (`useScheduleStore`, `useAuthStore`, `useThemeStore`).
- **`src/utils`**: Date helpers, PDF generator, File handlers.
- **`src/theme`**: Custom React Native Paper theme definition.
