import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Code2,
  Cpu,
  Database,
  FolderGit2,
  Globe,
  Network,
  Share2,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { BlogCard } from '../components/BlogCard';
import { SEOHead } from '../components/SEOHead';
import { ProfilePhotoPlaceholder } from '../components/ProfilePhotoPlaceholder';
import {
  AnimatedCounter,
  FloatingPastelDecor,
  MagneticWrapper,
  ScrollReveal,
  SectionHeading,
  StaggeredText,
} from '../components/ui/DesignSystem';

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

export const HomePage: React.FC = () => {
  const { publishedBlogs, categories, projects, profile, subscribeNewsletter } = useData();
  const educationLabel = profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year';

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subStatus, setSubStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [subMessage, setSubMessage] = useState('');

  // Dynamic statistics calculated strictly from actual published content
  const articlesPublished = publishedBlogs.length;
  const weeksOfLearning = new Set(publishedBlogs.map((b) => b.week)).size;
  const topicsExplored = new Set([
    ...publishedBlogs.map((b) => b.category),
    ...publishedBlogs.flatMap((b) => b.tags),
  ]).size;
  const projectsCompleted = projects.length;

  // Featured articles (1 large lead featured card + companion featured cards)
  const featuredBlogs = publishedBlogs.filter((b) => b.featured);
  const displayFeatured =
    featuredBlogs.length >= 3 ? featuredBlogs.slice(0, 3) : publishedBlogs.slice(0, 3);
  const leadFeaturedArticle = displayFeatured[0];
  const secondaryFeaturedArticles = displayFeatured.slice(1, 3);

  // Latest published blogs sorted chronologically
  const latestBlogs = [...publishedBlogs]
    .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate) || b.week - a.week)
    .slice(0, 3);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubStatus('idle');
    setSubMessage('');
    if (!email.trim()) {
      setSubStatus('error');
      setSubMessage('Please enter your email address before subscribing.');
      return;
    }
    setSubmitting(true);
    try {
      await subscribeNewsletter(email);
      setSubStatus('success');
      setSubMessage('Thank you for subscribing! You will receive weekly CS learning dispatches.');
      setEmail('');
    } catch (err) {
      setSubStatus('error');
      setSubMessage(err instanceof Error ? err.message : 'Subscription failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF]">
      <SEOHead
        title="LearnWithMe — Personal CS Learning Blog & Weekly Developer Journal"
        description="Every week, a new lesson. Every lesson, a new beginning. Explore weekly computer science tutorials, Java programming, data structures, algorithms, and projects."
        path="/"
      />

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-18 lg:pb-28 border-b border-[#EDE0D5] bg-gradient-to-br from-[#FFF8EF] via-[#F9EFE8] to-[#F7DDE1]/45">
        <FloatingPastelDecor />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
            {/* Left Column: Editorial Typographic Hierarchy */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 editorial-page-enter">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#594438] font-medium">
                <span>By {profile.name}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#887467]">{educationLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#594438]">Learn. Create. Share. Grow.</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-semibold text-[#594438] leading-[1.15] tracking-tight">
                <StaggeredText text="Every week, a new lesson." />{' '}
                <span className="italic font-normal text-[#887467] block sm:inline">
                  <StaggeredText text="Every lesson, a new beginning." />
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-[#887467] leading-relaxed max-w-2xl">
                Hi! I&apos;m <strong className="text-[#594438] font-semibold">{profile.name}</strong> (
                <span className="text-[#594438] font-medium">{educationLabel}</span>). Welcome to my
                learning journal — a space where I document my discoveries, explore technology,
                share practical knowledge and grow one week at a time.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <MagneticWrapper className="w-full sm:w-auto">
                  <Link
                    to="/blogs"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#D9A5A5] text-[#594438] font-semibold text-sm hover:bg-[#d19595] hover:-translate-y-0.5 active:scale-[0.985] transition-all shadow-[0_8px_24px_-6px_rgba(217,165,165,0.5)] whitespace-nowrap group"
                  >
                    <span>Explore My Blogs</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticWrapper>

                <MagneticWrapper className="w-full sm:w-auto">
                  <Link
                    to="/about"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#EDE0D5] text-[#594438] font-medium text-sm hover:border-[#D9BFA9] hover:bg-[#F9EFE8] hover:-translate-y-0.5 active:scale-[0.985] transition-all whitespace-nowrap"
                  >
                    <span>My Learning Journey</span>
                  </Link>
                </MagneticWrapper>
              </div>
            </div>

            {/* Right Column: Layered Editorial Cards & Live Animated Study Illustration */}
            <div className="lg:col-span-5 relative editorial-page-enter">
              {/* Soft offset floating background card layer */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute -inset-3 rounded-[26px] bg-gradient-to-tr from-[#EADCCB]/55 via-[#F7DDE1]/55 to-transparent editorial-float-bg"
              />

              <div className="relative rounded-[20px] sm:rounded-[22px] bg-white border border-[#EDE0D5] p-4 sm:p-7 shadow-[0_24px_48px_-16px_rgba(89,68,56,0.1)] editorial-float">
                <div className="flex items-center justify-between pb-3.5 sm:pb-4 mb-4 sm:mb-5 border-b border-[#EDE0D5] text-[11px] sm:text-xs text-[#887467]">
                  <span className="font-mono uppercase tracking-wider text-[#594438] font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D9A5A5] animate-pulse" />
                    WEEKLY JOURNAL EDITION
                  </span>
                  <span className="font-mono tabular-nums">
                    {articlesPublished === 0
                      ? 'Learn. Create. Share. Grow.'
                      : `${articlesPublished} ${articlesPublished === 1 ? 'Article' : 'Articles'}`}
                  </span>
                </div>

                {/* Editorial Notebook & Live Mental Model Illustration */}
                <div className="rounded-[14px] sm:rounded-[16px] overflow-hidden border border-[#EDE0D5] bg-[#FFF8EF] mb-4 sm:mb-5">
                  <svg viewBox="0 0 520 300" className="w-full h-auto block" aria-hidden="true">
                    <defs>
                      <linearGradient id="heroCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF8EF" />
                        <stop offset="55%" stopColor="#F9EFE8" />
                        <stop offset="100%" stopColor="#F7DDE1" />
                      </linearGradient>
                    </defs>
                    <rect width="520" height="300" fill="url(#heroCardGrad)" />
                    <circle cx="430" cy="70" r="85" fill="#F7DDE1" opacity="0.65" />
                    <circle cx="80" cy="240" r="95" fill="#EADCCB" opacity="0.6" />
                    {/* Open Notebook Spread */}
                    <rect x="65" y="45" width="390" height="210" rx="16" fill="#FFFFFF" stroke="#EDE0D5" strokeWidth="2" />
                    <line x1="260" y1="45" x2="260" y2="255" stroke="#EDE0D5" strokeWidth="1.5" />
                    {/* Left Page */}
                    <text x="90" y="82" fill="#594438" fontSize="13" fontWeight="600" fontFamily="Playfair Display, serif">
                      Weekly Concept Notes
                    </text>
                    <rect
                      x="90"
                      y="98"
                      width="135"
                      height="6"
                      rx="3"
                      fill="#EADCCB"
                      className="svg-scale-bar"
                    />
                    <rect
                      x="90"
                      y="114"
                      width="115"
                      height="6"
                      rx="3"
                      fill="#F7DDE1"
                      className="svg-scale-bar"
                    />
                    <rect x="90" y="130" width="140" height="6" rx="3" fill="#EDE0D5" />
                    <rect x="90" y="154" width="145" height="72" rx="10" fill="#FFF8EF" stroke="#D9BFA9" strokeWidth="1.2" />
                    <text x="102" y="176" fill="#594438" fontSize="10" fontFamily="JetBrains Mono, monospace">
                      while (learning) &#123;
                    </text>
                    <text x="112" y="194" fill="#887467" fontSize="10" fontFamily="JetBrains Mono, monospace">
                      build();
                    </text>
                    <text x="112" y="210" fill="#887467" fontSize="10" fontFamily="JetBrains Mono, monospace">
                      shareWeekly();
                    </text>
                    <text x="102" y="222" fill="#594438" fontSize="10" fontFamily="JetBrains Mono, monospace">
                      &#125;
                    </text>
                    {/* Right Page: Animated Graph Traversal */}
                    <text x="285" y="82" fill="#594438" fontSize="13" fontWeight="600" fontFamily="Playfair Display, serif">
                      Visual Mental Model
                    </text>
                    <line
                      x1="355"
                      y1="115"
                      x2="315"
                      y2="165"
                      stroke="#D9BFA9"
                      strokeWidth="2.2"
                      className="svg-flow-line"
                    />
                    <line
                      x1="355"
                      y1="115"
                      x2="395"
                      y2="165"
                      stroke="#D9BFA9"
                      strokeWidth="2.2"
                      className="svg-flow-line"
                    />
                    <line x1="315" y1="165" x2="355" y2="212" stroke="#D9A5A5" strokeWidth="2" className="svg-flow-line" />
                    <line x1="395" y1="165" x2="355" y2="212" stroke="#D9A5A5" strokeWidth="2" className="svg-flow-line" />
                    <circle
                      cx="355"
                      cy="115"
                      r="16"
                      fill="#D9A5A5"
                      className="svg-pulse-node"
                    />
                    <circle
                      cx="315"
                      cy="165"
                      r="15"
                      fill="#FFF8EF"
                      stroke="#594438"
                      strokeWidth="1.5"
                      className="svg-pulse-node"
                    />
                    <circle
                      cx="395"
                      cy="165"
                      r="15"
                      fill="#F7DDE1"
                      stroke="#D9A5A5"
                      strokeWidth="1.5"
                      className="svg-pulse-node"
                    />
                    <circle
                      cx="355"
                      cy="212"
                      r="15"
                      fill="#EADCCB"
                      stroke="#594438"
                      strokeWidth="1.5"
                      className="svg-pulse-node"
                    />
                  </svg>
                </div>

                {leadFeaturedArticle ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-mono text-[#887467]">
                        Featured · Week {String(leadFeaturedArticle.week).padStart(2, '0')}
                      </p>
                      <Link
                        to={`/blog/${leadFeaturedArticle.slug}`}
                        data-cursor="read"
                        className="font-display text-sm sm:text-base font-semibold text-[#594438] hover:text-[#b57373] transition-colors line-clamp-1"
                      >
                        {leadFeaturedArticle.title}
                      </Link>
                    </div>
                    <Link
                      to={`/blog/${leadFeaturedArticle.slug}`}
                      className="inline-flex items-center justify-center px-3.5 py-2.5 sm:py-2 rounded-xl bg-[#F9EFE8] text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] transition-colors shrink-0"
                    >
                      Read Article →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className="space-y-0.5">
                      <p className="font-display text-sm sm:text-base font-semibold text-[#594438]">
                        My learning journey starts here.
                      </p>
                      <p className="text-xs font-mono text-[#887467]">
                        First article coming soon · {profile.name}
                      </p>
                    </div>
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-[#F9EFE8] text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] transition-colors shrink-0"
                    >
                      About Me →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LEARNING STATISTICS SECTION */}
      <section className="py-8 sm:py-12 bg-[#FFFFFF] border-b border-[#EDE0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
            {[
              {
                label: 'Articles Published',
                value: articlesPublished,
                suffix: 'Articles',
                note: 'Calculated from live archive',
              },
              {
                label: 'Weeks of Learning',
                value: weeksOfLearning,
                suffix: 'Weeks',
                note: 'Documented step by step',
              },
              {
                label: 'Topics Explored',
                value: topicsExplored,
                suffix: 'Topics',
                note: 'Across CS & programming',
              },
              {
                label: 'Projects Completed',
                value: projectsCompleted,
                suffix: 'Projects',
                note: 'Practical implementations',
              },
            ].map((stat, idx) => (
              <ScrollReveal key={stat.label} delay={idx * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="p-4 sm:p-6 rounded-[16px] sm:rounded-[18px] bg-[#FFF8EF] border border-[#EDE0D5] flex flex-col justify-between h-full hover:border-[#D9A5A5] hover:shadow-[0_12px_28px_-10px_rgba(89,68,56,0.08)] transition-all"
                >
                  <span className="text-[11px] sm:text-xs text-[#887467] font-medium">{stat.label}</span>
                  <div className="my-2 flex items-baseline gap-1.5 sm:gap-2">
                    <AnimatedCounter
                      value={stat.value}
                      className="font-display text-2xl sm:text-4xl font-semibold text-[#594438] tabular-nums"
                    />
                    <span className="text-[11px] sm:text-xs font-mono text-[#887467]">{stat.suffix}</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#887467]">{stat.note}</span>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED ARTICLES SECTION */}
      <section className="py-14 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeading
            kicker="Curated Dispatches"
            title="Featured Articles"
            description="Selected weekly deep dives with visual mental models, architecture diagrams, and clean code examples."
          />
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#594438] hover:text-[#b57373] transition-colors whitespace-nowrap"
          >
            <span>Browse All Weekly Blogs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {publishedBlogs.length === 0 ? (
          <ScrollReveal>
            <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-10 sm:p-14 text-center shadow-[0_6px_24px_-10px_rgba(89,68,56,0.05)] max-w-3xl mx-auto space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#D9A5A5] font-semibold">
                First article coming soon
              </p>
              <h3 className="font-display text-2xl sm:text-4xl font-semibold text-[#594438]">
                My learning journey starts here.
              </h3>
              <p className="text-sm sm:text-base text-[#887467] max-w-xl mx-auto leading-relaxed">
                By <strong className="text-[#594438] font-medium">{profile.name}</strong> (
                {educationLabel}) · Learn. Create. Share. Grow.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Large Featured Article Card */}
            {leadFeaturedArticle && (
              <BlogCard blog={leadFeaturedArticle} featuredVariant index={0} />
            )}

            {/* Companion Featured Cards */}
            {secondaryFeaturedArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                {secondaryFeaturedArticles.map((blog, idx) => (
                  <BlogCard key={blog.id} blog={blog} index={idx + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. LEARNING JOURNEY & AUTHOR PROFILE SECTION */}
      <section className="py-20 lg:py-24 bg-[#F9EFE8] border-y border-[#EDE0D5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Personal Introduction & Philosophy */}
            <ScrollReveal className="lg:col-span-6 space-y-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#594438] font-medium">
                Meet the Author · Learn. Create. Share. Grow.
              </p>
              <h2 className="font-serif-section text-3xl sm:text-4xl lg:text-[42px] text-[#594438] leading-tight">
                Hi! I&apos;m {profile.name}.
              </h2>
              <p className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#594438] font-semibold">
                {educationLabel} · Computer Science &amp; Engineering
              </p>
              <p className="text-base text-[#887467] leading-relaxed">
                I&apos;m a second-year{' '}
                <strong className="text-[#594438] font-medium">
                  Integrated M.Tech Computer Science and Engineering
                </strong>{' '}
                student passionate about technology, programming and exploring new ideas. I enjoy
                learning new concepts, solving problems and building projects that turn ideas into
                reality.
              </p>
              <p className="text-base text-[#887467] leading-relaxed">
                <strong className="text-[#594438] font-medium">LearnWithMe</strong> is my personal
                learning space where I share my weekly learning experiences, technical knowledge,
                programming concepts, projects and discoveries. I believe that every small step in
                learning contributes to something bigger.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#EDE0D5] text-sm font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                >
                  <span>Read Full About Me Profile</span>
                  <ArrowRight className="w-4 h-4 text-[#D9A5A5]" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Right Column: Editable Author Profile Card & Weekly Learning Cycle */}
            <ScrollReveal delay={0.1} className="lg:col-span-6 space-y-6">
              {/* Small Profile Section with Editable Profile-Photo Placeholder */}
              <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-6 sm:p-8 shadow-[0_14px_34px_-14px_rgba(89,68,56,0.08)]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <ProfilePhotoPlaceholder size="md" editable />

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-mono uppercase tracking-widest text-[#887467]">
                        Author Profile · Learn. Create. Share. Grow.
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-[#594438]">
                        {profile.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-[#594438]">
                        {educationLabel}
                      </p>
                      <p className="text-xs text-[#887467]">
                        {profile.degree || 'Integrated Master of Technology (Integrated M.Tech)'} ·{' '}
                        {profile.branch || 'Computer Science and Engineering (CSE)'}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-[#887467] italic pt-1 border-t border-[#EDE0D5]">
                      &ldquo;My goal is to keep learning, improve my technical skills and share
                      useful knowledge with others along the way.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Learning Cycle */}
              <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-6 sm:p-7 shadow-[0_14px_34px_-14px_rgba(89,68,56,0.06)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EDE0D5]">
                  <span className="font-serif-section text-base sm:text-lg text-[#594438]">
                    The Weekly Learning Cycle
                  </span>
                  <span className="text-xs font-mono text-[#887467]">Learn. Create. Share. Grow.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    {
                      step: '01.',
                      title: 'Study & Explore',
                      desc: 'Break down a new programming or CS concept each week.',
                    },
                    {
                      step: '02.',
                      title: 'Sketch & Code',
                      desc: 'Design mental models and write clean, tested code.',
                    },
                    {
                      step: '03.',
                      title: 'Publish & Share',
                      desc: 'Share structured notes and takeaways on LearnWithMe.',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="p-4 rounded-[16px] bg-[#FFF8EF] border border-[#EDE0D5] space-y-1.5"
                    >
                      <span className="font-mono text-xs font-semibold text-[#D9A5A5]">
                        {item.step}
                      </span>
                      <h4 className="font-display text-sm sm:text-base font-semibold text-[#594438]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#887467] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. CATEGORIES SECTION */}
      <section className="py-20 lg:py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <SectionHeading
            kicker="Curriculum Topics"
            title="Explore Categories"
            description="Navigate weekly notes across core computer science subjects, programming paradigms, and hands-on engineering projects."
          />
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#594438] hover:text-[#b57373] transition-colors whitespace-nowrap"
          >
            <span>View All {categories.length} Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = ICON_MAP[cat.icon] || BookOpen;
            const count = publishedBlogs.filter(
              (b) => b.category.toLowerCase() === cat.name.toLowerCase()
            ).length;

            return (
              <ScrollReveal key={cat.id} delay={Math.min(idx * 0.04, 0.24)}>
                <Link
                  to={`/blogs?category=${encodeURIComponent(cat.name)}`}
                  className="group block h-full p-6 rounded-[18px] bg-white border border-[#EDE0D5] hover:border-[#D9A5A5] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_16px_-6px_rgba(89,68,56,0.04)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#F7DDE1]/55 border border-[#EDE0D5] flex items-center justify-center text-[#594438] group-hover:bg-[#D9A5A5] group-hover:text-white transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono tabular-nums text-[#887467]">
                      {count === 0
                        ? 'No articles published yet.'
                        : `${count} ${count === 1 ? 'Article' : 'Articles'}`}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#887467] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 6. LATEST BLOGS SECTION */}
      <section className="py-20 lg:py-24 bg-[#F7DDE1]/25 border-t border-[#EDE0D5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <SectionHeading
              kicker="Fresh From The Journal"
              title="Latest Blogs"
              description="The newest weekly computer science lessons and programming walkthroughs."
            />
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#594438] hover:text-[#b57373] transition-colors whitespace-nowrap"
            >
              <span>Explore Full Archive</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestBlogs.length === 0 ? (
            <ScrollReveal>
              <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-10 sm:p-14 text-center shadow-[0_6px_24px_-10px_rgba(89,68,56,0.05)] max-w-3xl mx-auto space-y-3">
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#D9A5A5] font-semibold">
                  First article coming soon
                </p>
                <h3 className="font-display text-2xl sm:text-4xl font-semibold text-[#594438]">
                  My learning journey starts here.
                </h3>
                <p className="text-sm text-[#887467] max-w-lg mx-auto leading-relaxed">
                  New weekly computer science articles written by{' '}
                  <strong className="text-[#594438] font-medium">{profile.name}</strong> will appear
                  here automatically as soon as they are published.
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogs.map((blog, idx) => (
                <BlogCard key={blog.id} blog={blog} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEWSLETTER SUBSCRIPTION SECTION */}
      <section className="py-20 lg:py-24 max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <div className="rounded-[22px] bg-gradient-to-br from-[#F9EFE8] via-[#FFF8EF] to-[#F7DDE1]/60 border border-[#EDE0D5] p-8 sm:p-12 lg:p-14 text-center shadow-[0_16px_40px_-16px_rgba(89,68,56,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#594438] font-medium mb-3">
              Weekly Learning Dispatch
            </p>
            <h2 className="font-serif-section text-3xl sm:text-4xl text-[#594438] max-w-xl mx-auto">
              Never miss a weekly computer science note.
            </h2>
            <p className="text-sm sm:text-base text-[#887467] max-w-lg mx-auto mt-3 mb-8 leading-relaxed">
              Subscribe to receive a calm, distraction-free summary whenever a new programming
              tutorial, algorithm walkthrough, or project note is published.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              noValidate
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email Address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your college or personal email..."
                className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-[#EDE0D5] text-sm text-[#594438] placeholder-[#887467]/70 focus:outline-none focus:border-[#D9A5A5]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D9A5A5] text-[#594438] font-semibold text-sm hover:bg-[#d19595] transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>

            {subStatus !== 'idle' && (
              <div
                role="status"
                className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${
                  subStatus === 'success'
                    ? 'bg-white border border-[#EDE0D5] text-[#594438]'
                    : 'bg-[#F7DDE1] border border-[#D9A5A5] text-[#594438]'
                }`}
              >
                {subStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#594438] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#594438] shrink-0" />
                )}
                <span>{subMessage}</span>
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
