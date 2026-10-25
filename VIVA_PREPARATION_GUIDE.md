# EduShare — Complete Project & Viva Preparation Guide

This guide breaks down every single file, component, function, and architectural concept in **EduShare**. Read this before your viva to confidently answer any technical questions from faculty or external examiners.

---

## 1. High-Level Architecture Overview

EduShare follows the **MERN Stack Architecture** (MongoDB, Express.js, React, Node.js) with a RESTful API design pattern:

```
[ Browser / Client ]
        │  ▲
        │  │ HTTP / JSON (Axios)
        ▼  │
 [ Express.js Server (Port 5000) ]
        │  ▲
        │  │ Mongoose ODM
        ▼  │
 [ MongoDB Database (Port 27017) ]  +  [ Local Disk Storage (uploads/) ]
```

- **Frontend (Client Layer):** Single Page Application (SPA) built with React 19, Vite, and Tailwind CSS. Managed with React Router DOM for client-side routing and React Context API for global authentication state.
- **Backend (API Layer):** Node.js + Express.js REST API handling JWT authentication, input validation, file uploads via Multer, and database operations.
- **Database Layer:** MongoDB with Mongoose ODM schemas, text-indexing for searches, and relational referencing between Users and Resources.
- **Standalone Presentation Edition (`EduShare-Demo`):** An identical client interface running on Port 5174 that uses an in-browser service layer and `localStorage` to allow zero-dependency live demonstrations.

---

## 2. Backend Files & Functions Breakdown

### 2.1 Server Entry Point
- **File:** `backend/server.js`
  - **Purpose:** Initializes the Express application, sets up middleware, mounts API routes, configures static file serving, and starts the HTTP listener.
  - **Key Functions / Lines:**
    - `cors()`: Cross-Origin Resource Sharing middleware allowing the frontend on port 5173/5174 to communicate with the backend on port 5000.
    - `express.json()`: Built-in body parser for incoming JSON payloads.
    - `app.use('/uploads', express.static(...))`: Serves uploaded PDF/PPT documents statically.
    - `app.listen(PORT, ...)`: Binds and listens for connections on port 5000.

### 2.2 Database Configuration
- **File:** `backend/config/db.js`
  - **Purpose:** Connects the application to the MongoDB instance using Mongoose.
  - **Key Function:** `connectDB()`
    - Calls `mongoose.connect(process.env.MONGO_URI)`.
    - Logs successful connection host or terminates process on critical failure (`process.exit(1)`).

### 2.3 Database Models (Schemas)
- **File:** `backend/models/User.js`
  - **Purpose:** Defines the data structure for registered college students.
  - **Fields:** `name`, `email` (unique index), `password` (hashed), `department`, `year`, `semester`, `role` (default: `'student'`).
- **File:** `backend/models/Resource.js`
  - **Purpose:** Defines the data structure for uploaded academic study materials.
  - **Fields:** `title`, `description`, `department`, `year`, `semester`, `subject`, `type` (Enum: Notes, PYQ, Reference Material, PPT, Lab Manual), `fileName`, `filePath`, `fileSize`, `fileMimeType`, `downloads` (counter), `uploadedBy` (ObjectId referencing User model).
  - **Text Index:** `resourceSchema.index({ title: 'text', subject: 'text', description: 'text' })` enables fast MongoDB full-text queries.

### 2.4 Authentication Controller & Middleware
- **File:** `backend/controllers/authController.js`
  - `register(req, res)`:
    - Validates email and password requirements (min 6 characters).
    - Checks if email already exists in MongoDB.
    - Hashes password using `bcrypt.genSalt(10)` and `bcrypt.hash()`.
    - Creates user document and returns user object + signed JWT token.
  - `login(req, res)`:
    - Finds user by email.
    - Compares plain password with hashed password using `bcrypt.compare()`.
    - If valid, generates JWT signed with `process.env.JWT_SECRET` (expires in 30 days).
  - `getMe(req, res)`:
    - Returns current student profile using decoded token (`req.user._id`).
- **File:** `backend/middleware/authMiddleware.js`
  - `protect(req, res, next)`:
    - Extracts `Bearer <token>` from HTTP `Authorization` header.
    - Verifies token using `jwt.verify()`.
    - Attaches user document to `req.user` (excluding password) before proceeding to route handler.

### 2.5 Resource Controller
- **File:** `backend/controllers/resourceController.js`
  - `upload` (Multer instance):
    - Configures disk storage destination (`backend/uploads/`) and generates collision-resistant filenames (`fieldname-timestamp-random.ext`).
    - Validates file extensions (`.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`).
    - Enforces a 25 MB file size limit.
  - `getAllResources(req, res)`:
    - Reads query parameters: `search`, `department`, `year`, `semester`, `subject`, `type`.
    - Constructs MongoDB query object using regex for fuzzy search and exact matching for filters.
    - Returns sorted results (`createdAt: -1`) populated with student name and department.
  - `getResourceById(req, res)`:
    - Fetches a single document by its `_id` and populates uploader details.
  - `createResource(req, res)`:
    - Handles `multipart/form-data`.
    - Saves academic metadata and Multer file attributes to MongoDB.
  - `downloadResource(req, res)`:
    - Finds resource by `_id`.
    - Atomically increments download counter: `resource.downloads += 1; await resource.save()`.
    - Uses `res.download(filePath, fileName)` to stream document with `Content-Disposition` header.
  - `getMyResources(req, res)`:
    - Queries all resources uploaded by `req.user._id`.
    - Calculates aggregate metrics: personal uploads count, total downloads across user files, and total platform resources.
  - `deleteResource(req, res)`:
    - Checks ownership: verifies `resource.uploadedBy.toString() === req.user._id.toString()`.
    - Deletes physical file from `uploads/` directory using `fs.unlinkSync()`.
    - Removes document from database using `Resource.findByIdAndDelete()`.

### 2.6 Routing Layer
- **File:** `backend/routes/authRoutes.js`: Maps endpoints `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- **File:** `backend/routes/resourceRoutes.js`: Maps `/api/resources` (GET, POST), `/api/resources/my` (GET), `/api/resources/:id` (GET, DELETE), and `/api/resources/:id/download` (GET).

---

## 3. Frontend Files & Components Breakdown

### 3.1 App Shell & Routing
- **File:** `frontend/src/main.jsx`
  - Mounts React root element (`<div id="root">`) into the DOM.
- **File:** `frontend/src/App.jsx`
  - Top-level routing using React Router `Routes` and `Route`.
  - Wraps entire app in `<AuthProvider>` so authentication state is globally accessible.
  - Renders persistent `<Navbar />` at top and clean minimal footer at bottom.
- **File:** `frontend/src/components/ProtectedRoute.jsx`
  - Route guard checking `isAuthenticated`.
  - If authenticated, renders child component (e.g. Dashboard or Upload page); otherwise redirects to `/login` with previous location saved in state.

### 3.2 Global State & API Layer
- **File:** `frontend/src/context/AuthContext.jsx`
  - Creates `AuthContext` using `createContext()` and custom hook `useAuth()`.
  - Stores `user`, `token`, `loading`, and `isAuthenticated` in React state and synchronizes with browser `localStorage`.
  - Provides `login(email, password)`, `register(userData)`, and `logout()` helper functions.
- **File:** `frontend/src/api/api.js`
  - Configures Axios instance with base URL `/api`.
  - **Request Interceptor:** Automatically attaches `Authorization: Bearer <token>` to outgoing requests if token exists in `localStorage`.

### 3.3 UI Components
- **File:** `frontend/src/components/Navbar.jsx`
  - Responsive navigation topbar.
  - Displays brand logo (`logo.png`), navigation links (Home, Resources, Upload).
  - Dynamic user auth state: displays Login/Register buttons when logged out, or Dashboard link + student first name + Logout button when logged in.
  - Includes mobile hamburger menu for phone viewports.
- **File:** `frontend/src/components/ResourceCard.jsx`
  - Reusable card component displaying resource preview.
  - Features:
    - Resource Type pill badge with color coding (Notes, PYQ, Reference Material, PPT, Lab Manual).
    - Publication date and resource title.
    - **Full Department Badge:** Dedicated full-width badge with building icon (`Building2`) displaying complete department name.
    - Subject name and file extension pill (`PDF`, `PPTX`, `DOCX`).
    - Year and semester indicator.
    - Card footer with file size, live download count, and hover animated "View Resource" arrow.

### 3.4 Application Pages
- **File:** `frontend/src/pages/Home.jsx`
  - Landing page.
  - Hero section with headline ("Share. Discover. Learn."), search input bar, and quick subject tags.
  - **Popular Categories Grid:** Direct shortcut cards for Notes, PYQs, Reference Material, PPTs, Lab Manuals.
  - **Trending Resources Grid:** Displays latest 6 uploaded materials.
- **File:** `frontend/src/pages/Resources.jsx`
  - Main resource explorer and repository catalog.
  - **Live Filter Toolbar:**
    - Keyword search input with clear (✕) button.
    - Dropdowns: Department, Year (1st–4th Year), Semester (1–8), Resource Type.
    - Active filter tags allowing one-click removal of active filters.
    - Instant debounced query fetching from API.
- **File:** `frontend/src/pages/ResourceDetails.jsx`
  - Detailed single-document view.
  - Overview section with title, full description, and 4-cell academic metadata grid (Department, Subject, Year & Semester, Uploader).
  - **Document Package Box:** Displays original filename, format badge, file size, and total download count.
  - **Download Button:** Triggers download process and displays `✓ Download completed successfully!`.
- **File:** `frontend/src/pages/UploadResource.jsx`
  - Protected upload form supporting drag-and-drop file selection.
  - Form inputs: Title, Description, Department dropdown, Year dropdown, Semester dropdown, Subject, Category/Type selector.
  - File validation (checks allowed formats and displays file size preview).
  - Submits `FormData` multipart payload with loading spinner.
- **File:** `frontend/src/pages/Dashboard.jsx`
  - Protected student personal dashboard.
  - Welcome banner with student avatar initials, department, and academic year.
  - **3 Metric KPI Cards:** My Uploads, Total Downloads, Total Platform Resources.
  - **My Uploaded Resources Table:** Lists all student's uploads with title, subject, full department name, category, download count, date, and:
    - **View Action:** Direct link to resource.
    - **Delete Action:** Trash icon button opening a confirmation modal to permanently delete the resource.
- **File:** `frontend/src/pages/Login.jsx` & `frontend/src/pages/Register.jsx`
  - Student authentication forms with email validation, error handling alerts, and auto-redirect upon success.

---

## 4. Key Viva Questions & Answers (FAQ)

### Q1: What is the MERN stack and why did you choose it?
> **Answer:** MERN stands for MongoDB, Express.js, React, and Node.js. It allows building full-stack applications using a single language—**JavaScript**—across both client and server. MongoDB provides flexible JSON-like document storage; Express.js is a minimalist server framework; React enables fast, reactive component-based UIs with virtual DOM; and Node.js provides asynchronous, non-blocking I/O ideal for file transfers and concurrent API requests.

### Q2: How does authentication work in this project?
> **Answer:** We use stateless **JWT (JSON Web Token)** authentication:
> 1. When registering or logging in, the server hashes/verifies the password using `bcryptjs` with salt rounds = 10.
> 2. The server signs a JWT containing the user's ID using a secret key and returns it.
> 3. The client stores the token in `localStorage` and automatically attaches it to the `Authorization: Bearer <token>` header on subsequent requests via Axios request interceptors.
> 4. The backend `protect` middleware validates the token signature using `jwt.verify()` before granting access to protected routes like `/upload` or `/dashboard`.

### Q3: How are file uploads handled?
> **Answer:** We use **Multer**, a Node.js middleware for handling `multipart/form-data`. When a student uploads a resource:
> - Multer validates the file extension against allowed academic types (`.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`).
> - It saves the file to the `uploads/` directory on disk with a collision-resistant unique timestamp filename.
> - The filename, original name, MIME type, size, and metadata are recorded in MongoDB in the `Resource` document.

### Q4: How does file downloading work and how is the download counter incremented?
> **Answer:** 
> - When a user clicks Download, an HTTP GET request is sent to `/api/resources/:id/download`.
> - The backend finds the resource in MongoDB and increments the `downloads` count by 1 (`resource.downloads += 1; await resource.save()`).
> - The backend uses Express `res.download(filePath, originalFileName)` which sets the HTTP `Content-Disposition: attachment; filename="..."` header, causing the browser to stream and save the file with its original filename.

### Q5: How is search and filtering implemented?
> **Answer:** Filtering is handled dynamically on the backend:
> - The controller accepts query parameters (`search`, `department`, `year`, `semester`, `subject`, `type`).
> - For text search, case-insensitive regular expressions (`RegExp(search, 'i')`) query across `title`, `subject`, `description`, and `department`.
> - MongoDB indexes are utilized for optimized query execution.
> - Results are returned sorted by latest date (`createdAt: -1`).

### Q6: What is the difference between the main app and `EduShare-Demo`?
> **Answer:** 
> - **Main Project (`frontend/` + `backend/`):** Full production MERN stack requiring MongoDB and Express server to run.
> - **`EduShare-Demo`:** A presentation-ready client build. It replaces network calls with an in-browser storage adapter (`localStorage`), allowing the full frontend UI (search, filters, uploads, deletion, dashboard metrics, download feedback) to be demonstrated smoothly without needing server processes running.

### Q7: Why did you use React Context API instead of Redux?
> **Answer:** For an MVP of this scope, global state is primarily needed for **Authentication** (`user`, `token`, `login`, `logout`). The built-in **React Context API** (`createContext`, `useContext`) provides a clean, lightweight solution with zero external bundle overhead, avoiding the boilerplate actions, reducers, and store setup required by Redux.

### Q8: What database relationships exist in MongoDB?
> **Answer:** EduShare uses a **One-to-Many relational reference**:
> - Each `Resource` document contains an `uploadedBy` field with type `mongoose.Schema.Types.ObjectId` referencing the `User` model.
> - When fetching resources, Mongoose `.populate('uploadedBy', 'name email department year')` performs a join to include uploader details without duplicating user data in each resource document.

---

## 5. Quick Reference Checklist for Presentation

1. **Start the demo:** Run `npm run dev` inside `EduShare-Demo` (opens at `http://localhost:5174`).
2. **Show the Home Page:**
   - Point out clean typography, modern brand logo, and category cards (Notes, PYQs, Reference Material, PPTs, Lab Manuals).
3. **Show Resource Listing & Search:**
   - Filter by **Computer Science** and **Semester 4** to demonstrate syllabus-focused filtering.
   - Search for *"Operating Systems"* to demonstrate live filtering.
4. **Show Resource Details & Download:**
   - Open a resource to show the metadata grid (Department, Subject, Year/Semester, Uploader).
   - Click **Download Resource** to demonstrate instant download feedback and download counter increment.
5. **Show Student Dashboard & Uploads:**
   - Show student profile (*Aryan Sharma*), upload counter, and total download statistics.
   - Point out the full department name column in the uploads table.
6. **Show Delete Functionality:**
   - Click the **Trash** icon on an upload to display the confirmation modal, delete the item, and show real-time stats updating.
