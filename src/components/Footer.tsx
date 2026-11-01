import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { profile, categories } = useData();
  const currentYear = new Date().getFullYear();
  const authorName = profile.name || 'Guna Sekhar';
  const educationBadge = profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year';

  return (
    <footer className="bg-[#F9EFE8] border-t border-[#EDE0D5] text-[#887467]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#EDE0D5]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link
              to="/"
              className="inline-block text-2xl font-display font-semibold text-[#594438] tracking-tight"
            >
              LearnWithMe
            </Link>
            <p className="text-xs uppercase tracking-[0.18em] text-[#594438] font-medium">
              {authorName} · {educationBadge}
            </p>
            <p className="text-xs font-mono text-[#594438] font-semibold">
              Learn. Create. Share. Grow.
            </p>
            <p className="text-sm text-[#887467] leading-relaxed max-w-md">
              A personal computer science learning space where I share my weekly learning
              experiences, technical knowledge, programming concepts, projects and discoveries.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {profile.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  aria-label="Send Email"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              ) : (
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] hover:-translate-y-0.5 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D9A5A5]" />
                  <span>Send a Message</span>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-serif-section text-base text-[#594438]">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#594438] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#594438] transition-colors">
                  About Me
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-[#594438] transition-colors">
                  Weekly Blogs
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-[#594438] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-[#594438] transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#594438] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 text-[#594438] font-medium hover:underline"
                >
                  <span>Admin Dashboard</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Curated Topics Column */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-serif-section text-base text-[#594438]">Explore Topics</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/blogs?category=${encodeURIComponent(cat.name)}`}
                    className="hover:text-[#594438] transition-colors block truncate"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#887467]">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center sm:text-left">
            <p className="font-medium text-[#594438]">
              Created and maintained by {authorName}
            </p>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <p>© {currentYear} LearnWithMe ({educationBadge}).</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/blogs" className="hover:text-[#594438] transition-colors">
              Weekly Archive
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/about" className="hover:text-[#594438] transition-colors">
              About {authorName}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/contact" className="hover:text-[#594438] transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
