import { Blog, Category, Project, Profile } from '../types';

export const DEMO_BLOG_IDS = new Set([
  'week-1-java-programming',
  'week-2-arrays-and-strings',
  'week-3-object-oriented-programming',
  'week-4-intro-to-dsa',
  'week-5-graphs-and-traversal',
]);

export const DEMO_PROJECT_IDS = new Set([
  'proj-algo-visualizer',
  'proj-campus-study-planner',
  'proj-memory-array-lab',
]);

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'programming',
    name: 'Programming',
    slug: 'programming',
    description:
      'Core programming paradigms, language syntax, memory management, object-oriented design, and clean coding practices.',
    icon: 'Code2',
  },
  {
    id: 'data-structures-algorithms',
    name: 'Data Structures & Algorithms',
    slug: 'data-structures-algorithms',
    description:
      'Foundational data organization, algorithmic problem-solving, Big-O complexity analysis, trees, graphs, and dynamic programming.',
    icon: 'Network',
  },
  {
    id: 'artificial-intelligence',
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description:
      'Machine learning foundations, neural networks, search heuristics, natural language concepts, and intelligent systems.',
    icon: 'Sparkles',
  },
  {
    id: 'web-development',
    slug: 'web-development',
    name: 'Web Development',
    description:
      'Modern frontend architecture, responsive interfaces, semantic HTML, CSS design systems, REST APIs, and full-stack workflows.',
    icon: 'Globe',
  },
  {
    id: 'operating-systems',
    name: 'Operating Systems',
    slug: 'operating-systems',
    description:
      'Process scheduling, threads, concurrency, virtual memory, file systems, and how software interacts with hardware.',
    icon: 'Cpu',
  },
  {
    id: 'database-management-systems',
    name: 'Database Management Systems',
    slug: 'database-management-systems',
    description:
      'Relational algebra, SQL querying, normalization, ACID transactions, indexing strategies, and NoSQL document stores.',
    icon: 'Database',
  },
  {
    id: 'computer-networks',
    name: 'Computer Networks',
    slug: 'computer-networks',
    description:
      'OSI and TCP/IP models, HTTP/HTTPS protocols, DNS resolution, socket programming, routing, and network security.',
    icon: 'Share2',
  },
  {
    id: 'projects',
    name: 'Projects',
    slug: 'projects',
    description:
      'Hands-on architecture notes, build logs, system diagrams, and lessons learned from building software projects.',
    icon: 'FolderGit2',
  },
  {
    id: 'career-learning',
    name: 'Career & Learning',
    slug: 'career-learning',
    description:
      'Study habits, note-taking workflows, technical learning reflections, and growing step by step in computer science.',
    icon: 'Compass',
  },
];

// Clean initial state with zero sample/fake blog articles
export const INITIAL_BLOGS: Blog[] = [];

// Clean initial state with zero sample/fake projects
export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_PROFILE: Profile = {
  id: 'main',
  name: 'Guna Sekhar',
  roleTitle: 'Integrated M.Tech CSE — 2nd Year',
  degree: 'Integrated Master of Technology (Integrated M.Tech)',
  branch: 'Computer Science and Engineering (CSE)',
  currentYear: '2nd Year',
  avatarUrl: '',
  introduction: `Hi! I'm Guna Sekhar, a second-year Integrated M.Tech Computer Science and Engineering student.

I'm passionate about technology, programming and exploring new ideas. I enjoy learning new concepts, solving problems and building projects that turn ideas into reality.

LearnWithMe is my personal learning space where I share my weekly learning experiences, technical knowledge, programming concepts, projects and discoveries.

My goal is to keep learning, improve my technical skills and share useful knowledge with others along the way.

I believe that every small step in learning contributes to something bigger.`,
  education:
    'Integrated Master of Technology (Integrated M.Tech) in Computer Science and Engineering (CSE) — 2nd Year.',
  learningPhilosophy:
    'Learn. Create. Share. Grow. — I believe that every small step in learning contributes to something bigger.',
  interests: [
    'Programming and Problem Solving',
    'Data Structures and Algorithms',
    'Artificial Intelligence',
    'Web Development',
    'Computer Science Fundamentals',
    'Exploring New Technologies',
    'Building Creative Projects',
  ],
  skills: [
    'Programming and Problem Solving',
    'Data Structures and Algorithms',
    'Artificial Intelligence',
    'Web Development',
    'Computer Science Fundamentals',
    'Exploring New Technologies',
    'Building Creative Projects',
  ],
  goals: [
    'Keep learning new concepts and improving my technical skills.',
    'Solve problems and build creative projects that turn ideas into reality.',
    'Share weekly learning experiences, programming concepts, and discoveries on LearnWithMe.',
    'Share useful knowledge with others along the way.',
  ],
  githubUrl: '',
  linkedinUrl: '',
  email: '',
};
