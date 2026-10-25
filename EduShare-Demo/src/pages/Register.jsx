import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, GraduationCap, Lock, Mail, User, AlertCircle, Building2 } from 'lucide-react';
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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    year: '3rd Year',
    semester: 5,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Could not register user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img
              src="/logo.png"
              alt="EduShare Logo"
              className="w-14 h-14 rounded-2xl object-contain border border-zinc-200 bg-white p-1 shadow-sm mx-auto hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-3xl font-black text-slate-900 font-heading">Create Student Account</h2>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">
            Join EduShare to download and exchange college study materials
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-sm">
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="reg-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Email Address <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@college.edu"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-dept" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-indigo-600">*</span>
              </label>
              <select
                id="reg-dept"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-year" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Year
                </label>
                <select
                  id="reg-year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="reg-semester" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester
                </label>
                <select
                  id="reg-semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-70 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Student Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
