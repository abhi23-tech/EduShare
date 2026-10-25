import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  BookOpen,
  FolderOpen,
  X,
} from 'lucide-react';
import api from '../api/api';
import ResourceCard from '../components/ResourceCard';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

const RESOURCE_TYPES = [
  'All',
  'Notes',
  'PYQ',
  'Reference Material',
  'PPT',
  'Lab Manual',
];

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || 'All');
  const [year, setYear] = useState(searchParams.get('year') || 'All');
  const [semester, setSemester] = useState(searchParams.get('semester') || 'All');
  const [type, setType] = useState(searchParams.get('type') || 'All');
  const [sortBy, setSortBy] = useState('newest');

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setDepartment(searchParams.get('department') || 'All');
    setYear(searchParams.get('year') || 'All');
    setSemester(searchParams.get('semester') || 'All');
    setType(searchParams.get('type') || 'All');
  }, [searchParams]);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (department !== 'All') params.department = department;
        if (year !== 'All') params.year = year;
        if (semester !== 'All') params.semester = semester;
        if (type !== 'All') params.type = type;
        if (sortBy) params.sortBy = sortBy;

        const res = await api.get('/resources', { params });
        if (res.data?.success) {
          setResources(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources.');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResources();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, department, year, semester, type, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('All');
    setYear('All');
    setSemester('All');
    setType('All');
    setSearchParams({});
  };

  const updateFilter = (key, value) => {
    if (key === 'search') setSearch(value || '');
    if (key === 'department') setDepartment(value || 'All');
    if (key === 'year') setYear(value || 'All');
    if (key === 'semester') setSemester(value || 'All');
    if (key === 'type') setType(value || 'All');

    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    department !== 'All' ||
    year !== 'All' ||
    semester !== 'All' ||
    type !== 'All';

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
            Academic Resources
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base mt-1.5 max-w-2xl">
            Find notes, previous-year question papers, reference material, and practical manuals.
          </p>
        </div>

        {/* Filter Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 mb-8 shadow-xs transition-colors">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="resources-search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                updateFilter('search', e.target.value);
              }}
              placeholder="Search by title, subject name, topic, or department..."
              className="w-full pl-11 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm sm:text-base font-medium focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  updateFilter('search', '');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <label htmlFor="dept-filter" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                id="dept-filter"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  updateFilter('department', e.target.value);
                }}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year-filter" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Year
              </label>
              <select
                id="year-filter"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  updateFilter('year', e.target.value);
                }}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="semester-filter" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Semester
              </label>
              <select
                id="semester-filter"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  updateFilter('semester', e.target.value);
                }}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Semesters' : `Semester ${s}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                id="type-filter"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  updateFilter('type', e.target.value);
                }}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All Types' : t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                onClick={handleResetFilters}
                id="reset-filters-btn"
                className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Active:</span>
              {search && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                  Search: "{search}"
                  <button
                    type="button"
                    onClick={() => updateFilter('search', '')}
                    className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                    title="Remove search filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {department !== 'All' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                  {department}
                  <button
                    type="button"
                    onClick={() => updateFilter('department', 'All')}
                    className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                    title="Remove department filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {year !== 'All' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                  {year}
                  <button
                    type="button"
                    onClick={() => updateFilter('year', 'All')}
                    className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                    title="Remove year filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {semester !== 'All' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                  Semester {semester}
                  <button
                    type="button"
                    onClick={() => updateFilter('semester', 'All')}
                    className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                    title="Remove semester filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {type !== 'All' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                  {type}
                  <button
                    type="button"
                    onClick={() => updateFilter('type', 'All')}
                    className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                    title="Remove type filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing <strong className="text-zinc-950 dark:text-white font-bold">{resources.length}</strong> academic resources
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer shadow-2xs"
            >
              <option value="newest">Newest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 h-52 animate-pulse">
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/4 mb-3"></div>
                <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-12 bg-zinc-50 dark:bg-zinc-800/50 rounded"></div>
              </div>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="resources-grid">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
            <FolderOpen className="w-10 h-10 text-zinc-400 dark:text-zinc-500 mx-auto mb-3" />
            <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-base mb-1">No resources found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-4">
              We couldn't find anything matching your search criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
