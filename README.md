# EduShare - Academic Resource Sharing Platform (MERN Stack MVP)

EduShare is a peer-to-peer academic resource sharing web application designed for college students. It allows students to upload, discover, search, filter, and download lecture notes, previous-year question papers (PYQs), reference material, presentations (PPTs), and practical lab manuals.

---

## 1. Project Overview

During academic semesters, college students often struggle to locate organized syllabus-specific notes and previous-year question papers. **EduShare** solves this problem by providing a centralized, student-driven academic repository with fast search, department-level filtering, and one-click file downloads.

### Core MVP Features
- **User Registration & Login:** Full bcrypt password hashing and JWT token authentication.
- **Student Dashboard:** Personalized overview displaying student details, upload count, and total resource metrics.
- **Resource Upload:** Multipart file upload supporting PDFs, Word documents, and PPT slides with academic metadata (Department, Year, Semester, Subject, Resource Type).
- **Resource Listing & Catalog:** Dynamic catalog connected directly to MongoDB.
- **Live Search:** Instant search across titles, subjects, descriptions, and departments.
- **Multi-parameter Filtering:** Filter by Department, Year, Semester, and Resource Type.
- **Resource Details & Metrics:** Detailed view of file format, uploader, description, and live download counters.
- **File Download:** Direct download stream incrementing download counters in MongoDB.
- **Route Protection:** Protected routes for Student Dashboard and Resource Upload.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **File Storage:** Local disk storage engine (`backend/uploads/`) with Multer (designed with clean abstraction for future Supabase/S3 integration)

---

## 3. Project Structure

```
EduShare/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ResourceCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── ResourceDetails.jsx
│   │   │   ├── UploadResource.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Resource.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── resourceRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── resourceController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── uploads/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 4. Architecture Pattern

The backend strictly follows a simple, maintainable MVC pattern:

$$\text{Route} \longrightarrow \text{Controller} \longrightarrow \text{Model} \longrightarrow \text{MongoDB}$$

---

## 5. Prerequisites & Environment Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`

### Backend Environment Variables (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/edushare
JWT_SECRET=edushare_super_secret_jwt_key_2025_college_review
NODE_ENV=development
```

---

## 6. Installation & Running the Project

### Step 1: Clone or Navigate to the Project
```bash
cd EduShare
```

### Step 2: Setup Backend
```bash
cd backend
npm install
npm run dev
# or: node server.js
```
The backend will run on `http://localhost:5000`.

### Step 3: Setup Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

---

## 7. User Registration & Usage

Users can create fresh accounts via the **Register** page (`/register`) to start uploading and sharing academic resources.

---

## 8. API Endpoints

### Authentication
- `POST /api/auth/register` - Register a student account
- `POST /api/auth/login` - Authenticate and return JWT token
- `GET /api/auth/me` - Fetch current student profile (Protected)

### Resources
- `GET /api/resources` - Query resources with filters (`search`, `department`, `year`, `semester`, `subject`, `type`)
- `GET /api/resources/my` - Fetch uploads by currently logged-in student (Protected)
- `GET /api/resources/:id` - Fetch single resource details
- `POST /api/resources` - Upload document file and save metadata (Protected, Multer)
- `GET /api/resources/:id/download` - Stream document file and increment download counter

---

## 9. Future Expansion Roadmap

The code is structured with clean boundaries to allow rapid expansion in upcoming project phases:

- **Phase 2:** Resource rating (1–5 stars), peer reviews & comments, bookmarks/favorites, and admin moderation dashboard.
- **Phase 3:** Abuse reporting, real-time download/activity notifications (Socket.IO), and analytics graphs.
- **Phase 4:** AI-assisted subject tagging, duplicate document detection, syllabus-based recommendations, and OCR for handwritten notes.
