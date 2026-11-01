import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark } from 'lucide-react';
import { Blog } from '../types';
import { EditorialArtwork } from './EditorialArtwork';
import { useData } from '../context/DataContext';
import { useReducedMotionPreference } from '../hooks/useScrollAndMotion';

interface BlogCardProps {
  blog: Blog;
  index?: number;
  featuredVariant?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  featuredVariant = false,
}) => {
  const { bookmarkedSlugs, toggleBookmark } = useData();
  const isBookmarked = bookmarkedSlugs.includes(blog.slug);
  const reducedMotion = useReducedMotionPreference();

  const cardRef = useRef<HTMLElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const maxTilt = featuredVariant ? 1.8 : 2.8;
    const rx = ((0.5 - relY) * maxTilt * 2).toFixed(2);
    const ry = ((relX - 0.5) * maxTilt * 2).toFixed(2);

    cardRef.current.style.transform = `perspective(1200px) translate3d(0, -5px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;

    if (spotlightRef.current) {
      const sx = (relX * 100).toFixed(1);
      const sy = (relY * 100).toFixed(1);
      spotlightRef.current.style.opacity = '1';
      spotlightRef.current.style.background = `radial-gradient(420px circle at ${sx}% ${sy}%, rgba(247, 221, 225, 0.36), transparent 68%)`;
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(1200px) translate3d(0, 0px, 0) rotateX(0deg) rotateY(0deg)';
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
  };

  const formattedDate = (() => {
    try {
      return new Date(blog.publicationDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return blog.publicationDate;
    }
  })();

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition:
          'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, border-color 300ms ease',
      }}
      className={`group relative rounded-[18px] bg-white border border-[#EDE0D5] overflow-hidden shadow-[0_4px_20px_-6px_rgba(89,68,56,0.05)] hover:shadow-[0_20px_42px_-12px_rgba(89,68,56,0.13)] hover:border-[#D9BFA9] will-change-transform flex flex-col ${
        featuredVariant ? 'md:grid md:grid-cols-12 md:items-stretch' : ''
      }`}
    >
      {/* Interactive Warm Blush Spotlight Overlay (Direct DOM update, zero re-renders) */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out"
      />

      {/* Cover Image Slot */}
      <Link
        to={`/blog/${blog.slug}`}
        className={`block relative overflow-hidden ${
          featuredVariant ? 'md:col-span-6 h-full' : ''
        }`}
      >
        <EditorialArtwork
          src={blog.coverImage}
          alt={blog.title}
          category={blog.category}
          week={blog.week}
          aspectClass={featuredVariant ? 'aspect-[16/10] md:aspect-auto md:h-full' : 'aspect-[16/10]'}
        />
      </Link>

      {/* Editorial Body */}
      <div
        className={`relative z-20 p-6 sm:p-7 flex flex-col justify-between flex-1 ${
          featuredVariant ? 'md:col-span-6 md:p-9' : ''
        }`}
      >
        <div className="space-y-3">
          {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#887467]">
              <span className="font-mono tabular-nums font-medium text-[#594438]">
                Week {String(blog.week).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[#594438] font-medium">{blog.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{blog.readingTime} min read</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#594438] font-medium">
                {blog.authorName || 'Guna Sekhar'}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleBookmark(blog.slug);
              }}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-75 cursor-pointer shrink-0 ${
                isBookmarked
                  ? 'text-[#594438] bg-[#F7DDE1]/60 scale-110'
                  : 'text-[#887467] hover:text-[#594438] hover:bg-[#F9EFE8]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#594438]' : ''}`} />
            </button>
          </div>

          <Link to={`/blog/${blog.slug}`} className="block space-y-2">
            <h3
              data-cursor="read"
              className={`font-display font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors duration-300 leading-snug ${
                featuredVariant ? 'text-2xl sm:text-3xl' : 'text-xl'
              }`}
            >
              {blog.title}
            </h3>
            <p className="text-sm text-[#887467] leading-relaxed line-clamp-3">
              {blog.description}
            </p>
          </Link>
        </div>

        <div className="pt-5 mt-5 border-t border-[#EDE0D5]/80 flex items-center justify-between">
          <Link
            to={`/blog/${blog.slug}`}
            className="relative inline-flex items-center gap-2 text-xs font-semibold text-[#594438] group-hover:gap-3 transition-all duration-300 whitespace-nowrap py-0.5"
          >
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D9A5A5] group-hover:translate-x-1 transition-transform duration-300 ease-out" />
            <span className="absolute left-0 bottom-0 h-[1.5px] w-0 bg-[#D9A5A5] transition-all duration-300 ease-out group-hover:w-full" />
          </Link>

          <span className="text-[11px] text-[#887467] truncate max-w-[160px]">
            {blog.tags.slice(0, 2).join(' · ')}
          </span>
        </div>
      </div>
    </article>
  );
};
