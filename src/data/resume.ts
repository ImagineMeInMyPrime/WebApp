export interface Skill {
  name: string;
  level: number; // 1-5
}

export interface Experience {
  company: string;
  position: string;
  period: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  description?: string;
}

export interface Contact {
  type: string;
  value: string;
  link?: string;
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
}

export const resumeData: ResumeData = {
  name: "Ваше Имя",
  title: "Ваша Должность",
  about: `Привет! Я разработчик с опытом создания современных веб-приложений. 
  Увлекаюсь созданием качественных пользовательских интерфейсов и решением сложных технических задач.
  Всегда стремлюсь к изучению новых технологий и улучшению своих навыков.`,
  skills: [
    { name: "JavaScript/TypeScript", level: 5 },
    { name: "React", level: 5 },
    { name: "Node.js", level: 4 },
    { name: "CSS/SCSS", level: 5 },
    { name: "Git", level: 4 },
    { name: "Docker", level: 3 },
    { name: "Linux", level: 4 },
  ],
  experience: [
    {
      company: "Название Компании",
      position: "Frontend Developer",
      period: "2022 - настоящее время",
      description: [
        "Разработка и поддержка веб-приложений на React",
        "Оптимизация производительности и улучшение UX",
        "Работа в команде с использованием Agile методологии",
      ],
    },
    {
      company: "Предыдущая Компания",
      position: "Junior Developer",
      period: "2020 - 2022",
      description: [
        "Разработка компонентов пользовательского интерфейса",
        "Исправление багов и рефакторинг кода",
        "Участие в код-ревью и планировании спринтов",
      ],
    },
  ],
  education: [
    {
      institution: "Название Университета",
      degree: "Бакалавр, Компьютерные Науки",
      period: "2016 - 2020",
      description: "Специализация в области веб-разработки и программной инженерии",
    },
  ],
  contacts: [
    { type: "Email", value: "your.email@example.com", link: "mailto:your.email@example.com" },
    { type: "GitHub", value: "github.com/username", link: "https://github.com/username" },
    { type: "LinkedIn", value: "linkedin.com/in/username", link: "https://linkedin.com/in/username" },
    { type: "Telegram", value: "@username", link: "https://t.me/username" },
  ],
};
