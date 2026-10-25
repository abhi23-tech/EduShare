import { INITIAL_USER, INITIAL_RESOURCES } from '../data/academicData';

// Local Storage Keys
const STORAGE_KEYS = {
  RESOURCES: 'edushare_resources',
  USER: 'edushare_user',
  TOKEN: 'edushare_token',
};

// Initialize Storage Data
const getStoredResources = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.RESOURCES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
    return [...INITIAL_RESOURCES];
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [...INITIAL_RESOURCES];
  }
};

const saveStoredResources = (resources) => {
  localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
};

const getStoredUser = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'auth-token-academic-edushare');
    return INITIAL_USER;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_USER;
  }
};

const saveStoredUser = (user, token = 'auth-token-academic-edushare') => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

// Helper for asynchronous request handling
const sleep = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

// Application API Client
const api = {
  get: async (url, config = {}) => {
    await sleep();
    const resources = getStoredResources();
    const currentUser = getStoredUser();

    // 1. Current User Profile
    if (url === '/auth/me') {
      return {
        data: {
          success: true,
          data: currentUser,
        },
      };
    }

    // 2. User Uploads and Platform Metrics
    if (url === '/resources/my') {
      const myUploads = resources.filter(
        (r) => r.uploadedBy?._id === currentUser._id || r.uploadedBy?.email === currentUser.email
      );
      const totalDownloads = myUploads.reduce((acc, curr) => acc + (curr.downloads || 0), 0);

      return {
        data: {
          success: true,
          count: myUploads.length,
          stats: {
            myUploads: myUploads.length,
            totalDownloads,
            totalPlatformResources: resources.length,
          },
          data: myUploads,
        },
      };
    }

    // 3. Download Resource
    if (url.includes('/download')) {
      const id = url.split('/resources/')[1]?.split('/download')[0];
      const index = resources.findIndex((r) => r._id === id);
      let targetResource = resources[0];

      if (index !== -1) {
        resources[index].downloads = (resources[index].downloads || 0) + 1;
        saveStoredResources(resources);
        targetResource = resources[index];
      }

      const fileName = targetResource.fileName || `${targetResource.title.replace(/\s+/g, '_')}.pdf`;
      const sampleContent = `%PDF-1.4\n% EduShare Academic Study Resource\n% Title: ${targetResource.title}\n% Department: ${targetResource.department}\n% Year/Semester: ${targetResource.year} - Semester ${targetResource.semester}\n% Subject: ${targetResource.subject}\n% Type: ${targetResource.type}\n\nAcademic Material Content for ${targetResource.title}.\nPublished via EduShare Academic Repository.`;

      const blob = new Blob([sampleContent], { type: 'application/pdf' });

      return {
        data: blob,
        headers: {
          'content-disposition': `attachment; filename="${fileName}"`,
        },
      };
    }

    // 4. Single Resource Details
    if (url.startsWith('/resources/')) {
      const id = url.replace('/resources/', '');
      const item = resources.find((r) => r._id === id);
      if (!item) {
        throw { response: { status: 404, data: { message: 'Resource not found' } } };
      }
      return {
        data: {
          success: true,
          data: item,
        },
      };
    }

    // 5. Query All Resources
    if (url === '/resources') {
      const params = config.params || {};
      let filtered = [...resources];

      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.subject.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q)) ||
            r.department.toLowerCase().includes(q)
        );
      }

      if (params.department && params.department !== 'All') {
        filtered = filtered.filter((r) => r.department === params.department);
      }

      if (params.year && params.year !== 'All') {
        filtered = filtered.filter((r) => r.year === params.year);
      }

      if (params.semester && params.semester !== 'All') {
        filtered = filtered.filter((r) => String(r.semester) === String(params.semester));
      }

      if (params.type && params.type !== 'All') {
        filtered = filtered.filter((r) => r.type === params.type);
      }

      return {
        data: {
          success: true,
          count: filtered.length,
          data: filtered,
        },
      };
    }

    return { data: { success: true } };
  },

  post: async (url, data) => {
    await sleep();

    // 1. User Login
    if (url === '/auth/login') {
      const email = data.email || 'aryan.cs@edushare.ac.in';
      const currentUser = {
        ...getStoredUser(),
        email: email,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      };
      saveStoredUser(currentUser);

      return {
        data: {
          success: true,
          data: {
            token: 'auth-token-academic-edushare',
            ...currentUser,
          },
        },
      };
    }

    // 2. User Registration
    if (url === '/auth/register') {
      const newUser = {
        _id: 'usr-' + Date.now(),
        name: data.name || 'Student',
        email: data.email || 'student@edushare.ac.in',
        department: data.department || 'Computer Science',
        year: data.year || '2nd Year',
        semester: Number(data.semester) || 4,
        role: 'student',
      };
      saveStoredUser(newUser);

      return {
        data: {
          success: true,
          data: {
            token: 'auth-token-academic-edushare',
            ...newUser,
          },
        },
      };
    }

    // 3. Upload Resource
    if (url === '/resources') {
      const resources = getStoredResources();
      const currentUser = getStoredUser();

      let title, description, department, year, semester, subject, type, file;
      if (data instanceof FormData) {
        title = data.get('title');
        description = data.get('description');
        department = data.get('department');
        year = data.get('year');
        semester = Number(data.get('semester'));
        subject = data.get('subject');
        type = data.get('type');
        file = data.get('file');
      } else {
        ({ title, description, department, year, semester, subject, type } = data);
      }

      const newResource = {
        _id: 'res-upload-' + Date.now(),
        title: title || 'Academic Study Material',
        description: description || '',
        department: department || currentUser.department,
        year: year || currentUser.year,
        semester: semester || currentUser.semester,
        subject: subject || 'Computer Science',
        type: type || 'Notes',
        fileName: file?.name || `${(title || 'Document').replace(/\s+/g, '_')}.pdf`,
        fileSize: file?.size || 2150000,
        fileMimeType: file?.type || 'application/pdf',
        downloads: 0,
        uploadedBy: {
          _id: currentUser._id,
          name: currentUser.name,
          department: currentUser.department,
          year: currentUser.year,
        },
        createdAt: new Date().toISOString(),
      };

      resources.unshift(newResource);
      saveStoredResources(resources);

      return {
        data: {
          success: true,
          message: 'Resource uploaded successfully',
          data: newResource,
        },
      };
    }

    return { data: { success: true } };
  },

  delete: async (url) => {
    await sleep();
    if (url.startsWith('/resources/')) {
      const id = url.replace('/resources/', '');
      const resources = getStoredResources();
      const updated = resources.filter((r) => r._id !== id);
      saveStoredResources(updated);

      return {
        data: {
          success: true,
          message: 'Resource deleted successfully',
        },
      };
    }
    return { data: { success: true } };
  },

  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

export default api;
