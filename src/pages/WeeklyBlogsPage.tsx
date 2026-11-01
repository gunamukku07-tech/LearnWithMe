import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, RotateCcw, ArrowDownUp, Bookmark } from 'lucide-react';
import { useData } from '../context/DataContext';
import { BlogCard } from '../components/BlogCard';
import { SEOHead } from '../components/SEOHead';

const PAGE_SIZE = 6;

export const WeeklyBlogsPage: React.FC = () => {
  const { publishedBlogs, categories, bookmarkedSlugs } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';
  const initialWeek = searchParams.get('week') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const catParam = searchParams.get('category');
    const qParam = searchParams.get('q');
    const wkParam = searchParams.get('week');
    setSelectedCategory(catParam || 'All');
    if (qParam !== null) setSearchQuery(qParam);
    if (wkParam !== null) setSelectedWeek(wkParam || 'All');
  }, [searchParams]);

  const availableWeeks = useMemo(() => {
    const weeks = Array.from(new Set(publishedBlogs.map((b) => b.week))).sort((a, b) => a - b);
    return weeks;
  }, [publishedBlogs]);

  const filteredBlogs = useMemo(() => {
    return publishedBlogs
      .filter((blog) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          blog.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesWeek =
          selectedWeek === 'All' || blog.week === Number(selectedWeek);

        const matchesBookmark = !onlyBookmarked || bookmarkedSlugs.includes(blog.slug);

        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          blog.title.toLowerCase().includes(q) ||
          blog.subtitle.toLowerCase().includes(q) ||
          blog.description.toLowerCase().includes(q) ||
          blog.category.toLowerCase().includes(q) ||
          blog.tags.some((t) => t.toLowerCase().includes(q)) ||
          `week ${blog.week}`.includes(q) ||
          `week 0${blog.week}`.includes(q);

        return matchesCategory && matchesWeek && matchesBookmark && matchesQuery;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.week - a.week || b.publicationDate.localeCompare(a.publicationDate);
        }
        return a.week - b.week || a.publicationDate.localeCompare(b.publicationDate);
      });
  }, [
    publishedBlogs,
    selectedCategory,
    selectedWeek,
    onlyBookmarked,
    bookmarkedSlugs,
    searchQuery,
    sortOrder,
  ]);

  const featuredArticle = useMemo(() => {
    return publishedBlogs.find((b) => b.featured) || publishedBlogs[0];
  }, [publishedBlogs]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setVisibleCount(PAGE_SIZE);
    const nextParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catName);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedWeek('All');
    setSortOrder('newest');
    setOnlyBookmarked(false);
    setVisibleCount(PAGE_SIZE);
    setSearchParams({}, { replace: true });
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedWeek !== 'All' ||
    onlyBookmarked;

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[#FFF8EF] pb-24">
      <SEOHead
        title="My Learning Journal — Weekly CS Blogs | LearnWithMe"
        description="Search and filter weekly computer science tutorials by category, week number, or keyword. Explore Java, Data Structures, OOP, and Graph algorithms."
        path="/blogs"
      />

      <section className="py-10 sm:py-14 lg:py-20 bg-gradient-to-b from-[#F9EFE8] to-[#FFF8EF] border-b border-[#EDE0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-3 sm:space-y-4 editorial-page-enter">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#594438] font-medium">
              The Weekly Dispatch Archive
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[#594438] tracking-tight">
              My Learning Journal
            </h1>
            <p className="text-sm sm:text-lg text-[#887467] leading-relaxed">
              Every article documents a week of studying computer science—complete with intuition,
              architectural diagrams, time-complexity notes, and working code examples.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8 sm:space-y-12">
        {/* Featured Lead Article (Shown when not actively filtering) */}
        {!isFiltered && featuredArticle && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#887467] font-medium">
              <span>Featured Weekly Dispatch</span>
              <span className="font-mono">Week {String(featuredArticle.week).padStart(2, '0')}</span>
            </div>
            <BlogCard blog={featuredArticle} featuredVariant />
          </div>
        )}

        {/* Discovery Filter & Search Console */}
        <div className="rounded-[20px] bg-white border border-[#EDE0D5] p-4 sm:p-6 shadow-[0_6px_24px_-10px_rgba(89,68,56,0.06)] space-y-4 sm:space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Search Input */}
            <div className="col-span-2 md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#887467] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Search topic, title, or tag (Java, Arrays, OOP)..."
                aria-label="Search articles"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-base sm:text-sm text-[#594438] placeholder-[#887467]/75 focus:outline-none focus:border-[#D9A5A5] transition-colors"
              />
            </div>

            {/* Week Filter */}
            <div className="col-span-1 md:col-span-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#887467] shrink-0 hidden sm:block" />
              <select
                value={selectedWeek}
                onChange={(e) => {
                  setSelectedWeek(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                aria-label="Filter by week number"
                className="w-full px-3 sm:px-3.5 py-3 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-xs sm:text-sm text-[#594438] focus:outline-none focus:border-[#D9A5A5]"
              >
                <option value="All">All Weeks ({availableWeeks.length})</option>
                {availableWeeks.map((wk) => (
                  <option key={wk} value={String(wk)}>
                    Week {String(wk).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order Toggle */}
            <div className="col-span-1 md:col-span-2 flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 text-[#887467] shrink-0 hidden sm:block" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                aria-label="Sort articles"
                className="w-full px-3 py-3 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-xs sm:text-sm text-[#594438] focus:outline-none focus:border-[#D9A5A5]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Saved Bookmarks Toggle */}
            <div className="col-span-2 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setOnlyBookmarked((prev) => !prev);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  onlyBookmarked
                    ? 'bg-[#F7DDE1] border-[#D9A5A5] text-[#594438] font-semibold'
                    : 'bg-[#FFF8EF] border-[#EDE0D5] text-[#887467] hover:text-[#594438]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-[#594438]' : ''}`} />
                <span>Saved ({bookmarkedSlugs.length})</span>
              </button>
            </div>
          </div>

          {/* Interactive Category Filter Buttons (Swipeable strip on phones, wrapped on desktop) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EDE0D5]/80">
            <div
              className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1"
              role="tablist"
              aria-label="Category filters"
            >
              <button
                type="button"
                onClick={() => handleCategorySelect('All')}
                className={`px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === 'All'
                    ? 'bg-[#D9A5A5] text-[#594438] font-semibold shadow-xs'
                    : 'bg-[#FFF8EF] text-[#887467] hover:text-[#594438] border border-[#EDE0D5]'
                }`}
              >
                All Topics ({publishedBlogs.length})
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#D9A5A5] text-[#594438] font-semibold shadow-xs'
                        : 'bg-[#FFF8EF] text-[#887467] hover:text-[#594438] border border-[#EDE0D5]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#594438] hover:underline cursor-pointer whitespace-nowrap self-end sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-xs text-[#887467]">
          <span>
            Showing <strong className="text-[#594438] tabular-nums">{visibleBlogs.length}</strong> of{' '}
            <strong className="text-[#594438] tabular-nums">{filteredBlogs.length}</strong> published
            articles
          </span>
          {selectedCategory !== 'All' && (
            <span>
              Category: <strong className="text-[#594438]">{selectedCategory}</strong>
            </span>
          )}
        </div>

        {/* Article Grid or Empty State */}
        {publishedBlogs.length === 0 ? (
          <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-3 shadow-[0_6px_24px_-10px_rgba(89,68,56,0.05)]">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#D9A5A5] font-semibold">
              First article coming soon
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold text-[#594438]">
              My learning journey starts here.
            </h2>
            <p className="text-sm text-[#887467] leading-relaxed max-w-md mx-auto">
              By <strong className="text-[#594438] font-medium">Guna Sekhar</strong> (Integrated
              M.Tech CSE — 2nd Year) · Learn. Create. Share. Grow.
            </p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#EDE0D5] p-12 text-center max-w-xl mx-auto space-y-4">
            <h3 className="font-display text-2xl font-semibold text-[#594438]">
              {selectedCategory !== 'All' && !searchQuery.trim() && !onlyBookmarked
                ? 'No articles published yet.'
                : 'No matching articles found'}
            </h3>
            <p className="text-sm text-[#887467] leading-relaxed">
              {selectedCategory !== 'All' && !searchQuery.trim() && !onlyBookmarked
                ? `There are no published articles in ${selectedCategory} yet. Check back soon as new weekly lessons are documented.`
                : "We couldn't find any weekly dispatches matching your current search or filter combination. Try clearing your filters or searching for another computer science concept."}
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold hover:bg-[#d19595] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Weekly Blogs</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleBlogs.map((blog, idx) => (
                <BlogCard key={blog.id} blog={blog} index={idx} />
              ))}
            </div>

            {visibleCount < filteredBlogs.length && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#EDE0D5] text-sm font-medium text-[#594438] hover:border-[#D9A5A5] hover:bg-[#F9EFE8] transition-all cursor-pointer"
                >
                  <span>Load More Dispatches ({filteredBlogs.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
