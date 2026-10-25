import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  FileCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const RESOURCE_TYPES = [
  'Notes',
  'PYQ',
  'Reference Material',
  'PPT',
  'Lab Manual',
];

const UploadResource = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: user?.department || 'Computer Science',
    year: user?.year || '3rd Year',
    semester: user?.semester || 5,
    subject: '',
    type: 'Notes',
  });

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedExts.includes(ext)) {
      setError('Please select a valid document (.pdf, .ppt, .pptx, .doc, .docx, .txt)');
      setFile(null);
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size must be under 25MB');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter a resource title');
      return;
    }

    if (!formData.subject.trim()) {
      setError('Please enter the subject name');
      return;
    }

    if (!file) {
      setError('Please select or upload a document file');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('department', formData.department);
      data.append('year', formData.year);
      data.append('semester', formData.semester);
      data.append('subject', formData.subject.trim());
      data.append('type', formData.type);
      data.append('file', file);

      const res = await api.post('/resources', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/resources/${res.data.data._id}`);
        }, 1200);
      } else {
        setError(res.data?.message || 'Failed to upload resource');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'An error occurred during file upload');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] py-10 sm:py-14 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 mx-auto mb-4">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-heading">
            Share Academic Resource
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 max-w-md mx-auto">
            Upload notes, exam papers, presentations, or lab manuals to help your college peers.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-7 sm:p-9 transition-colors">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2.5 animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Resource published successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Resource Title <span className="text-indigo-600 dark:text-indigo-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. DBMS Unit 1 Complete Notes with SQL"
                required
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Briefly describe topics covered, unit details, or textbook references..."
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              ></textarea>
            </div>

            {/* Two-column metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Department <span className="text-indigo-600 dark:text-indigo-400">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Subject <span className="text-indigo-600 dark:text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g. DBMS, Operating Systems"
                  required
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Academic Year <span className="text-indigo-600 dark:text-indigo-400">*</span>
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Semester <span className="text-indigo-600 dark:text-indigo-400">*</span>
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resource Type */}
              <div className="sm:col-span-2">
                <label htmlFor="type" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Resource Type <span className="text-indigo-600 dark:text-indigo-400">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Upload Document File <span className="text-indigo-600 dark:text-indigo-400">*</span>
              </label>

              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-9 text-center transition cursor-pointer ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                  onClick={() => document.getElementById('file-upload-input').click()}
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Click to browse or drag and drop document
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Supports PDF, DOC, DOCX, PPT, PPTX, TXT (Max 25MB)
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate">
                    <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="submit-resource-btn"
                disabled={submitting}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-75 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Uploading Resource to EduShare...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>Publish Resource</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadResource;
