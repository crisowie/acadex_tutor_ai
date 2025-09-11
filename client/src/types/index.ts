import {
  Library,
  Search,
  ExternalLink,
  Download,
  BookOpen,
  Video,
  FileText,
  Globe,
  Star,
  Users,
  TrendingUp,
  MessageCircle,
  Target
} from "lucide-react";

export interface User {
  full_name: string,
  email: string,
  password: string,
  id: string,
  academic_level: string,
  study_field: string,
  institution: string,
  country: string,
  phone_number: string,
  language: string,
  linkedin: string,
  website: string,
  dob: string,
  gender: string,
  research_interest: string,
  bio: string,
  avatar_url: string,
  plan: string;
  learning_goal: string,
  skill_level: string,
  custom_goal?: string
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// 6181 8e52 f02b 57c5

export interface AuthContextType {
  user: (User & { profile?: any }) | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  Onboarding: (learning_goal: string, skill_level: string, custom_goal: string) => Promise<boolean>;
  UpdateProfile: (academic_level: string,
    study_field: string, institution: string, country: string, phone_number: string, language: string, linkedin: string, website: string, dob: string, gender: string,
    research_interest: string, short_bio: string, avatar_url: string) => Promise<boolean>;
  logout: () => void;
  deleteAcc: () => void;
  loading: boolean;
  fetchUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>; // ✅ updated
  setUser: React.Dispatch<React.SetStateAction<(User & { profile?: any }) | null>>;
}

// Chat context
interface Resource {
  title: string;
  link: string;
}


export interface Message {
  id?: number;
  content: string;
  role: "user" | "assistant"
  timestamp?: Date;
  resources?: { title: string; url?: string; type?: string }[];  // ✅ added
}

export interface Chat {
  id?: number;
  title: string,
  timestamp: Date
}



export interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (msg: string) => Promise<{ aiReply: string; resources: any[] } | string>;
  loading: boolean;
  chatId: string | null;
  loadChatHistory: (chatId: string) => Promise<void>;
  startNewChat: () => void;
  chats: Chat[];
  setChat: React.Dispatch<React.SetStateAction<Chat[]>>;
  fetchSingleChat: (id: string) => Promise<void>;
}



export const resources = [
  {
    id: 1,
    title: "Khan Academy Mathematics",
    category: "Mathematics",
    type: "Online Course",
    description: "Comprehensive mathematics courses from basic arithmetic to advanced calculus.",
    url: "https://khanacademy.org/math",
    rating: 4.9,
    users: "10M+",
    icon: Video,
    free: true,
  },
  {
    id: 2,
    title: "CS50 – Introduction to Computer Science",
    category: "Computer Science",
    type: "University Course",
    description: "Harvard's legendary intro to computer science, available for free on YouTube.",
    url: "https://youtu.be/8mAITcNt710",
    rating: 4.9,
    users: "5M+",
    icon: Video,
    free: true,
  },
  {
    id: 3,
    title: "freeCodeCamp.org",
    category: "Programming",
    type: "Interactive Course",
    description: "Learn HTML, CSS, JavaScript, Python and more with hands-on coding challenges.",
    url: "https://www.freecodecamp.org",
    rating: 4.8,
    users: "20M+",
    icon: Globe,
    free: true,
  },
  {
    id: 4,
    title: "MIT OpenCourseWare",
    category: "Engineering",
    type: "University Lectures",
    description: "Access lecture videos and notes from real MIT courses — free for everyone.",
    url: "https://ocw.mit.edu",
    rating: 4.9,
    users: "2M+",
    icon: Globe,
    free: true,
  },
  {
    id: 5,
    title: "CrashCourse Economics",
    category: "Business",
    type: "Video Series",
    description: "Easy-to-understand economics series by CrashCourse on YouTube.",
    url: "https://youtube.com/playlist?list=PL8dPuuaLjXtOfse2ncvffeelTrqvhrz8H",
    rating: 4.7,
    users: "1M+",
    icon: Video,
    free: true,
  },
  {
    id: 6,
    title: "3Blue1Brown – Linear Algebra",
    category: "Mathematics",
    type: "Video Series",
    description: "Visual and intuitive explanations of linear algebra concepts.",
    url: "https://youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
    rating: 4.9,
    users: "3M+",
    icon: Video,
    free: true,
  },
  {
    id: 7,
    title: "Google Digital Garage",
    category: "Business",
    type: "Certificate Course",
    description: "Free certificate courses from Google on digital marketing and career skills.",
    url: "https://learndigital.withgoogle.com/digitalgarage",
    rating: 4.6,
    users: "1.5M+",
    icon: Globe,
    free: true,
  },
  {
    id: 8,
    title: "Paul's Online Math Notes",
    category: "Mathematics",
    type: "Notes",
    description: "Extensive math tutorials and notes covering algebra, calculus, and differential equations.",
    url: "https://tutorial.math.lamar.edu",
    rating: 4.7,
    users: "800K+",
    icon: BookOpen,
    free: true,
  },
  {
    id: 9,
    title: "OpenStax Textbooks",
    category: "Various",
    type: "Textbook",
    description: "Peer-reviewed, openly licensed college textbooks for many subjects.",
    url: "https://openstax.org",
    rating: 4.8,
    users: "2M+",
    icon: BookOpen,
    free: true,
  },
  {
    id: 10,
    title: "TED-Ed – Science & Learning",
    category: "Computer Science",
    type: "Animated Videos",
    description: "Short educational videos to spark curiosity on science and learning topics.",
    url: "https://youtube.com/user/TEDEducation",
    rating: 4.6,
    users: "3M+",
    icon: Video,
    free: true,
  },
  {
    id: 11,
    title: "The Odin Project",
    category: "Programming",
    type: "Project-Based Learning",
    description: "Full-stack web development curriculum with real-world projects.",
    url: "https://www.theodinproject.com",
    rating: 4.8,
    users: "1M+",
    icon: Globe,
    free: true,
  },
  {
    id: 12,
    title: "Coursera Python for Everybody (Audit)",
    category: "Computer Science",
    type: "University Course",
    description: "University of Michigan's Python course — free to audit without certificate.",
    url: "https://www.coursera.org/specializations/python",
    rating: 4.7,
    users: "2M+",
    icon: Globe,
    free: true,
  },
  {
    id: 13,
    title: "W3Schools",
    category: "Programming",
    type: "Documentation",
    description: "Interactive tutorials and documentation for web technologies like HTML, CSS, JS.",
    url: "https://www.w3schools.com",
    rating: 4.5,
    users: "10M+",
    icon: Globe,
    free: true,
  },
  {
    id: 14,
    title: "Geogebra",
    category: "Mathematics",
    type: "Tool",
    description: "Interactive geometry, algebra, and calculus tools for learners and educators.",
    url: "https://www.geogebra.org",
    rating: 4.8,
    users: "3M+",
    icon: Globe,
    free: true,
  },
  {
    id: 15,
    title: "Python Programming - freeCodeCamp",
    category: "Programming",
    type: "Video Course",
    description: "Full Python course on YouTube (4+ hours) with exercises.",
    url: "https://youtu.be/rfscVS0vtbw",
    rating: 4.9,
    users: "12M+",
    icon: Video,
    free: true,
  },
  {
    id: 16,
    title: "Codecademy Learn SQL (Free Tier)",
    category: "Computer Science",
    type: "Interactive Course",
    description: "Intro to SQL queries and databases — free modules available.",
    url: "https://www.codecademy.com/learn/learn-sql",
    rating: 4.4,
    users: "1M+",
    icon: Globe,
    free: true,
  },
  {
    id: 17,
    title: "PhET Interactive Simulations",
    category: "Physics",
    type: "Simulations",
    description: "Interactive science and math simulations from University of Colorado Boulder.",
    url: "https://phet.colorado.edu",
    rating: 4.9,
    users: "4M+",
    icon: Globe,
    free: true,
  },
  {
    id: 18,
    title: "Investopedia",
    category: "Business",
    type: "Encyclopedia",
    description: "Free financial education and investment tutorials.",
    url: "https://www.investopedia.com",
    rating: 4.6,
    users: "5M+",
    icon: Globe,
    free: true,
  },
  {
    id: 19,
    title: "ChemCollective Virtual Labs",
    category: "Chemistry",
    type: "Virtual Lab",
    description: "Simulated chemistry experiments for high school and college students.",
    url: "https://chemcollective.org/vlabs",
    rating: 4.5,
    users: "700K+",
    icon: Globe,
    free: true,
  },
  {
    id: 20,
    title: "CS50 Web Programming with Python and JavaScript",
    category: "Programming",
    type: "Advanced Course",
    description: "Harvard’s advanced full-stack course with Django, JS, and databases.",
    url: "https://cs50.harvard.edu/web/2020/",
    rating: 4.8,
    users: "1M+",
    icon: Globe,
    free: true,
  },
];

export interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface Quiz {
  id?: string;
  topic: string;
  subject: string;
  difficulty: string;
  duration: number;
  score: number | null;
  percentage: number;
  completed: boolean;
  rating: number | null;
  questions: Question[];
  created_at?: string;
}

export interface QuizContextType {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  loading: boolean;
  generateQuizFromChat: (chatId: string) => Promise<Quiz | null>;
  generateQuizFromTopic: (topic: string) => Promise<Quiz | null>;
  fetchQuizHistory: () => Promise<void>;
  fetchQuizById: (quizId: string) => Promise<Quiz | null>; // New function
  submitAnswer: (quizId: string, answers: any) => Promise<any>;
  completedQuizzes: Quiz[];
  fetchCompletedQuizzes: () => Promise<void>;
  markQuizCompleted: (quizId: string) => Promise<void>;
  resetQuizForRetake: () => void;
  userAnswers: Record<string, string | null>;
  setUserAnswers: (answers: Record<string, string | null>) => void;
  resetCurrentQuiz: () => void;
  fetchCompletedCount: () => Promise<void>;
  completedCount: number;
  getBestSubject: () => string | null;
  handleResetQuiz: (quizId: string) => Promise<void>;
  handleDeleteQuiz: (quizId: string) => Promise<boolean>;
  generateQuizFromPDF: (pdfFile: File, chatId?: string) => Promise<Quiz | null>;
}


// Note details
export interface Note {
  id: string;
  chat_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface NotesContextType {
  notes: Note[];
  fetchNotes: () => Promise<void>;
  addNote: (chatId: string, title: string, content: string) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}


  // Sample groups data
export  const groupsData = [
    {
      id: 1,
      title: "Data Science & AI Hub",
      description: "Advanced discussions on machine learning, deep learning, and data analysis techniques",
      members: 3247,
      subject: "Computer Science",
      privacy: "public",
      activity: "high",
      posts: 156,
      online: 89,
      avatar: "🤖",
      trending: true,
      tags: ["AI", "Machine Learning", "Python"]
    },
    {
      id: 2,
      title: "Advanced Calculus Masters",
      description: "Tackling complex calculus problems and sharing innovative mathematical solutions",
      members: 2156,
      subject: "Mathematics",
      privacy: "public",
      activity: "very-high",
      posts: 234,
      online: 156,
      avatar: "∫",
      trending: true,
      tags: ["Calculus", "Analysis", "Proofs"]
    },
    {
      id: 3,
      title: "Molecular Biology Research",
      description: "Cutting-edge research discussions, paper reviews, and experimental methodologies",
      members: 1892,
      subject: "Biology",
      privacy: "private",
      activity: "high",
      posts: 98,
      online: 67,
      avatar: "🧬",
      trending: false,
      tags: ["Research", "Genetics", "Lab Work"]
    },
    {
      id: 4,
      title: "Quantum Physics Explorers",
      description: "Dive deep into quantum mechanics, particle physics, and theoretical concepts",
      members: 1654,
      subject: "Physics",
      privacy: "public",
      activity: "medium",
      posts: 145,
      online: 45,
      avatar: "⚛️",
      trending: false,
      tags: ["Quantum", "Theory", "Experiments"]
    },
    {
      id: 5,
      title: "Creative Writing Circle",
      description: "Share your stories, get feedback, and improve your creative writing skills together",
      members: 987,
      subject: "Literature",
      privacy: "public",
      activity: "medium",
      posts: 67,
      online: 23,
      avatar: "✍️",
      trending: false,
      tags: ["Writing", "Stories", "Poetry"]
    },
    {
      id: 6,
      title: "Organic Chemistry Lab",
      description: "Laboratory techniques, reaction mechanisms, and synthesis strategies discussion",
      members: 1234,
      subject: "Chemistry",
      privacy: "public",
      activity: "high",
      posts: 189,
      online: 78,
      avatar: "⚗️",
      trending: true,
      tags: ["Organic", "Synthesis", "Mechanisms"]
    },
    {
      id: 7,
      title: "Business Analytics Pro",
      description: "Data-driven business insights, market analysis, and strategic planning discussions",
      members: 2876,
      subject: "Business",
      privacy: "private",
      activity: "very-high",
      posts: 298,
      online: 134,
      avatar: "📊",
      trending: true,
      tags: ["Analytics", "Strategy", "Finance"]
    },
    {
      id: 8,
      title: "Software Engineering Best Practices",
      description: "Code reviews, architecture patterns, and industry best practices for developers",
      members: 4321,
      subject: "Engineering",
      privacy: "public",
      activity: "very-high",
      posts: 445,
      online: 201,
      avatar: "⚙️",
      trending: true,
      tags: ["Code", "Architecture", "DevOps"]
    }
  ];

export const stats = [
      {
        title: "Total Groups",
        value: "150+",
        change: "+12%",
        icon: Users,
        color: "text-blue-400",
      },
      {
        title: "Active Members",
        value: "25.2K",
        change: "+8%",
        icon: TrendingUp,
        color: "text-primary",
      },
      {
        title: "Daily Posts",
        value: "1.2K",
        change: "+25%",
        icon: MessageCircle,
        color: "text-orange-400",
      },
      {
        title: "New This Week",
        value: "24",
        change: "+4",
        icon: Target,
        color: "text-purple-400",
      },
    ];