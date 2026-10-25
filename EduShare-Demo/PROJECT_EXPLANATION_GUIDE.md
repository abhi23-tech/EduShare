# EduShare (Presentation Edition) — Complete Code & Viva Guide

This document is your complete cheat-sheet for presenting the **EduShare** application. It explains every file, function, and state mechanism so you can explain exactly how the code works during your review or viva.

---

## 1. Project Architecture

This edition is built as a **Client-Side Single Page Application (SPA)** using **React 19, Vite, and Tailwind CSS**. 

Instead of requiring an external database and server process to be running during a presentation, the application uses an **In-Browser Persistence Layer (Service Layer + Web Storage API)**:

```
[ React Components (Pages & Cards) ]
                 │  ▲
                 │  │ Async Service Calls (api.get, api.post, api.delete)
                 ▼  │
      [ Service Layer (src/api/api.js) ]
                 │  ▲
                 │  │ JSON Serialization
                 ▼  │
 [ Browser LocalStorage ]  +  [ Initial Dataset (academicData.js) ]
```

### Why this design is effective for review:
1. **100% Reliable:** Zero risk of database connection drops, port conflicts, or network timeouts during your presentation.
2. **True State Persistence:** When you upload or delete a resource, it persists across browser reloads via `localStorage`.
3. **Identical Frontend Code:** All React hooks (`useState`, `useEffect`, `useParams`, `useNavigate`), Tailwind styling, routing guards, and UX interactions are identical to production.

---

## 2. File-by-File & Function Breakdown

### 2.1 Service Layer & Data Store

#### File: `src/data/academicData.js`
- **Purpose:** Acts as the initial seed repository.
- **Key Exports:**
  - `INITIAL_USER`: Pre-configured 2nd Year, Semester 4 Computer Science student (*Aryan Sharma*).
  - `INITIAL_RESOURCES`: Array of realistic academic materials across 5 categories:
    - **Notes:** *Operating Systems - Process Synchronization & CPU Scheduling*
    - **PYQ:** *Design & Analysis of Algorithms - End Sem 2025*
    - **Reference Material:** *DBMS - Normalization & SQL Optimization*
    - **PPT:** *Computer Architecture - Memory Hierarchy & Pipelining*
    - **Lab Manual:** *OS Laboratory - Shell Scripting & POSIX Threads*

#### File: `src/api/api.js`
- **Purpose:** Central service layer mimicking an API client (Axios drop-in replacement).
- **Key Functions:**
  - `getStoredResources()`: Reads `edushare_resources` from `localStorage`. If empty, loads `INITIAL_RESOURCES` and saves them to storage.
  - `saveStoredResources(resources)`: Serializes resources array back into `localStorage`.
  - `getStoredUser()` / `saveStoredUser(user)`: Manages current student profile in storage.
  - `sleep(ms = 120)`: Returns a Promise resolving after 120ms to provide natural async UI transitions (spinners, loading skeletons).
  - **`api.get(url, config)`**:
    - `'/auth/me'`: Returns logged-in student profile.
    - `'/resources/my'`: Filters resources uploaded by current student and calculates aggregate stats (`myUploads`, `totalDownloads`, `totalPlatformResources`).
    - `'/resources/:id'`: Finds and returns a single document by its `_id`.
    - `'/resources'`: Multi-parameter query handler. Performs case-insensitive matching across `title`, `subject`, `description`, and `department`, plus exact filtering on `year`, `semester`, and `type`.
    - `'/resources/:id/download'`: Increments download count in storage and generates a downloadable PDF blob.
  - **`api.post(url, data)`**:
    - `'/auth/login'`: Authenticates student and saves session token.
    - `'/auth/register'`: Creates a new student record.
    - `'/resources'`: Extracts fields from `FormData` or object, generates unique `_id` (`res-upload-timestamp`), prepends to resources array, and saves to storage.
  - **`api.delete(url)`**:
    - `'/resources/:id'`: Filters out the resource with matching ID from `localStorage`.

---

### 2.2 Global State & Authentication

#### File: `src/context/AuthContext.jsx`
- **Purpose:** Provides global user authentication state across all components without prop drilling.
- **Key Functions:**
  - `initializeAuth()`: Runs once on app load (`useEffect`). Checks `localStorage` for `edushare_token` and `edushare_user`. If not present, initializes default student (*Aryan Sharma*) so the dashboard and uploads are immediately populated for review.
  - `login(email, password)`: Updates auth state and stores credentials.
  - `register(userData)`: Registers a new student and sets active session.
  - `logout()`: Clears user session and resets auth state.
  - `useAuth()`: Custom hook allowing any component to access `user`, `isAuthenticated`, `login`, and `logout`.

#### File: `src/components/ProtectedRoute.jsx`
- **Purpose:** Route guard wrapper.
- **Logic:** Checks `isAuthenticated`. If true, renders child pages (`/dashboard`, `/upload`). If false, redirects user to `/login`.

---

### 2.3 Navigation & Shared Components

#### File: `src/components/Navbar.jsx`
- **Purpose:** Header bar visible across all pages.
- **Key Elements:**
  - Brand Logo (`/logo.png`) and title.
  - Navigation links with active page highlighting (`NavLink`).
  - Conditional authentication display:
    - If logged in: Shows student first name badge, Dashboard button, and Logout button.
    - If logged out: Shows "Sign In" and "Register" buttons.
  - Mobile responsive toggle menu (`Menu` / `X` icons).

#### File: `src/components/ResourceCard.jsx`
- **Purpose:** Reusable academic resource card used in Home and Catalog grids.
- **Key Elements & Functions:**
  - `getTypeBadge(type)`: Returns curated pastel badge styles based on category (`Notes`, `PYQ`, `Reference Material`, `PPT`, `Lab Manual`).
  - `formatBytes(bytes)`: Converts raw byte numbers into readable `KB` or `MB`.
  - **Full Department Display:** Dedicated badge row with building icon (`Building2`) rendering the complete department name (*Computer Science*, *Information Technology*, etc.).
  - Title, Subject, File Extension pill (`PDF`, `PPTX`), Year/Semester indicators, and live download count.

---

### 2.4 Page Components

#### File: `src/pages/Home.jsx`
- **Purpose:** Application landing and overview page.
- **Key Features:**
  - **Hero Section:** Headline ("Share. Discover. Learn."), search form with redirect to `/resources?search=...`, and trending subject chips (DBMS, Computer Networks, OS, DSA).
  - **Popular Categories:** 5 interactive cards (Notes, PYQs, Reference Material, PPTs, Lab Manuals) that navigate directly to filtered catalog views.
  - **Trending Resources Grid:** Fetches and displays latest materials using `ResourceCard`.

#### File: `src/pages/Resources.jsx`
- **Purpose:** Academic material catalog and search engine.
- **Key State Variables:**
  - `search`, `department`, `year`, `semester`, `type`: Form filter states synchronized with URL query params (`useSearchParams`).
  - `resources`: Array of materials matching active criteria.
  - `loading`: Shows animated skeleton placeholder cards while fetching.
- **Key Features:**
  - Debounced search queries.
  - Active filter chips allowing one-click removal of individual filters.
  - "Reset all filters" button when no results match.

#### File: `src/pages/ResourceDetails.jsx`
- **Purpose:** Complete view of a single study material.
- **Key Functions:**
  - `fetchResource()`: Retrieves resource details by ID from route params (`useParams`).
  - `handleDownload()`:
    1. Sets `downloading = true` with spinner and *"Downloading Material..."*.
    2. Simulates 600ms network processing delay.
    3. Increments download counter in `localStorage` and component state.
    4. Displays green confirmation banner: **`✓ Download completed successfully!`**.
    5. Does **not** download cluttering files to browser disk, keeping the evaluation clean.
  - **Metadata Grid:** 4-cell overview showing Department, Subject, Year & Semester, and Uploaded By student name.

#### File: `src/pages/UploadResource.jsx`
- **Purpose:** Document upload and publication interface.
- **Form Fields:** Title, Description, Department (defaulted to student's department), Academic Year, Semester, Subject, and Category/Type.
- **File Picker:** Supports drag-and-drop or click to browse with extension validation.
- **Submission:** Submits payload to `api.post('/resources')`, updates local repository, and redirects to Dashboard.

#### File: `src/pages/Dashboard.jsx`
- **Purpose:** Student profile and upload management center.
- **Key State & Functions:**
  - `stats`: Displays 3 metric cards (**My Uploads**, **Total Downloads**, **Total Platform Resources**).
  - `myResources`: List of documents uploaded by the student.
  - **Delete Feature (`handleDeleteResource`):**
    - Clicking the **Trash** icon (`Trash2`) on any row opens a confirmation modal.
    - User confirms deletion: calls `api.delete('/resources/:id')`.
    - Automatically removes row, updates metric cards in real time, and shows success alert banner.

---

## 3. Potential Viva Questions & Smart Answers

### Q1: How does this application store and retrieve data?
> **Answer:** "The application uses a modular service architecture in `api.js`. When the app loads, it initializes the repository state in the browser's `localStorage` using the structured academic dataset in `academicData.js`. All operations—such as querying with filters, uploading new notes, and deleting items—operate through asynchronous service promises and persist directly in `localStorage`."

### Q2: Why is the service layer in `api.js` structured like Axios?
> **Answer:** "It follows the **Adapter Pattern**. By designing `api.js` with the exact same interface (`api.get`, `api.post`, `api.delete`, returning `{ data: { success, ... } }`), the entire React component tree remains 100% clean and decoupled. The components make standard asynchronous requests without knowing whether the data is coming from a remote server or local persistence."

### Q3: How does the search and multi-parameter filtering work?
> **Answer:** "In `Resources.jsx`, filter states (`department`, `year`, `semester`, `type`, and `search`) are tracked with React state and synced with URL parameters. The service layer applies multi-criteria filtering: it performs case-insensitive regex/substring matching across Title, Subject, Description, and Department, while applying exact matches for category, year, and semester."

### Q4: How does the delete operation ensure data consistency?
> **Answer:** "In `Dashboard.jsx`, when the user confirms deletion in the modal, the item ID is passed to `api.delete('/resources/:id')`. The service layer filters out the record from `localStorage`. Upon success, the component updates local state using functional state setters: it filters `myResources` and atomically decrements `myUploads` and `totalPlatformResources` so the metric cards update immediately."

### Q5: How is authentication managed across page reloads?
> **Answer:** "We use React Context API in `AuthContext.jsx`. The student session token and user profile are saved in `localStorage`. On application startup, `useEffect` reads the stored credentials and populates global state. Protected routes (`ProtectedRoute.jsx`) check `isAuthenticated`; if a student logs out, the token is cleared and navigation redirects to the login screen."

---

## 4. Live Presentation Flow (Follow These Steps in Viva)

| Step | What to Click / Show | What to Say to Faculty |
| :--- | :--- | :--- |
| **1. Overview** | Home Page (`http://localhost:5174/`) | *"EduShare is a peer-to-peer academic resource repository where students share syllabus-specific materials."* |
| **2. Categories** | Click **Reference Material** card on Home | *"Students can filter materials by categories like Notes, PYQs, and Reference Materials."* |
| **3. Search** | In Resources, select **Computer Science** and **Semester 4** | *"Students can easily find materials specific to their exact department and current semester."* |
| **4. Document View** | Click **View Resource** on *Operating Systems* | *"Each document has an academic metadata card showing department, subject, year, semester, and verified status."* |
| **5. Download** | Click **Download Resource** button | *"Clicking download provides real-time verification feedback and updates the platform download counter."* |
| **6. Dashboard** | Click **Dashboard** in the top navbar | *"The student dashboard shows personal contribution statistics—uploads count and total downloads received."* |
| **7. Deletion** | Click **Trash** icon on an upload and confirm | *"Students can manage their uploads with confirmation dialogs, updating repository metrics in real time."* |
| **8. Upload** | Click **+ Add Resource**, fill details, and submit | *"Uploading a resource publishes it immediately with category tagging and department visibility."* |
