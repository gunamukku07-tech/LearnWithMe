import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bookmark,
  Check,
  Lightbulb,
  Share2,
  BookOpen,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { EditorialArtwork } from '../components/EditorialArtwork';
import { MarkdownRenderer, extractHeadings } from '../components/MarkdownRenderer';
import { BlogCard } from '../components/BlogCard';
import { SEOHead } from '../components/SEOHead';
import { ProfilePhotoPlaceholder } from '../components/ProfilePhotoPlaceholder';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { blogs, publishedBlogs, profile, isAdmin, bookmarkedSlugs, toggleBookmark, addToast } = useData();

  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Enforce: Draft/unpublished articles must not be accessible through the public blog interface
  const article = useMemo(() => {
    const match = blogs.find((b) => b.slug === slug);
    if (!match) return undefined;
    if (match.status !== 'published' && !isAdmin) {
      return undefined;
    }
    return match;
  }, [blogs, slug, isAdmin]);

  const headings = useMemo(() => {
    return article ? extractHeadings(article.content) : [];
  }, [article]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileTocOpen(false);
  }, [slug]);

  // Reading Progress Bar & Active Table of Contents Scroll-Spy
  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        setReadingProgress(pct);
      }
      setShowBackToTop(scrollTop > 480);

      let currentId = headings[0]?.id || '';
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            currentId = h.id;
          }
        }
      }
      setActiveHeadingId(currentId);
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => window.removeEventListener('scroll', updateScroll);
  }, [headings]);

  if (!article) {
    return (
      <div className="min-h-[70vh] bg-[#FFF8EF] flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md w-full rounded-[20px] bg-white border border-[#EDE0D5] p-8 sm:p-10 text-center space-y-4">
          <h1 className="font-display text-2xl font-semibold text-[#594438]">
            Article Not Found
          </h1>
          <p className="text-sm text-[#887467]">
            This weekly article could not be found or is currently saved as an unpublished draft.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Learning Journal</span>
          </Link>
        </div>
      </div>
    );
  }

  const isBookmarked = bookmarkedSlugs.includes(article.slug);

  const sortedByWeek = [...publishedBlogs].sort((a, b) => a.week - b.week);
  const currentIndex = sortedByWeek.findIndex((b) => b.id === article.id);
  const prevArticle = currentIndex > 0 ? sortedByWeek[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < sortedByWeek.length - 1
      ? sortedByWeek[currentIndex + 1]
      : null;

  // Related articles based on category OR shared tags
  const relatedArticles = publishedBlogs
    .filter((b) => b.id !== article.id)
    .map((candidate) => {
      const sameCategory = candidate.category.toLowerCase() === article.category.toLowerCase() ? 3 : 0;
      const sharedTags = candidate.tags.filter((t) =>
        article.tags.some((at) => at.toLowerCase() === t.toLowerCase())
      ).length;
      return { blog: candidate, score: sameCategory + sharedTags };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.blog.week - a.blog.week)
    .slice(0, 2)
    .map((item) => item.blog);

  const formattedDate = (() => {
    try {
      return new Date(article.publicationDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return article.publicationDate;
    }
  })();

  const handleShareCopy = async () => {
    const shareUrl = `${window.location.origin}/blog/${article.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: shareUrl,
        });
        return;
      }
    } catch {
      // fallback to clipboard copy
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareUrl(true);
      addToast('Article Link Copied', `Shareable URL copied: /blog/${article.slug}`);
      setTimeout(() => setCopiedShareUrl(false), 2500);
    } catch {
      addToast('Share URL', shareUrl, 'info');
    }
  };

  const activeHeadingText =
    headings.find((h) => h.id === activeHeadingId)?.text || headings[0]?.text || 'Table of Contents';

  return (
    <div className="min-h-screen bg-[#FFF8EF] pb-20 sm:pb-24">
      <SEOHead
        title={`${article.title} — Week ${String(article.week).padStart(2, '0')} | LearnWithMe`}
        description={article.description}
        path={`/blog/${article.slug}`}
        type="article"
        publishedTime={article.publicationDate}
        author={article.authorName}
        keywords={article.tags}
      />

      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#EDE0D5]/50 pointer-events-none">
        <div
          className="h-full bg-[#D9A5A5] transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Admin Draft Preview Banner */}
      {article.status === 'draft' && (
        <div className="bg-[#F7DDE1] border-b border-[#D9A5A5] py-2.5 px-4 sm:px-6 text-center text-xs font-medium text-[#594438] flex flex-wrap items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>
            Draft Preview Mode — This article is unpublished and hidden from public visitors.
          </span>
          <Link to="/admin" className="underline font-semibold ml-1">
            Return to Admin Studio
          </Link>
        </div>
      )}

      {/* Editorial Article Header */}
      <header className="pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-14 lg:pb-16 bg-gradient-to-b from-[#F9EFE8] to-[#FFF8EF] border-b border-[#EDE0D5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#887467] hover:text-[#594438] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Learning Journal</span>
          </Link>

          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-[#887467]">
            <span className="font-mono font-semibold text-[#594438] tabular-nums">
              Week {String(article.week).padStart(2, '0')}
            </span>
            <span aria-hidden="true">·</span>
            <Link
              to={`/blogs?category=${encodeURIComponent(article.category)}`}
              className="text-[#594438] font-medium hover:underline"
            >
              {article.category}
            </Link>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{article.readingTime} min read</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#594438] font-medium">
              {profile.name || 'Guna Sekhar'}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold text-[#594438] leading-[1.18] tracking-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-base sm:text-xl text-[#887467] leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author & Actions Bar */}
          <div className="pt-4 border-t border-[#EDE0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link to="/about" className="flex items-center gap-3 group">
              <ProfilePhotoPlaceholder size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors truncate">
                  {profile.name || article.authorName}
                </p>
                <p className="text-[11px] text-[#887467] truncate">
                  {profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year'} · LearnWithMe
                </p>
              </div>
            </Link>

            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => toggleBookmark(article.slug)}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-[#F7DDE1] border-[#D9A5A5] text-[#594438]'
                    : 'bg-white border-[#EDE0D5] text-[#594438] hover:border-[#D9BFA9]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#594438]' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareCopy}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-all cursor-pointer"
              >
                {copiedShareUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#594438]" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#887467]" />
                    <span>Share Article</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Cover Artwork */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 mb-8 sm:mb-12">
        <div className="rounded-[18px] sm:rounded-[22px] overflow-hidden border border-[#EDE0D5] shadow-[0_18px_40px_-15px_rgba(89,68,56,0.1)] bg-white">
          <EditorialArtwork
            src={article.coverImage}
            alt={article.title}
            category={article.category}
            week={article.week}
            aspectClass="aspect-[16/10] sm:aspect-[16/8]"
          />
        </div>
      </div>

      {/* Main Two-Column Reading Canvas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mobile Collapsible Table of Contents (Phone Only) */}
        {headings.length > 0 && (
          <div className="lg:hidden mb-6 rounded-[18px] bg-white border border-[#EDE0D5] overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setMobileTocOpen((prev) => !prev)}
              aria-expanded={mobileTocOpen}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left bg-[#F9EFE8]/60 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BookOpen className="w-4 h-4 text-[#D9A5A5] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#887467]">
                    Jump to Section · {Math.round(readingProgress)}% Read
                  </p>
                  <p className="text-xs font-semibold text-[#594438] truncate">
                    {activeHeadingText}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#594438] shrink-0 transition-transform duration-200 ${
                  mobileTocOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {mobileTocOpen && (
                <motion.nav
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Mobile table of contents"
                  className="px-4 py-3 border-t border-[#EDE0D5] space-y-1 max-h-64 overflow-y-auto"
                >
                  {headings.map((h) => {
                    const isActive = activeHeadingId === h.id;
                    return (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileTocOpen(false);
                          const target = document.getElementById(h.id);
                          if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                            setActiveHeadingId(h.id);
                          }
                        }}
                        className={`block py-2 text-xs rounded-lg px-2.5 ${
                          h.level === 3 ? 'pl-6' : ''
                        } ${
                          isActive
                            ? 'bg-[#F7DDE1]/65 text-[#594438] font-semibold'
                            : 'text-[#887467]'
                        }`}
                      >
                        {h.text}
                      </a>
                    );
                  })}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left / Center Editorial Prose Column */}
          <article className="lg:col-span-8 min-w-0 bg-white rounded-[20px] sm:rounded-[22px] border border-[#EDE0D5] p-5 sm:p-10 lg:p-12 shadow-[0_6px_28px_-12px_rgba(89,68,56,0.05)] overflow-hidden">
            <div className="max-w-[68ch] mx-auto min-w-0">
              <MarkdownRenderer content={article.content} />

              {/* Key Takeaways Box */}
              {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                <section className="mt-10 sm:mt-12 p-5 sm:p-8 rounded-[18px] sm:rounded-[20px] bg-[#FFF8EF] border border-[#EDE0D5] space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2.5 text-[#594438]">
                    <Lightbulb className="w-5 h-5 text-[#D9A5A5] shrink-0" />
                    <h3 className="font-serif-section text-lg sm:text-xl text-[#594438]">
                      Key Takeaways from Week {String(article.week).padStart(2, '0')}
                    </h3>
                  </div>
                  <ul className="space-y-2.5 text-sm sm:text-[15px] text-[#887467] leading-relaxed list-disc pl-5">
                    {article.keyTakeaways.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Article Footer Tags */}
              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#EDE0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs text-[#887467]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[#594438]">Topics Covered:</span>
                  <span>{article.tags.join(' · ')}</span>
                </div>
                <span className="font-mono break-all">URL: /blog/{article.slug}</span>
              </div>

              {/* Short Author Introduction Box */}
              <section
                aria-label="About the author"
                className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-[20px] bg-gradient-to-br from-[#FFF8EF] via-[#F9EFE8] to-[#F7DDE1]/45 border border-[#EDE0D5] flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left"
              >
                <ProfilePhotoPlaceholder size="md" editable />
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-[#887467]">
                      Written &amp; Documented By
                    </p>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#594438]">
                      {profile.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-[#594438]">
                      {profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year'}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-[#887467] leading-relaxed">
                    Hi! I&apos;m {profile.name}, a second-year Integrated M.Tech Computer Science
                    and Engineering student. LearnWithMe is my personal learning space where I share
                    my weekly learning experiences, technical knowledge, programming concepts,
                    projects and discoveries.
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#594438] hover:text-[#b57373] transition-colors"
                    >
                      <span>More About {profile.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D9A5A5]" />
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </article>

          {/* Right Sticky Table of Contents Rail (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-[20px] bg-white border border-[#EDE0D5] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EDE0D5]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D9A5A5]" />
                  <h2 className="font-serif-section text-base text-[#594438]">
                    Table of Contents
                  </h2>
                </div>
                <span className="text-xs font-mono tabular-nums text-[#887467]">
                  {Math.round(readingProgress)}% read
                </span>
              </div>

              {headings.length === 0 ? (
                <p className="text-xs text-[#887467]">No section headings in this dispatch.</p>
              ) : (
                <nav aria-label="Table of contents" className="space-y-1.5">
                  {headings.map((h) => {
                    const isActive = activeHeadingId === h.id;
                    return (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const target = document.getElementById(h.id);
                          if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                            setActiveHeadingId(h.id);
                          }
                        }}
                        className={`block py-1.5 text-xs transition-all rounded-lg px-2.5 ${
                          h.level === 3 ? 'pl-6' : ''
                        } ${
                          isActive
                            ? 'bg-[#F7DDE1]/55 text-[#594438] font-semibold'
                            : 'text-[#887467] hover:text-[#594438] hover:bg-[#FFF8EF]'
                        }`}
                      >
                        {h.text}
                      </a>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Study Card */}
            <div className="rounded-[20px] bg-[#F9EFE8] border border-[#EDE0D5] p-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[#594438] font-medium">
                Weekly Learning Note
              </p>
              <p className="text-xs text-[#887467] leading-relaxed">
                Found a helpful explanation or code snippet? Bookmark this article for exam review
                or share the clean link with your study group.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareCopy}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-colors cursor-pointer"
                >
                  Copy Shareable Link
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Previous & Next Week Navigation */}
        <nav
          aria-label="Adjacent articles"
          className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
        >
          {prevArticle ? (
            <Link
              to={`/blog/${prevArticle.slug}`}
              className="group p-5 sm:p-6 rounded-[18px] bg-white border border-[#EDE0D5] hover:border-[#D9A5A5] transition-all flex flex-col justify-between gap-2"
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-[#887467] font-mono">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Previous · Week {String(prevArticle.week).padStart(2, '0')}
              </span>
              <span className="font-display text-base sm:text-lg font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors">
                {prevArticle.title}
              </span>
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}

          {nextArticle && (
            <Link
              to={`/blog/${nextArticle.slug}`}
              className="group p-5 sm:p-6 rounded-[18px] bg-white border border-[#EDE0D5] hover:border-[#D9A5A5] transition-all flex flex-col justify-between sm:items-end sm:text-right gap-2"
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-[#887467] font-mono">
                Next · Week {String(nextArticle.week).padStart(2, '0')}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="font-display text-base sm:text-lg font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors">
                {nextArticle.title}
              </span>
            </Link>
          )}
        </nav>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-[#EDE0D5] space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif-section text-2xl sm:text-3xl text-[#594438]">
                Related Articles
              </h2>
              <Link
                to={`/blogs?category=${encodeURIComponent(article.category)}`}
                className="text-xs font-medium text-[#594438] hover:underline whitespace-nowrap"
              >
                More in {article.category} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {relatedArticles.map((rel, idx) => (
                <BlogCard key={rel.id} blog={rel} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating Back-to-Top Button (Raised above mobile bottom dock) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll back to top"
            className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 p-3.5 rounded-full bg-[#D9A5A5] text-[#594438] shadow-lg hover:bg-[#d19595] active:scale-95 transition-all cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
