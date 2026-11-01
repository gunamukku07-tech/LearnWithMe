import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  FolderGit2,
  User,
  Layers,
  LogOut,
  ShieldCheck,
  Code2,
  Bold,
  Italic,
  List,
  Table,
  Terminal,
  Quote,
  Upload,
  Mail,
  Users,
  Star,
  Image as ImageIcon,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Blog } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { EditorialArtwork } from '../components/EditorialArtwork';
import { SEOHead } from '../components/SEOHead';
import { ProfilePhotoPlaceholder } from '../components/ProfilePhotoPlaceholder';
import {
  isAuthorizedAdminEmail,
  isRunningInIframe,
  uploadCoverImageToStorage,
} from '../firebase';

type AdminTab = 'overview' | 'articles' | 'editor' | 'categories' | 'projects' | 'profile' | 'inbox';

const COVER_PRESETS = [
  { label: 'Java & JVM Architecture', value: 'editorial:java' },
  { label: 'Arrays & Contiguous Memory', value: 'editorial:arrays' },
  { label: 'Object-Oriented Hierarchy', value: 'editorial:oop' },
  { label: 'Trees & DSA Foundations', value: 'editorial:dsa' },
  { label: 'Graph Networks & Traversal', value: 'editorial:graphs' },
];

export const AdminDashboardPage: React.FC = () => {
  const {
    user,
    isAdmin,
    authLoading,
    isSigningIn,
    authError,
    signInAdmin,
    signOutAdmin,
    clearAuthError,
    blogs,
    publishedBlogs,
    categories,
    projects,
    profile,
    subscribers,
    messages,
    saveBlog,
    deleteBlog,
    toggleBlogStatus,
    saveCategory,
    deleteCategory,
    saveProject,
    deleteProject,
    saveProfile,
    markMessageRead,
    addToast,
  } = useData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Article Editor State
  const [editingBlogId, setEditingBlogId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [week, setWeek] = useState<number>(blogs.length + 1);
  const [category, setCategory] = useState<string>(categories[0]?.name || 'Programming');
  const [tagsInput, setTagsInput] = useState('Java, Computer Science, Weekly Note');
  const [coverImage, setCoverImage] = useState('editorial:java');
  const [readingTime, setReadingTime] = useState<number>(7);
  const [publicationStatus, setPublicationStatus] = useState<'published' | 'draft'>('published');
  const [featured, setFeatured] = useState<boolean>(false);
  const [keyTakeawaysInput, setKeyTakeawaysInput] = useState(
    'Core concept explained simply.\nPractical code example tested in lab.'
  );
  const [content, setContent] = useState(
    `## Introduction\n\nWrite your weekly computer science learning reflection here...\n\n## Basic Concepts\n\nExplain the fundamental idea in clear college-level English.\n\n\`\`\`java\npublic class WeeklyLesson {\n    public static void main(String[] args) {\n        System.out.println("Hello from LearnWithMe!");\n    }\n}\n\`\`\`\n\n## Conclusion\n\nSummarize what you learned and what you will explore next week.`
  );

  // Category Form State
  const [catId, setCatId] = useState<string | undefined>(undefined);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Code2');

  // Project Form State
  const [projId, setProjId] = useState<string | undefined>(undefined);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projCover, setProjCover] = useState('project:visualizer');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');

  // Profile Form State
  const [profForm, setProfForm] = useState(profile);

  useEffect(() => {
    setProfForm(profile);
  }, [profile]);

  const startNewArticle = () => {
    const nextWeek =
      blogs.length > 0 ? Math.max(...blogs.map((b) => b.week)) + 1 : 1;
    setEditingBlogId(undefined);
    setTitle('');
    setSlug('');
    setSubtitle('');
    setDescription('');
    setWeek(nextWeek);
    setCategory(categories[0]?.name || 'Programming');
    setTagsInput('Computer Science, Programming');
    setCoverImage('editorial:java');
    setReadingTime(6);
    setPublicationStatus('published');
    setFeatured(false);
    setKeyTakeawaysInput(
      'First key takeaway from this week.\nSecond practical lesson learned.'
    );
    setContent(
      `## Introduction\n\nThis week I explored...\n\n## Basic Concepts\n\nHere is how the architecture works:\n\n\`\`\`diagram\n[Input Data] ───▶ [Algorithm] ───▶ [Validated Output]\n\`\`\`\n\n## Code Example\n\n\`\`\`java\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Week ${nextWeek} Complete!");\n    }\n}\n\`\`\`\n\n## Conclusion\n\nKey reflections from Week ${nextWeek}.`
    );
    setPreviewMode(false);
    setActiveTab('editor');
  };

  const startEditArticle = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setSubtitle(blog.subtitle);
    setDescription(blog.description);
    setWeek(blog.week);
    setCategory(blog.category);
    setTagsInput(blog.tags.join(', '));
    setCoverImage(blog.coverImage);
    setReadingTime(blog.readingTime);
    setPublicationStatus(blog.status);
    setFeatured(blog.featured);
    setKeyTakeawaysInput((blog.keyTakeaways || []).join('\n'));
    setContent(blog.content);
    setPreviewMode(false);
    setActiveTab('editor');
  };

  const toggleFeaturedArticle = async (blog: Blog) => {
    await saveBlog({ ...blog, featured: !blog.featured });
  };

  const insertMarkdownSnippet = (snippet: string) => {
    setContent((prev) => `${prev}\n\n${snippet}`);
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image Size Limit', 'Please choose an image under 5MB.', 'error');
      return;
    }

    setUploadingCover(true);
    try {
      if (user && isAuthorizedAdminEmail(user.email)) {
        const downloadUrl = await uploadCoverImageToStorage(file);
        setCoverImage(downloadUrl);
        addToast('Uploaded to Firebase Storage', 'Cover image stored in Firebase Storage.');
        setUploadingCover(false);
        return;
      }
    } catch {
      // Fallback to data URI if Storage bucket isn't yet initialized in Firebase console
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverImage(reader.result);
        addToast('Cover Image Attached', 'Custom cover artwork attached to this article.');
      }
      setUploadingCover(false);
    };
    reader.onerror = () => {
      setUploadingCover(false);
      addToast('Upload Error', 'Could not read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveArticle = async (overrideStatus?: 'published' | 'draft') => {
    const finalStatus = overrideStatus || publicationStatus;
    if (!title.trim()) {
      addToast('Missing Title', 'Please enter an article title before saving.', 'error');
      return;
    }
    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

    const wordCount = content.trim().split(/\s+/).length;
    const computedReadTime = Math.max(1, Math.round(wordCount / 180));

    await saveBlog({
      id: editingBlogId,
      title,
      slug: generatedSlug,
      subtitle: subtitle || `Week ${week} learning notes on ${category}.`,
      description:
        description ||
        content
          .replace(/[#`*>-]/g, '')
          .trim()
          .slice(0, 180) + '...',
      content,
      week: Number(week) || 1,
      category,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage,
      publicationDate: new Date().toISOString().split('T')[0],
      readingTime: readingTime || computedReadTime,
      status: finalStatus,
      featured,
      isSample: false,
      keyTakeaways: keyTakeawaysInput
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean),
      authorName: profile.name,
      authorId: user?.uid || 'admin',
    });

    setActiveTab('articles');
  };

  if (!isAdmin) {
    const isBusy = authLoading || isSigningIn;

    return (
      <div className="min-h-[82vh] bg-[#FFF8EF] flex items-center justify-center px-6 py-16">
        <SEOHead
          title="Admin Dashboard Sign-In — LearnWithMe"
          description="Protected administrator portal for Guna Sekhar to publish weekly blogs, manage categories, and update projects."
          path="/admin"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full rounded-[22px] bg-white border border-[#EDE0D5] p-8 sm:p-10 shadow-[0_18px_40px_-16px_rgba(89,68,56,0.1)] space-y-6 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F7DDE1] border border-[#EDE0D5] flex items-center justify-center mx-auto text-[#594438]">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[#887467] font-medium">
              Protected Administrator Portal
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#594438]">
              LearnWithMe Admin Studio
            </h1>
            <p className="text-sm text-[#887467] leading-relaxed">
              Sign in with your authorized administrator Google account to manage and publish weekly
              articles, categories, projects, and profile details.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="text-left space-y-2 text-xs text-[#594438] bg-[#F7DDE1]/65 p-4 rounded-xl border border-[#D9A5A5]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-[#594438]">Authentication Notice</p>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="text-[11px] underline text-[#887467] hover:text-[#594438] cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
              <p className="leading-relaxed text-[#594438]/90">{authError}</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={signInAdmin}
              disabled={isBusy}
              className={`w-full py-3.5 px-6 rounded-xl bg-[#D9A5A5] text-[#594438] font-semibold text-sm transition-all shadow-xs inline-flex items-center justify-center gap-2.5 ${
                isBusy
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:bg-[#d19595] cursor-pointer'
              }`}
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#594438]" />
                  <span>
                    {isSigningIn
                      ? 'Connecting to Google Sign-In...'
                      : 'Checking Administrator Session...'}
                  </span>
                </>
              ) : (
                <span>Sign In with Google (Authorized Admin Only)</span>
              )}
            </button>
            {isRunningInIframe() ? (
              <div className="pt-1 space-y-1.5">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '/admin'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#594438] underline hover:text-[#887467] transition-colors"
                >
                  <span>Open Admin Portal in New Tab (Full-Page Redirect Sign-In)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <p className="text-[11px] text-[#887467]">
                  Opening in a full browser tab enables popup-free Google Redirect Sign-In.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-[#887467]">
                Uses secure full-page Google Redirect Sign-In (no popups required).
              </p>
            )}
          </div>

          {user && !isAuthorizedAdminEmail(user.email) && (
            <div className="space-y-2 text-xs text-[#594438] bg-[#F7DDE1]/60 p-4 rounded-xl border border-[#D9A5A5]">
              <p className="font-medium">
                Access is restricted exclusively to the authorized administrator Google account.
              </p>
              <button
                type="button"
                onClick={signOutAdmin}
                className="underline font-semibold cursor-pointer"
              >
                Sign out and switch account
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const draftBlogs = blogs.filter((b) => b.status === 'draft');

  return (
    <div className="min-h-screen bg-[#FFF8EF] pb-24">
      <SEOHead
        title="Admin Studio & Content Manager — LearnWithMe"
        description="Manage weekly computer science articles, rich Markdown drafts, categories, projects, and profile information."
        path="/admin"
      />

      {/* Admin Top Header */}
      <section className="py-6 sm:py-8 bg-[#F9EFE8] border-b border-[#EDE0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#594438] font-medium">
              LearnWithMe Content Management System
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#594438]">
              Private Admin Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={startNewArticle}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold hover:bg-[#d19595] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Weekly Article</span>
            </button>

            <Link
              to="/blogs"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9BFA9] transition-colors"
            >
              <span>Public Journal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={signOutAdmin}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Navigation Tabs (Smooth Horizontal Swipe on Phones) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3.5 mb-6 sm:mb-8 border-b border-[#EDE0D5] -mx-1 px-1">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'articles', label: `Articles (${blogs.length})`, icon: FileText },
            { id: 'editor', label: editingBlogId ? 'Edit Article' : 'Article Editor', icon: Edit3 },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Code2 },
            { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
            { id: 'profile', label: 'About Me & Links', icon: User },
            { id: 'inbox', label: `Inbox & Subscribers (${messages.length})`, icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#D9A5A5] text-[#594438] font-semibold shadow-xs'
                    : 'bg-white text-[#887467] hover:text-[#594438] border border-[#EDE0D5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 sm:space-y-10">
            {/* Overview KPI Cards: Total Published, Drafts, Total Categories, Total Projects */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {[
                {
                  label: 'Total Published Articles',
                  value: publishedBlogs.length,
                  sub: `${blogs.length} Total in Database`,
                },
                {
                  label: 'Draft Articles',
                  value: draftBlogs.length,
                  sub: 'Private Unpublished Notes',
                },
                {
                  label: 'Total Categories',
                  value: categories.length,
                  sub: 'Active CS Topics',
                },
                {
                  label: 'Total Projects',
                  value: projects.length,
                  sub: 'In Portfolio Showcase',
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="p-4 sm:p-6 rounded-[16px] sm:rounded-[18px] bg-white border border-[#EDE0D5] space-y-1.5 sm:space-y-2 shadow-xs"
                >
                  <span className="text-[11px] sm:text-xs text-[#887467] font-medium block">{kpi.label}</span>
                  <p className="font-display text-2xl sm:text-4xl font-semibold text-[#594438] tabular-nums">
                    {kpi.value}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#887467]">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent Articles & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 rounded-[20px] bg-white border border-[#EDE0D5] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif-section text-2xl text-[#594438]">Recent Articles</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="text-xs font-medium text-[#594438] hover:underline cursor-pointer"
                  >
                    Manage All Articles →
                  </button>
                </div>

                {blogs.length === 0 ? (
                  <div className="py-8 text-center space-y-2 rounded-2xl bg-[#FFF8EF] border border-[#EDE0D5] p-6">
                    <p className="font-display text-lg font-semibold text-[#594438]">
                      My learning journey starts here.
                    </p>
                    <p className="text-xs text-[#887467]">
                      No articles created yet. Click &ldquo;Create New Weekly Article&rdquo; to
                      write and publish your first article.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#EDE0D5]">
                    {blogs.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-[#887467] font-mono">
                            <span>Week {String(b.week).padStart(2, '0')}</span>
                            <span>·</span>
                            <span>{b.category}</span>
                            <span>·</span>
                            <span className="text-[#594438] font-medium">
                              {b.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                            {b.featured && (
                              <>
                                <span>·</span>
                                <span className="text-[#594438] font-semibold">Featured</span>
                              </>
                            )}
                          </div>
                          <p className="font-display text-base font-semibold text-[#594438]">
                            {b.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditArticle(b)}
                            className="px-3 py-1.5 rounded-lg bg-[#FFF8EF] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] cursor-pointer"
                          >
                            Edit
                          </button>
                          <Link
                            to={`/blog/${b.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-[#F9EFE8] text-xs font-medium text-[#594438] hover:bg-[#D9A5A5] transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="rounded-[20px] bg-[#F9EFE8] border border-[#EDE0D5] p-6 space-y-4">
                  <h2 className="font-serif-section text-2xl text-[#594438]">Quick Actions</h2>
                  <p className="text-xs text-[#887467] leading-relaxed">
                    Every change made here automatically updates the public homepage, category
                    counts, and live learning statistics.
                  </p>
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={startNewArticle}
                      className="w-full py-3 px-4 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold hover:bg-[#d19595] transition-colors cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>Create New Weekly Article</span>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="w-full py-3 px-4 rounded-xl bg-white border border-[#EDE0D5] text-[#594438] text-xs font-medium hover:border-[#D9A5A5] transition-colors cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>Add or Edit Categories</span>
                      <Code2 className="w-4 h-4 text-[#887467]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('projects')}
                      className="w-full py-3 px-4 rounded-xl bg-white border border-[#EDE0D5] text-[#594438] text-xs font-medium hover:border-[#D9A5A5] transition-colors cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>Update Showcase Projects</span>
                      <FolderGit2 className="w-4 h-4 text-[#887467]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="w-full py-3 px-4 rounded-xl bg-white border border-[#EDE0D5] text-[#594438] text-xs font-medium hover:border-[#D9A5A5] transition-colors cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>Personalize About Me Bio</span>
                      <User className="w-4 h-4 text-[#887467]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLE MANAGEMENT */}
        {activeTab === 'articles' && (
          <div className="rounded-[20px] bg-white border border-[#EDE0D5] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-section text-2xl text-[#594438]">
                  Manage Weekly Articles
                </h2>
                <p className="text-xs text-[#887467]">
                  Publish, unpublish, mark as featured, edit, or delete articles.
                </p>
              </div>
              <button
                type="button"
                onClick={startNewArticle}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Article</span>
              </button>
            </div>

            {blogs.length === 0 ? (
              <div className="py-12 text-center space-y-3 rounded-2xl bg-[#FFF8EF] border border-[#EDE0D5] p-8">
                <p className="font-display text-2xl font-semibold text-[#594438]">
                  My learning journey starts here.
                </p>
                <p className="text-xs text-[#887467]">
                  You have not created any articles yet. Click &ldquo;Create New Article&rdquo; to
                  start writing your first weekly learning dispatch.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EDE0D5]">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#887467]">
                        <span className="font-mono font-semibold text-[#594438]">
                          Week {String(blog.week).padStart(2, '0')}
                        </span>
                        <span>·</span>
                        <span>{blog.category}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-medium text-[#594438]">
                          {blog.status === 'published' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#594438]" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-[#887467]" />
                              <span>Draft</span>
                            </>
                          )}
                        </span>
                        {blog.featured && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-[#594438]">Featured</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#594438]">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-[#887467] line-clamp-2">{blog.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleFeaturedArticle(blog)}
                        title={blog.featured ? 'Remove from Featured' : 'Mark as Featured'}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          blog.featured
                            ? 'bg-[#F7DDE1] border-[#D9A5A5] text-[#594438]'
                            : 'bg-white border-[#EDE0D5] text-[#887467] hover:text-[#594438]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${blog.featured ? 'fill-[#594438]' : ''}`} />
                        <span>{blog.featured ? 'Featured' : 'Feature'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditArticle(blog)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBlogStatus(blog.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#F9EFE8] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                      >
                        {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>

                      <Link
                        to={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9BFA9]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteBlog(blog.id)}
                        aria-label={`Delete ${blog.title}`}
                        className="p-2 rounded-xl bg-white border border-[#EDE0D5] text-[#887467] hover:text-[#594438] hover:bg-[#F7DDE1] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RICH ARTICLE EDITOR */}
        {activeTab === 'editor' && (
          <div className="rounded-[22px] bg-white border border-[#EDE0D5] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EDE0D5]">
              <div>
                <h2 className="font-serif-section text-2xl text-[#594438]">
                  {editingBlogId ? 'Edit Weekly Article' : 'Create New Weekly Article'}
                </h2>
                <p className="text-xs text-[#887467]">
                  Write with rich Markdown, upload images to Firebase Storage, and preview live.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode((p) => !p)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-medium cursor-pointer ${
                    previewMode
                      ? 'bg-[#F7DDE1] border-[#D9A5A5] text-[#594438]'
                      : 'bg-[#FFF8EF] border-[#EDE0D5] text-[#594438]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{previewMode ? 'Back to Editor' : 'Preview Before Publishing'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveArticle('draft')}
                  className="px-4 py-2 rounded-xl bg-[#F9EFE8] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9BFA9] cursor-pointer"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveArticle('published')}
                  className="px-5 py-2 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold hover:bg-[#d19595] cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="space-y-8 max-w-4xl mx-auto py-4">
                <div className="p-4 rounded-xl bg-[#F9EFE8] border border-[#EDE0D5] text-xs text-[#594438] flex items-center justify-between">
                  <span>Live Editorial Preview — Exactly how readers will see this article</span>
                  <span className="font-mono">
                    Week {String(week).padStart(2, '0')} · {category} · {publicationStatus}
                  </span>
                </div>
                <h1 className="font-display text-4xl font-semibold text-[#594438]">
                  {title || 'Untitled Weekly Article'}
                </h1>
                {subtitle && <p className="text-lg text-[#887467]">{subtitle}</p>}
                <div className="rounded-[20px] overflow-hidden border border-[#EDE0D5]">
                  <EditorialArtwork
                    src={coverImage}
                    alt={title || 'Preview'}
                    category={category}
                    week={week}
                    aspectClass="aspect-[16/8]"
                  />
                </div>
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Understanding Binary Trees & Recursion"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Week Number *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={week}
                      onChange={(e) => setWeek(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Status
                    </label>
                    <select
                      value={publicationStatus}
                      onChange={(e) =>
                        setPublicationStatus(e.target.value as 'published' | 'draft')
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Concise editorial deck explaining what this lesson covers..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Java, Trees, Recursion, Big-O"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end pb-2">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#594438] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="rounded border-[#EDE0D5]"
                      />
                      <span>Mark Featured</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#594438]">
                    Short Description (for Blog Cards & SEO Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="1-2 sentence summary shown on article cards and social sharing previews..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>

                {/* Cover Image Selector / Firebase Storage Upload */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end p-4 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5]">
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Editorial Cover Preset
                    </label>
                    <select
                      value={COVER_PRESETS.some((p) => p.value === coverImage) ? coverImage : ''}
                      onChange={(e) => {
                        if (e.target.value) setCoverImage(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs text-[#594438]"
                    >
                      <option value="">Custom Image / Uploaded</option>
                      {COVER_PRESETS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Or Cover Image URL
                    </label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="editorial:java or https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EDE0D5] text-xs text-[#594438]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] cursor-pointer">
                      {uploadingCover ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D9A5A5]" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-[#D9A5A5]" />
                          <span>Upload Cover Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Rich Formatting Toolbar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#594438]">
                      Rich Article Content (Headings, Lists, Images, Tables, Quotes, Code, Callouts)
                    </label>
                    <span className="text-[11px] text-[#887467]">
                      Click any button to insert formatted blocks
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-[#F9EFE8] border border-[#EDE0D5]">
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('## Section Heading')}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      H2 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('### Sub-heading')}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      H3 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('**Important Concept**')}
                      className="p-1.5 rounded-lg bg-white text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('*emphasized term*')}
                      className="p-1.5 rounded-lg bg-white text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet('- First key point\n- Second key point\n- Third key point')
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet('![Diagram or Screenshot Caption](https://example.com/image.png)')
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet(
                          '| Operation | Time Complexity | Notes |\n| :--- | :--- | :--- |\n| Lookup | O(1) | Direct index |\n| Search | O(log n) | Binary search |'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet(
                          '```java\npublic class Example {\n    public static void main(String[] args) {\n        System.out.println("Code block example");\n    }\n}\n```'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Code Block</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet(
                          '```diagram\n┌──────────────┐      ┌──────────────┐\n│  Node A      │ ───▶ │  Node B      │\n└──────────────┘      └──────────────┘\n```'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      <span>Diagram</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet(
                          '> **Weekly Insight:** Highlighted callout note for students.'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-xs font-medium text-[#594438] hover:bg-[#F7DDE1] cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5" />
                      <span>Callout / Quote</span>
                    </button>
                  </div>

                  <textarea
                    rows={16}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] font-mono text-xs sm:text-sm text-[#594438] leading-relaxed focus:outline-none focus:border-[#D9A5A5]"
                  />
                </div>

                {/* Key Takeaways Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#594438]">
                    Key Takeaways (One takeaway per line)
                  </label>
                  <textarea
                    rows={4}
                    value={keyTakeawaysInput}
                    onChange={(e) => setKeyTakeawaysInput(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MANAGE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 rounded-[20px] bg-white border border-[#EDE0D5] p-6 space-y-4 self-start">
              <h2 className="font-serif-section text-xl text-[#594438]">
                {catId ? 'Edit Category' : 'Add New Category'}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g., Compiler Design"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Describe what articles in this category cover..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    Icon Style
                  </label>
                  <select
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  >
                    {['Code2', 'Network', 'Sparkles', 'Globe', 'Cpu', 'Database', 'Share2', 'FolderGit2', 'Compass'].map(
                      (ic) => (
                        <option key={ic} value={ic}>
                          {ic}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!catName.trim()) return;
                      await saveCategory({
                        id: catId,
                        name: catName,
                        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        description: catDesc || `Articles exploring ${catName}.`,
                        icon: catIcon,
                      });
                      setCatId(undefined);
                      setCatName('');
                      setCatDesc('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold cursor-pointer"
                  >
                    {catId ? 'Update Category' : 'Save Category'}
                  </button>
                  {catId && (
                    <button
                      type="button"
                      onClick={() => {
                        setCatId(undefined);
                        setCatName('');
                        setCatDesc('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#F9EFE8] text-xs text-[#594438] cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-[20px] bg-white border border-[#EDE0D5] p-6 space-y-4">
              <h2 className="font-serif-section text-xl text-[#594438]">
                Existing Categories ({categories.length})
              </h2>
              <div className="divide-y divide-[#EDE0D5]">
                {categories.map((c) => (
                  <div key={c.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-display font-semibold text-base text-[#594438]">
                        {c.name}
                      </p>
                      <p className="text-xs text-[#887467]">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCatId(c.id);
                          setCatName(c.name);
                          setCatDesc(c.description);
                          setCatIcon(c.icon);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FFF8EF] border border-[#EDE0D5] text-xs text-[#594438] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(c.id)}
                        className="p-1.5 rounded-lg text-[#887467] hover:text-[#594438] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MANAGE PROJECTS */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 rounded-[20px] bg-white border border-[#EDE0D5] p-6 space-y-4 self-start">
              <h2 className="font-serif-section text-xl text-[#594438]">
                {projId ? 'Edit Project' : 'Add Showcase Project'}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g., Graph Shortest-Path Visualizer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="What problem does this project solve and how was it built?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    Technologies Used (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#594438] mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="text"
                    value={projDemo}
                    onChange={(e) => setProjDemo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!projName.trim()) return;
                      await saveProject({
                        id: projId,
                        name: projName,
                        description: projDesc,
                        technologies: projTech
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                        coverImage: projCover,
                        githubUrl: projGithub,
                        demoUrl: projDemo,
                        isDemo: false,
                      });
                      setProjId(undefined);
                      setProjName('');
                      setProjDesc('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold cursor-pointer"
                  >
                    {projId ? 'Update Project' : 'Save Project'}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-[20px] bg-white border border-[#EDE0D5] p-6 space-y-4">
              <h2 className="font-serif-section text-xl text-[#594438]">
                Showcase Projects ({projects.length})
              </h2>
              {projects.length === 0 ? (
                <p className="text-xs text-[#887467] py-6">
                  Projects coming soon. Add your first project using the form on the left.
                </p>
              ) : (
                <div className="divide-y divide-[#EDE0D5]">
                  {projects.map((p) => (
                    <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-display font-semibold text-base text-[#594438]">
                          {p.name}
                        </p>
                        <p className="text-xs text-[#887467] line-clamp-2">{p.description}</p>
                        <p className="text-[11px] font-mono text-[#594438] mt-1">
                          {p.technologies.join(' · ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setProjId(p.id);
                            setProjName(p.name);
                            setProjDesc(p.description);
                            setProjTech(p.technologies.join(', '));
                            setProjCover(p.coverImage);
                            setProjGithub(p.githubUrl);
                            setProjDemo(p.demoUrl);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#FFF8EF] border border-[#EDE0D5] text-xs text-[#594438] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(p.id)}
                          className="p-1.5 rounded-lg text-[#887467] hover:text-[#594438] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE & ABOUT ME */}
        {activeTab === 'profile' && (
          <div className="rounded-[20px] bg-white border border-[#EDE0D5] p-6 sm:p-8 max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE0D5]">
              <div>
                <h2 className="font-serif-section text-2xl text-[#594438]">
                  Edit Personal Profile &amp; About Me
                </h2>
                <p className="text-xs text-[#887467]">
                  Personalize your name, Integrated M.Tech CSE details, profile photo, interests, and links.
                </p>
              </div>
              <ProfilePhotoPlaceholder size="md" editable />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profForm.name}
                  onChange={(e) => setProfForm({ ...profForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  Education Display Badge
                </label>
                <input
                  type="text"
                  value={profForm.roleTitle}
                  onChange={(e) => setProfForm({ ...profForm, roleTitle: e.target.value })}
                  placeholder="Integrated M.Tech CSE — 2nd Year"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={profForm.degree || 'Integrated Master of Technology (Integrated M.Tech)'}
                  onChange={(e) => setProfForm({ ...profForm, degree: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={profForm.branch || 'Computer Science and Engineering (CSE)'}
                  onChange={(e) => setProfForm({ ...profForm, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  Current Year
                </label>
                <input
                  type="text"
                  value={profForm.currentYear || '2nd Year'}
                  onChange={(e) => setProfForm({ ...profForm, currentYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594438] mb-1">
                About Me Introduction (separate paragraphs with a blank line)
              </label>
              <textarea
                rows={6}
                value={profForm.introduction}
                onChange={(e) => setProfForm({ ...profForm, introduction: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594438] mb-1">
                Educational Background Summary
              </label>
              <textarea
                rows={2}
                value={profForm.education}
                onChange={(e) => setProfForm({ ...profForm, education: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594438] mb-1">
                Learning Philosophy
              </label>
              <textarea
                rows={3}
                value={profForm.learningPhilosophy}
                onChange={(e) => setProfForm({ ...profForm, learningPhilosophy: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594438] mb-1">
                My Interests (comma-separated)
              </label>
              <input
                type="text"
                value={(profForm.interests || []).join(', ')}
                onChange={(e) =>
                  setProfForm({
                    ...profForm,
                    interests: e.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  GitHub URL (Optional)
                </label>
                <input
                  type="text"
                  value={profForm.githubUrl}
                  onChange={(e) => setProfForm({ ...profForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  LinkedIn URL (Optional)
                </label>
                <input
                  type="text"
                  value={profForm.linkedinUrl}
                  onChange={(e) => setProfForm({ ...profForm, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#594438] mb-1">
                  Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={profForm.email}
                  onChange={(e) => setProfForm({ ...profForm, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => saveProfile(profForm)}
              className="px-6 py-3 rounded-xl bg-[#D9A5A5] text-[#594438] text-xs font-semibold hover:bg-[#d19595] cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        )}

        {/* TAB 7: INBOX & SUBSCRIBERS */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 rounded-[20px] bg-white border border-[#EDE0D5] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D9A5A5]" />
                <h2 className="font-serif-section text-xl text-[#594438]">
                  Contact Form Messages ({messages.length})
                </h2>
              </div>
              {messages.length === 0 ? (
                <p className="text-xs text-[#887467] py-6">
                  No contact messages received yet. Submit a test message on the Contact page!
                </p>
              ) : (
                <div className="divide-y divide-[#EDE0D5]">
                  {messages.map((m) => (
                    <div key={m.id} className="py-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#594438]">
                          {m.name} ({m.email})
                        </span>
                        <span className="font-mono text-[#887467]">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#594438]">{m.subject}</p>
                      <p className="text-xs text-[#887467] leading-relaxed">{m.message}</p>
                      {m.status === 'unread' && (
                        <button
                          type="button"
                          onClick={() => markMessageRead(m.id)}
                          className="text-[11px] font-medium text-[#594438] underline cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 rounded-[20px] bg-white border border-[#EDE0D5] p-6 space-y-4 self-start">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D9A5A5]" />
                <h2 className="font-serif-section text-xl text-[#594438]">
                  Newsletter Subscribers ({subscribers.length})
                </h2>
              </div>
              {subscribers.length === 0 ? (
                <p className="text-xs text-[#887467] py-6">
                  No newsletter subscribers yet. Try subscribing from the Homepage footer!
                </p>
              ) : (
                <ul className="divide-y divide-[#EDE0D5] text-xs">
                  {subscribers.map((s) => (
                    <li key={s.id} className="py-3 flex items-center justify-between">
                      <span className="font-medium text-[#594438]">{s.email}</span>
                      <span className="font-mono text-[#887467]">
                        {new Date(s.subscriptionDate).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
