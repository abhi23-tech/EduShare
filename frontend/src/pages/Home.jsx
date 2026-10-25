import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  UploadCloud,
  ArrowRight,
} from 'lucide-react';
import api from '../api/api';
import ResourceCard from '../components/ResourceCard';

const categories = [
  { name: 'Notes', emoji: '📚', label: 'Notes' },
  { name: 'PYQ', emoji: '📝', label: 'PYQs' },
  { name: 'Reference Material', emoji: '📖', label: 'Reference Material' },
  { name: 'PPT', emoji: '📑', label: 'PPTs' },
  { name: 'Lab Manual', emoji: '🧪', label: 'Lab Manuals' },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [trendingResources, setTrendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/resources');
        if (res.data?.success) {
          setTrendingResources(res.data.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/resources');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 pb-20 transition-colors">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-left">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.08] mb-3">
          Share. Discover. Learn.
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">
          Your Academic Resource Sharing Platform
        </p>

        {/* Subtitle description */}
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-8">
          Find notes, previous-year questions, reference material, presentations and lab manuals shared by students.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Link
            to="/resources"
            id="browse-resources-hero-btn"
            className="inline-flex items-center gap-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold px-5 py-3 rounded-xl shadow-xs transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Resources</span>
          </Link>
          <Link
            to="/upload"
            id="upload-resource-hero-btn"
            className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold px-5 py-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <UploadCloud className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span>Upload Resource</span>
          </Link>
        </div>

        {/* Clean Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 flex items-center gap-2 shadow-xs mb-4 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition"
        >
          <div className="pl-2.5 text-zinc-400 dark:text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="hero-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes, subjects, topics..."
            className="w-full bg-transparent border-0 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm px-1 font-medium"
          />
          <button
            type="submit"
            id="hero-search-btn"
            className="bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold text-xs px-4 py-2 rounded-lg transition cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick subject tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">Trending:</span>
          {['DBMS', 'Computer Networks', 'Operating Systems', 'Data Structures', 'Cloud Computing'].map(
            (subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => navigate(`/resources?search=${encodeURIComponent(subject)}`)}
                className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer text-xs"
              >
                {subject}
              </button>
            )
          )}
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <h2 className="text-lg font-bold text-zinc-950 dark:text-white mb-4">
          Popular Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/resources?type=${encodeURIComponent(cat.name)}`)}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400/90 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-zinc-950/40 hover:-translate-y-1 text-left transition-all duration-200 shadow-xs group cursor-pointer"
            >
              <div className="text-2xl mb-2.5 inline-block transform group-hover:scale-115 transition-transform duration-200">
                {cat.emoji}
              </div>
              <div className="font-bold text-zinc-950 dark:text-zinc-100 text-base group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Resources Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            Trending Resources
          </h2>
          <Link
            to="/resources"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 h-48 animate-pulse">
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/4 mb-3"></div>
                <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-zinc-50 dark:bg-zinc-800/50 rounded"></div>
              </div>
            ))}
          </div>
        ) : trendingResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {trendingResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">No resources published yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
