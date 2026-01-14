export interface Skill {
  name: string;
  level: number; // 1-5
  category: 'frontend' | 'backend' | 'tools' | 'languages' | 'other';
  description?: string;
}

export interface Experience {
  company: string;
  position: string;
  period: string;
  description: string[];
  technologies?: string[];
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  description?: string;
  courses?: string[];
  achievements?: string[];
}

export interface Contact {
  type: string;
  value: string;
  link?: string;
  icon?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  period: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface Language {
  name: string;
  level: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export interface ResumeData {
  name: string;
  title: string;
  avatar?: string;
  about: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  contacts: Contact[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
  location?: string;
  bio?: string;
}

export const resumeData: ResumeData = {
  name: "Даниил",
  title: "Full Stack Developer",
  location: "Россия",
  bio: "Страстный разработчик, увлеченный созданием современных веб-приложений и изучением новых технологий.",
  about: `Привет! Я Full Stack разработчик с опытом создания современных веб-приложений. 
  Увлекаюсь созданием качественных пользовательских интерфейсов и решением сложных технических задач.
  Всегда стремлюсь к изучению новых технологий и улучшению своих навыков.
  
  Моя специализация включает разработку на React, TypeScript, Node.js и других современных технологиях.
  Люблю создавать интуитивные интерфейсы и оптимизировать производительность приложений.
  
  В свободное время изучаю новые фреймворки, участвую в open-source проектах и делюсь знаниями с сообществом.`,
  
  skills: [
    { 
      name: "JavaScript/TypeScript", 
      level: 5,
      category: 'languages',
      description: "Глубокое понимание современного JavaScript и TypeScript, включая ES6+, async/await, промисы, замыкания"
    },
    { 
      name: "React", 
      level: 5,
      category: 'frontend',
      description: "Опыт работы с React, хуками, контекстом, роутингом, оптимизацией производительности"
    },
    { 
      name: "Node.js", 
      level: 4,
      category: 'backend',
      description: "Разработка серверных приложений, REST API, работа с базами данных"
    },
    { 
      name: "CSS/SCSS", 
      level: 5,
      category: 'frontend',
      description: "Современный CSS, Flexbox, Grid, анимации, адаптивный дизайн, препроцессоры"
    },
    { 
      name: "Git", 
      level: 4,
      category: 'tools',
      description: "Версионирование кода, работа с ветками, code review, CI/CD"
    },
    { 
      name: "Docker", 
      level: 3,
      category: 'tools',
      description: "Контейнеризация приложений, создание образов, оркестрация"
    },
    { 
      name: "Linux", 
      level: 4,
      category: 'tools',
      description: "Администрирование серверов, работа с командной строкой, настройка окружений"
    },
    { 
      name: "HTML5", 
      level: 5,
      category: 'frontend',
      description: "Семантическая разметка, доступность, SEO оптимизация"
    },
    { 
      name: "Vue.js", 
      level: 3,
      category: 'frontend',
      description: "Базовые знания Vue.js, компонентный подход"
    },
    { 
      name: "Python", 
      level: 3,
      category: 'languages',
      description: "Скрипты, автоматизация, базовые знания фреймворков"
    },
    { 
      name: "MongoDB", 
      level: 3,
      category: 'backend',
      description: "Работа с NoSQL базами данных, проектирование схем"
    },
    { 
      name: "PostgreSQL", 
      level: 3,
      category: 'backend',
      description: "Работа с реляционными базами данных, SQL запросы"
    },
    { 
      name: "Express.js", 
      level: 4,
      category: 'backend',
      description: "Создание REST API, middleware, роутинг"
    },
    { 
      name: "Webpack/Vite", 
      level: 4,
      category: 'tools',
      description: "Сборка проектов, оптимизация, настройка конфигураций"
    },
    { 
      name: "Framer Motion", 
      level: 4,
      category: 'frontend',
      description: "Создание анимаций и интерактивных интерфейсов"
    },
  ],
  
  experience: [
    {
      company: "IT Компания",
      position: "Full Stack Developer",
      period: "2022 - настоящее время",
      technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
      description: [
        "Разработка и поддержка веб-приложений на React и TypeScript",
        "Создание REST API на Node.js с использованием Express",
        "Оптимизация производительности и улучшение UX",
        "Работа в команде с использованием Agile методологии",
        "Code review и менторинг junior разработчиков",
        "Участие в архитектурных решениях",
      ],
      achievements: [
        "Увеличил производительность приложения на 40%",
        "Внедрил новые практики разработки в команде",
        "Успешно запустил 3 крупных проекта",
      ],
    },
    {
      company: "Веб-студия",
      position: "Frontend Developer",
      period: "2020 - 2022",
      technologies: ["React", "JavaScript", "CSS", "Git"],
      description: [
        "Разработка компонентов пользовательского интерфейса",
        "Создание адаптивных и отзывчивых дизайнов",
        "Исправление багов и рефакторинг кода",
        "Участие в код-ревью и планировании спринтов",
        "Взаимодействие с дизайнерами и бэкенд разработчиками",
      ],
      achievements: [
        "Создал библиотеку переиспользуемых компонентов",
        "Улучшил время загрузки страниц на 30%",
      ],
    },
    {
      company: "Фриланс",
      position: "Web Developer",
      period: "2019 - 2020",
      technologies: ["HTML", "CSS", "JavaScript", "PHP"],
      description: [
        "Разработка веб-сайтов для малого бизнеса",
        "Создание лендингов и корпоративных сайтов",
        "Интеграция с CMS системами",
        "Поддержка и обновление существующих проектов",
      ],
    },
  ],
  
  education: [
    {
      institution: "Университет",
      degree: "Бакалавр, Компьютерные Науки",
      period: "2016 - 2020",
      description: "Специализация в области веб-разработки и программной инженерии",
      courses: [
        "Алгоритмы и структуры данных",
        "Базы данных",
        "Веб-технологии",
        "Программная инженерия",
        "Компьютерные сети",
      ],
      achievements: [
        "Диплом с отличием",
        "Участие в научных конференциях",
      ],
    },
  ],
  
  projects: [
    {
      name: "Сайт-резюме",
      description: "Современный сайт-резюме в стиле мессенджера с AI чатом",
      technologies: ["React", "TypeScript", "Framer Motion", "Vite"],
      github: "https://github.com/ImagineMeInMyPrime/resume-messenger",
      period: "2024",
    },
    {
      name: "E-commerce платформа",
      description: "Полнофункциональная платформа для онлайн-торговли",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      period: "2023",
    },
    {
      name: "Task Manager",
      description: "Приложение для управления задачами с real-time обновлениями",
      technologies: ["React", "TypeScript", "WebSocket", "Node.js"],
      period: "2023",
    },
  ],
  
  certifications: [
    {
      name: "React Developer",
      issuer: "Online Platform",
      date: "2022",
    },
    {
      name: "JavaScript Advanced",
      issuer: "Online Platform",
      date: "2021",
    },
  ],
  
  languages: [
    { name: "Русский", level: "native" },
    { name: "Английский", level: "intermediate" },
  ],
  
  contacts: [
    { 
      type: "Email", 
      value: "daniklightning@gmail.com", 
      link: "mailto:daniklightning@gmail.com",
      icon: "📧"
    },
    { 
      type: "GitHub", 
      value: "github.com/ImagineMeInMyPrime", 
      link: "https://github.com/ImagineMeInMyPrime",
      icon: "💻"
    },
    { 
      type: "Telegram", 
      value: "@Absolutecleshrayale", 
      link: "https://t.me/Absolutecleshrayale",
      icon: "✈️"
    },
  ],
};
