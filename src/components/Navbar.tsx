import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Menu,
  X,
  ArrowUpRight,
  Home,
  BookOpen,
  Compass,
  FolderGit2,
  User,
  Mail,
} from 'lucide-react';
import { useData } from '../context/DataContext';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'About', path: '/about', icon: User },
  { label: 'Weekly Blogs', path: '/blogs', icon: BookOpen },
  { label: 'Categories', path: '/categories', icon: Compass },
  { label: 'Projects', path: '/projects', icon: FolderGit2 },
  { label: 'Contact', path: '/contact', icon: Mail },
];

const MOBILE_DOCK_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Blogs', path: '/blogs', icon: BookOpen },
  { label: 'Topics', path: '/categories', icon: Compass },
  { label: 'Projects', path: '/projects', icon: FolderGit2 },
  { label: 'About', path: '/about', icon: User },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { publishedBlogs, isAdmin } = useData();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling on phones when mobile menu or search modal is open
  useEffect(() => {
    if (mobileMenuOpen || searchModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, searchModalOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchResults = searchQuery.trim()
    ? publishedBlogs.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          `week ${b.week}`.includes(q)
        );
      })
    : publishedBlogs.slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchModalOpen(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FFF8EF]/95 backdrop-blur-md border-b border-[#EDE0D5] shadow-[0_6px_24px_-12px_rgba(89,68,56,0.08)] py-3'
            : 'bg-[#FFF8EF]/90 backdrop-blur-xs border-b border-[#EDE0D5]/60 py-3.5 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-[#594438] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
          >
            LearnWithMe
          </Link>

          {/* Zone 2: Clean single-line navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#887467]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path) ||
                    (item.path === '/blogs' && location.pathname.startsWith('/blog/'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-200 group ${
                    isActive ? 'text-[#594438] font-semibold' : 'hover:text-[#594438]'
                  }`}
                >
                  {item.label}
                  {/* Hover underline */}
                  <span className="absolute left-0 bottom-0 h-[1.5px] w-0 bg-[#D9BFA9] transition-all duration-200 group-hover:w-full" />
                  {/* Active link animated underline */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-underline"
                      className="absolute left-0 bottom-0 h-[2px] w-full bg-[#D9A5A5]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Search icon & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search articles"
              className="flex items-center justify-center gap-2 min-h-[42px] min-w-[42px] sm:min-w-0 px-3 py-2 rounded-xl border border-[#EDE0D5] bg-white/90 text-xs text-[#887467] hover:text-[#594438] hover:border-[#D9BFA9] active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#594438]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline-block text-[10px] font-mono text-[#887467] pl-1">
                ⌘K
              </kbd>
            </button>

            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D9A5A5] text-[#594438] font-medium text-xs hover:bg-[#d19595] transition-all shadow-[0_2px_10px_rgba(217,165,165,0.28)] whitespace-nowrap shrink-0"
            >
              <span>{isAdmin ? 'Admin Studio' : 'Publish / Admin'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden flex items-center justify-center min-h-[42px] min-w-[42px] p-2 rounded-xl border border-[#EDE0D5] bg-white text-[#594438] hover:bg-[#F9EFE8] active:scale-95 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 top-[63px] z-30 bg-[#594438]/20 backdrop-blur-[2px]"
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="lg:hidden relative z-40 border-t border-[#EDE0D5] bg-[#FFF8EF] px-4 sm:px-6 py-5 shadow-2xl max-h-[calc(100dvh-64px)] overflow-y-auto"
              >
                <div className="flex flex-col gap-1.5">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path) ||
                          (item.path === '/blogs' && location.pathname.startsWith('/blog/'));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-[#F7DDE1]/65 text-[#594438] font-semibold'
                            : 'text-[#887467] hover:bg-[#F9EFE8] hover:text-[#594438]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-[#594438]" />
                          <span>{item.label}</span>
                        </span>
                        {isActive && (
                          <span className="text-[11px] font-mono text-[#594438]">Active</span>
                        )}
                      </Link>
                    );
                  })}

                  <div className="pt-3 mt-2 border-t border-[#EDE0D5] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSearchModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-[#EDE0D5] text-[#594438] font-medium text-sm cursor-pointer"
                    >
                      <Search className="w-4 h-4 text-[#D9A5A5]" />
                      <span>Search Weekly Articles</span>
                    </button>

                    <Link
                      to="/admin"
                      className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#D9A5A5] text-[#594438] font-semibold text-sm"
                    >
                      <span>{isAdmin ? 'Open Admin Studio' : 'Admin Dashboard'}</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Phone Bottom Quick-Navigation Bar (One-Thumb Mobile Ergonomics) */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF8EF]/95 backdrop-blur-md border-t border-[#EDE0D5] shadow-[0_-4px_20px_-6px_rgba(89,68,56,0.1)] pb-safe"
      >
        <div className="grid grid-cols-5 items-center px-1 py-1.5">
          {MOBILE_DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path) ||
                  (item.path === '/blogs' && location.pathname.startsWith('/blog/'));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors ${
                  isActive ? 'text-[#594438] font-semibold' : 'text-[#887467]'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? 'bg-[#F7DDE1]/80 text-[#594438]' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Instant Search Modal (Phone Keyboard-Aware) */}
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-[#594438]/25 backdrop-blur-xs flex items-start justify-center pt-3 sm:pt-20 px-3 sm:px-4"
            onClick={() => setSearchModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-[20px] bg-[#FFF8EF] border border-[#EDE0D5] shadow-2xl overflow-hidden"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#EDE0D5] bg-white"
              >
                <Search className="w-5 h-5 text-[#D9A5A5] shrink-0" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Java, arrays, OOP, graphs, or week..."
                  className="w-full bg-transparent text-[#594438] placeholder-[#887467]/70 text-base sm:text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  aria-label="Close search"
                  className="p-2 rounded-lg text-[#887467] hover:text-[#594438] hover:bg-[#F9EFE8] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>

              <div className="p-4 sm:p-5 max-h-[65dvh] overflow-y-auto">
                <div className="flex items-center justify-between text-xs text-[#887467] mb-3">
                  <span>
                    {searchQuery.trim()
                      ? `Matching Dispatches (${searchResults.length})`
                      : 'Recent Weekly Dispatches'}
                  </span>
                  <Link
                    to="/blogs"
                    onClick={() => setSearchModalOpen(false)}
                    className="text-[#594438] hover:underline font-medium"
                  >
                    View Full Archive →
                  </Link>
                </div>

                {publishedBlogs.length === 0 ? (
                  <div className="py-8 text-center space-y-1.5">
                    <p className="text-xs font-mono uppercase tracking-widest text-[#D9A5A5] font-semibold">
                      First article coming soon
                    </p>
                    <p className="font-display text-lg text-[#594438] font-semibold">
                      My learning journey starts here.
                    </p>
                    <p className="text-xs text-[#887467]">
                      Guna Sekhar · Integrated M.Tech CSE — 2nd Year
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#594438] font-medium">
                      No articles matched &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-xs text-[#887467] mt-1">
                      Try searching for another topic or browse all categories.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResults.map((article) => (
                      <Link
                        key={article.id}
                        to={`/blog/${article.slug}`}
                        onClick={() => setSearchModalOpen(false)}
                        className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-white border border-[#EDE0D5] hover:border-[#D9A5A5] transition-all group"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-[#887467] font-mono tabular-nums">
                            <span>Week {String(article.week).padStart(2, '0')}</span>
                            <span aria-hidden="true">·</span>
                            <span>{article.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{article.readingTime} min read</span>
                          </div>
                          <h4 className="font-display text-sm sm:text-base font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-xs text-[#887467] line-clamp-1">
                            {article.description}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#887467] group-hover:text-[#594438] shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
