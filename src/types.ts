export interface Blog {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  content: string;
  week: number;
  category: string;
  tags: string[];
  coverImage: string;
  publicationDate: string;
  readingTime: number;
  status: 'published' | 'draft';
  featured: boolean;
  isSample: boolean;
  keyTakeaways: string[];
  authorName: string;
  authorId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  coverImage: string;
  githubUrl: string;
  demoUrl: string;
  isDemo: boolean;
}

export interface Profile {
  id: string;
  name: string;
  roleTitle: string;
  degree?: string;
  branch?: string;
  currentYear?: string;
  avatarUrl?: string;
  introduction: string;
  education: string;
  learningPhilosophy: string;
  interests: string[];
  skills: string[];
  goals: string[];
  githubUrl: string;
  linkedinUrl: string;
  email: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscriptionDate: string;
  status: 'active' | 'unsubscribed';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read';
}

export interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
}
