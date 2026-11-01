import React from 'react';
import { Link } from 'react-router-dom';
import {
  Github,
  Linkedin,
  Mail,
  GraduationCap,
  Sparkles,
  Target,
  Code2,
  BookOpen,
  Edit3,
  Quote,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SEOHead } from '../components/SEOHead';
import { ProfilePhotoPlaceholder } from '../components/ProfilePhotoPlaceholder';
import { AnimatedCounter, ScrollReveal } from '../components/ui/DesignSystem';

export const AboutPage: React.FC = () => {
  const { profile, publishedBlogs, projects, isAdmin } = useData();

  const introParagraphs = (profile.introduction || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const educationBadge = profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year';
  const degreeText =
    profile.degree || 'Integrated Master of Technology (Integrated M.Tech)';
  const branchText = profile.branch || 'Computer Science and Engineering (CSE)';
  const yearText = profile.currentYear || '2nd Year';

  return (
    <div className="min-h-screen bg-[#FFF8EF] pb-24">
      <SEOHead
        title={`About ${profile.name} (${educationBadge}) — LearnWithMe`}
        description={`Hi! I'm ${profile.name}, a second-year Integrated M.Tech Computer Science and Engineering student sharing weekly learning experiences on LearnWithMe.`}
        path="/about"
      />

      {/* 1. INTRODUCTION & PERSONAL PROFILE SECTION */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-[#F9EFE8] to-[#FFF8EF] border-b border-[#EDE0D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Editorial Bio */}
            <div className="lg:col-span-7 space-y-5 editorial-page-enter">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#594438] font-medium">
                <span>About Me</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#887467]">Learn. Create. Share. Grow.</span>
              </div>

              <div className="space-y-2">
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#594438] leading-tight">
                  {profile.name}
                </h1>
                <p className="font-serif-section text-xl sm:text-2xl text-[#887467]">
                  {educationBadge}
                </p>
              </div>

              {/* Multi-paragraph Personal About Me Narrative */}
              <div className="space-y-4 pt-2">
                {introParagraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`leading-relaxed ${
                      idx === 0
                        ? 'text-base sm:text-lg text-[#594438] font-medium'
                        : idx === introParagraphs.length - 1
                        ? 'text-base text-[#594438] italic border-l-2 border-[#D9A5A5] pl-4 py-0.5'
                        : 'text-sm sm:text-base text-[#887467]'
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Connect & Correspondence (Only real links or Contact page, no invented URLs) */}
              <div className="pt-4 space-y-2.5">
                <p className="text-xs uppercase tracking-[0.16em] text-[#594438] font-semibold">
                  Connect &amp; Correspondence
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                    >
                      <Github className="w-4 h-4 text-[#D9A5A5]" />
                      <span>GitHub</span>
                    </a>
                  )}

                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                    >
                      <Linkedin className="w-4 h-4 text-[#D9A5A5]" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {profile.email ? (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                    >
                      <Mail className="w-4 h-4 text-[#D9A5A5]" />
                      <span>{profile.email}</span>
                    </a>
                  ) : (
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-all"
                    >
                      <Mail className="w-4 h-4 text-[#D9A5A5]" />
                      <span>Send a Message</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F7DDE1]/70 text-xs font-medium text-[#594438] hover:bg-[#D9A5A5] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile in Admin</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Editable Profile-Photo Placeholder & Academic Card */}
            <div className="lg:col-span-5 editorial-page-enter">
              <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-6 sm:p-8 shadow-[0_18px_40px_-15px_rgba(89,68,56,0.08)] space-y-6 editorial-float">
                <div className="rounded-[18px] bg-gradient-to-br from-[#FFF8EF] via-[#F9EFE8] to-[#F7DDE1]/65 border border-[#EDE0D5] flex flex-col items-center justify-center p-6 sm:p-7 text-center">
                  <ProfilePhotoPlaceholder size="lg" editable />

                  <h2 className="font-display text-2xl font-semibold text-[#594438] mt-4">
                    {profile.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#594438] mt-1">
                    {educationBadge}
                  </p>
                  <p className="text-xs text-[#887467] mt-1">
                    {degreeText} · {branchText}
                  </p>
                </div>

                {/* Structured Academic Profile Details */}
                <div className="space-y-2.5 text-xs border-t border-[#EDE0D5] pt-4">
                  <div className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-xl bg-[#FFF8EF]">
                    <span className="text-[#887467] font-medium">Program</span>
                    <span className="font-semibold text-[#594438] text-right">
                      Integrated M.Tech
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-xl bg-[#FFF8EF]">
                    <span className="text-[#887467] font-medium">Branch</span>
                    <span className="font-semibold text-[#594438] text-right">
                      {branchText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-xl bg-[#FFF8EF]">
                    <span className="text-[#887467] font-medium">Current Year</span>
                    <span className="font-mono font-semibold text-[#594438] text-right">
                      {yearText}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#EDE0D5] text-center">
                  <div className="p-3 rounded-xl bg-[#FFF8EF]">
                    <AnimatedCounter
                      value={publishedBlogs.length}
                      className="font-display text-2xl font-semibold text-[#594438] tabular-nums block"
                    />
                    <p className="text-[11px] text-[#887467]">Published Blogs</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFF8EF]">
                    <AnimatedCounter
                      value={projects.length}
                      className="font-display text-2xl font-semibold text-[#594438] tabular-nums block"
                    />
                    <p className="text-[11px] text-[#887467]">Projects Showcase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Profile Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* My Education */}
          <ScrollReveal>
            <section className="h-full p-7 sm:p-8 rounded-[20px] bg-white border border-[#EDE0D5] space-y-4 shadow-xs">
              <div className="flex items-center gap-3 text-[#594438]">
                <div className="w-10 h-10 rounded-xl bg-[#F9EFE8] border border-[#EDE0D5] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#D9A5A5]" />
                </div>
                <div>
                  <h2 className="font-serif-section text-2xl text-[#594438]">My Education</h2>
                  <p className="text-xs font-mono text-[#887467]">{educationBadge}</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-2xl bg-[#FFF8EF] border border-[#EDE0D5] space-y-1.5">
                  <p className="font-display text-base sm:text-lg font-semibold text-[#594438]">
                    {degreeText}
                  </p>
                  <p className="text-sm text-[#594438] font-medium">{branchText}</p>
                  <p className="text-xs font-mono text-[#887467]">Current Year: {yearText}</p>
                </div>
                <p className="text-sm text-[#887467] leading-relaxed">{profile.education}</p>
              </div>
            </section>
          </ScrollReveal>

          {/* My Learning Philosophy */}
          <ScrollReveal delay={0.08}>
            <section className="h-full p-7 sm:p-8 rounded-[20px] bg-white border border-[#EDE0D5] space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#594438]">
                  <div className="w-10 h-10 rounded-xl bg-[#F7DDE1]/55 border border-[#EDE0D5] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#594438]" />
                  </div>
                  <h2 className="font-serif-section text-2xl text-[#594438]">
                    My Learning Philosophy
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-[#887467] leading-relaxed">
                  {profile.learningPhilosophy}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F9EFE8] border border-[#EDE0D5] flex items-start gap-3">
                <Quote className="w-4 h-4 text-[#D9A5A5] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm italic text-[#594438]">
                  "I believe that every small step in learning contributes to something bigger."
                </p>
              </div>
            </section>
          </ScrollReveal>
        </div>

        {/* My Interests & Technical Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ScrollReveal>
            <section className="h-full p-7 sm:p-8 rounded-[20px] bg-[#F9EFE8] border border-[#EDE0D5] space-y-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#D9A5A5]" />
                <h2 className="font-serif-section text-2xl text-[#594438]">My Interests</h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#887467]">
                {profile.interests.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#594438] mt-1">
                      0{idx + 1}.
                    </span>
                    <span className="text-[#594438] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <section className="h-full p-7 sm:p-8 rounded-[20px] bg-white border border-[#EDE0D5] space-y-5">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-[#D9A5A5]" />
                <h2 className="font-serif-section text-2xl text-[#594438]">Technical Focus</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm font-medium text-[#594438]"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        </div>

        {/* My Goals */}
        <ScrollReveal>
          <section className="p-7 sm:p-10 rounded-[22px] bg-gradient-to-br from-[#FFF8EF] via-[#F9EFE8] to-[#F7DDE1]/45 border border-[#EDE0D5] space-y-6">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-[#594438]" />
              <h2 className="font-serif-section text-2xl sm:text-3xl text-[#594438]">My Goals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.goals.map((goal, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-[16px] bg-white border border-[#EDE0D5] flex items-start gap-3.5"
                >
                  <span className="font-mono text-xs font-semibold text-[#D9A5A5] mt-0.5">
                    0{idx + 1}.
                  </span>
                  <p className="text-sm text-[#887467] leading-relaxed">{goal}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
};
