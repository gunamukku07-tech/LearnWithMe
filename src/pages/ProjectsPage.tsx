import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Github, ExternalLink, Edit3, X, Layers, FolderGit2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Project } from '../types';
import { EditorialArtwork } from '../components/EditorialArtwork';
import { SEOHead } from '../components/SEOHead';

export const ProjectsPage: React.FC = () => {
  const { projects, profile, isAdmin } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="min-h-screen bg-[#FFF8EF] pb-24">
      <SEOHead
        title={`Projects Showcase — ${profile.name} | LearnWithMe`}
        description="Explore software engineering projects and builds created alongside weekly computer science lessons on LearnWithMe."
        path="/projects"
      />

      {/* Header */}
      <section className="py-14 lg:py-20 bg-gradient-to-b from-[#F9EFE8] to-[#FFF8EF] border-b border-[#EDE0D5]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-4 editorial-page-enter">
            <p className="text-xs uppercase tracking-[0.2em] text-[#594438] font-medium">
              Practical Application Lab · Learn. Create. Share. Grow.
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#594438] tracking-tight">
              Projects &amp; Code Builds
            </h1>
            <p className="text-base sm:text-lg text-[#887467] leading-relaxed">
              Theory becomes permanent when turned into working code. Below are the projects and
              implementations built by <strong className="text-[#594438] font-medium">{profile.name}</strong>{' '}
              ({profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year'}).
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-colors shrink-0 self-start md:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#D9A5A5]" />
              <span>Manage Projects in Admin</span>
            </Link>
          )}
        </div>
      </section>

      {/* Projects Grid or Empty State */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {projects.length === 0 ? (
          <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-10 sm:p-16 text-center max-w-2xl mx-auto space-y-4 shadow-[0_6px_24px_-10px_rgba(89,68,56,0.05)]">
            <div className="w-12 h-12 rounded-2xl bg-[#F7DDE1]/65 border border-[#EDE0D5] flex items-center justify-center text-[#594438] mx-auto">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#594438]">
              Projects coming soon.
            </h2>
            <p className="text-sm sm:text-base text-[#887467] leading-relaxed max-w-md mx-auto">
              By <strong className="text-[#594438] font-medium">{profile.name}</strong> (
              {profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year'}) · Learn. Create. Share.
              Grow.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => {
              const hasGithub = Boolean(proj.githubUrl && proj.githubUrl.trim());
              const hasDemo = Boolean(proj.demoUrl && proj.demoUrl.trim());
              const isInternalDemo = hasDemo && proj.demoUrl.startsWith('/');

              return (
                <article
                  key={proj.id}
                  className="group rounded-[20px] bg-white border border-[#EDE0D5] overflow-hidden flex flex-col justify-between shadow-[0_6px_24px_-10px_rgba(89,68,56,0.06)] hover:border-[#D9BFA9] hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedProject(proj)}
                      className="block w-full text-left cursor-pointer"
                    >
                      <EditorialArtwork
                        src={proj.coverImage}
                        alt={proj.name}
                        category="Project"
                        aspectClass="aspect-[16/10]"
                      />
                    </button>

                    <div className="p-6 sm:p-7 space-y-3">
                      {proj.technologies.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-[#887467]">
                          <span>{proj.technologies.join(' · ')}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedProject(proj)}
                        className="text-left cursor-pointer"
                      >
                        <h2 className="font-display text-2xl font-semibold text-[#594438] group-hover:text-[#b57373] transition-colors leading-snug">
                          {proj.name}
                        </h2>
                      </button>

                      <p className="text-sm text-[#887467] leading-relaxed">{proj.description}</p>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 pt-4 border-t border-[#EDE0D5]/80 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      {hasGithub && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#594438] hover:underline"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedProject(proj)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#887467] hover:text-[#594438] cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>

                    {hasDemo &&
                      (isInternalDemo ? (
                        <Link
                          to={proj.demoUrl}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F9EFE8] text-xs font-semibold text-[#594438] hover:bg-[#D9A5A5] transition-colors"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F9EFE8] text-xs font-semibold text-[#594438] hover:bg-[#D9A5A5] transition-colors"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Elegant Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 z-50 bg-[#594438]/30 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full max-h-[88dvh] overflow-y-auto rounded-[20px] sm:rounded-[22px] bg-[#FFF8EF] border border-[#EDE0D5] shadow-2xl"
            >
              <div className="relative">
                <EditorialArtwork
                  src={selectedProject.coverImage}
                  alt={selectedProject.name}
                  aspectClass="aspect-[16/9] sm:aspect-[16/8]"
                />
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project details"
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 rounded-full bg-white/95 border border-[#EDE0D5] text-[#594438] hover:bg-white cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 sm:p-8 space-y-4 sm:space-y-5 bg-white">
                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-[#887467]">
                    Project by {profile.name}
                  </p>
                  <h2 className="font-display text-xl sm:text-3xl font-semibold text-[#594438]">
                    {selectedProject.name}
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-[#887467] leading-relaxed">
                  {selectedProject.description}
                </p>

                {selectedProject.technologies.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-[#594438]">Technologies Used:</p>
                    <p className="text-xs text-[#887467]">
                      {selectedProject.technologies.join(' · ')}
                    </p>
                  </div>
                )}

                {(selectedProject.githubUrl?.trim() || selectedProject.demoUrl?.trim()) && (
                  <div className="pt-4 border-t border-[#EDE0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    {selectedProject.githubUrl?.trim() && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] truncate"
                      >
                        <Github className="w-4 h-4 shrink-0" />
                        <span className="truncate">GitHub Repository</span>
                      </a>
                    )}

                    {selectedProject.demoUrl?.trim() &&
                      (selectedProject.demoUrl.startsWith('/') ? (
                        <Link
                          to={selectedProject.demoUrl}
                          onClick={() => setSelectedProject(null)}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-[#D9A5A5] text-xs font-semibold text-[#594438]"
                        >
                          <span>Open Live Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <a
                          href={selectedProject.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-[#D9A5A5] text-xs font-semibold text-[#594438]"
                        >
                          <span>Open Live Demo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
