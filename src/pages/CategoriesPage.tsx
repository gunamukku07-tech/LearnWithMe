import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Compass,
  Cpu,
  Database,
  FolderGit2,
  Globe,
  Network,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SEOHead } from '../components/SEOHead';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Network,
  Sparkles,
  Globe,
  Cpu,
  Database,
  Share2,
  FolderGit2,
  Compass,
  BookOpen,
};

export const CategoriesPage: React.FC = () => {
  const { categories, publishedBlogs } = useData();

  return (
    <div className="min-h-screen bg-[#FFF8EF] pb-24">
      <SEOHead
        title="Computer Science Categories & Topics — LearnWithMe"
        description="Browse computer science learning notes organized by topic: Programming, Data Structures & Algorithms, AI, Web Development, Operating Systems, DBMS, and Networks."
        path="/categories"
      />

      {/* Header */}
      <section className="py-14 lg:py-20 bg-gradient-to-b from-[#F9EFE8] to-[#FFF8EF] border-b border-[#EDE0D5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl space-y-4 editorial-page-enter">
            <p className="text-xs uppercase tracking-[0.2em] text-[#594438] font-medium">
              Curated Curriculum Index
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#594438] tracking-tight">
              Explore By Category
            </h1>
            <p className="text-base sm:text-lg text-[#887467] leading-relaxed">
              Every weekly article is organized into a core computer science discipline so you can
              follow a structured path from foundational programming to advanced systems.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || BookOpen;
            const matchingBlogs = publishedBlogs.filter(
              (b) => b.category.toLowerCase() === cat.name.toLowerCase()
            );

            return (
              <div
                key={cat.id}
                className="group rounded-[20px] bg-white border border-[#EDE0D5] overflow-hidden flex flex-col justify-between shadow-[0_6px_24px_-10px_rgba(89,68,56,0.05)] hover:border-[#D9A5A5] hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Subtle Category Visual Header Banner */}
                  <Link
                    to={`/blogs?category=${encodeURIComponent(cat.name)}`}
                    className="block relative h-28 bg-gradient-to-br from-[#FFF8EF] via-[#F9EFE8] to-[#F7DDE1]/65 border-b border-[#EDE0D5] p-6 overflow-hidden"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#EADCCB]/55 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-[#EDE0D5] flex items-center justify-center text-[#594438] shadow-xs group-hover:bg-[#D9A5A5] group-hover:text-white transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#594438] font-medium">
                        {matchingBlogs.length === 0
                          ? 'No articles published yet.'
                          : `${matchingBlogs.length} ${
                              matchingBlogs.length === 1 ? 'Published Article' : 'Published Articles'
                            }`}
                      </span>
                    </div>
                  </Link>

                  <div className="p-7 space-y-3">
                    <Link to={`/blogs?category=${encodeURIComponent(cat.name)}`}>
                      <h2 className="font-display text-2xl font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors">
                        {cat.name}
                      </h2>
                    </Link>

                    <p className="text-sm text-[#887467] leading-relaxed">{cat.description}</p>

                    <div className="pt-3 border-t border-[#EDE0D5]/70 space-y-2">
                      {matchingBlogs.length > 0 ? (
                        <>
                          <p className="text-[11px] uppercase tracking-wider text-[#887467] font-mono">
                            Published in this category:
                          </p>
                          <ul className="space-y-1.5">
                            {matchingBlogs.slice(0, 2).map((b) => (
                              <li key={b.id}>
                                <Link
                                  to={`/blog/${b.slug}`}
                                  className="text-xs text-[#594438] hover:underline flex items-center justify-between gap-2"
                                >
                                  <span className="truncate">
                                    Week {String(b.week).padStart(2, '0')}: {b.title}
                                  </span>
                                  <ArrowRight className="w-3 h-3 shrink-0 text-[#D9A5A5]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-xs italic text-[#887467]">
                          No articles published yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-7 pb-6 pt-4 border-t border-[#EDE0D5]">
                  <Link
                    to={`/blogs?category=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors"
                  >
                    <span>Explore Category</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D9A5A5] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
