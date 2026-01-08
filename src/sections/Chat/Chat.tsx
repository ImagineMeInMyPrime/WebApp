import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData } from '../../data/resume';
import '../../components/Message/Message.css';
import './Chat.css';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConversationContext {
  topics: string[];
  mood: 'friendly' | 'professional' | 'casual' | 'enthusiastic' | 'curious' | 'helpful';
  lastTopic?: string;
  messageCount: number;
  mentionedCompanies: string[];
  mentionedTechnologies: string[];
}

// База знаний о компаниях, играх и технологиях
const knowledgeBase: Record<string, string[]> = {
  ragebyte: [
    'Ragebyte - это игровая студия, которая разрабатывает видеоигры. Компания известна созданием различных игровых проектов.',
    'Ragebyte - игровая компания, занимающаяся разработкой видеоигр. Они создают интересные игровые проекты.',
    'Ragebyte - это студия разработки игр. Они работают над созданием различных игровых проектов.',
  ],
  react: [
    'React - это JavaScript библиотека для создания пользовательских интерфейсов, разработанная Facebook. Она использует компонентный подход и виртуальный DOM.',
    'React - популярная библиотека для фронтенд разработки. Позволяет создавать интерактивные UI с помощью компонентов.',
    'React - мощный инструмент для создания веб-приложений. Использует JSX, компоненты и однонаправленный поток данных.',
  ],
  javascript: [
    'JavaScript - это язык программирования для веб-разработки. Он позволяет создавать интерактивные веб-страницы и приложения.',
    'JavaScript - один из самых популярных языков программирования. Используется как на клиенте, так и на сервере.',
    'JavaScript - динамический язык программирования, основа веб-разработки. Поддерживает объектно-ориентированное и функциональное программирование.',
  ],
};

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPattern, setShowPattern] = useState(true);
  const [context, setContext] = useState<ConversationContext>({
    topics: [],
    mood: 'friendly',
    messageCount: 0,
    mentionedCompanies: [],
    mentionedTechnologies: [],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPattern(false);
    }, 2000);

    if (patternRef.current && showPattern) {
      drawPattern(patternRef.current);
    }

    return () => clearTimeout(timer);
  }, [showPattern]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const drawPattern = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    ctx.fillStyle = '#2f3136';
    ctx.fillRect(0, 0, width, height);

    const patternType = Math.floor(Math.random() * 4);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;

    switch (patternType) {
      case 0:
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          const x = Math.random() * width;
          const y = Math.random() * height;
          const radius = 50 + Math.random() * 100;
          ctx.arc(x, y, radius, 0, Math.PI * 2 * (0.5 + Math.random()));
          ctx.stroke();
        }
        break;
      case 1:
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = 20 + Math.random() * 60;
          const sides = 3 + Math.floor(Math.random() * 5);
          for (let j = 0; j < sides; j++) {
            const angle = (Math.PI * 2 * j) / sides;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
        break;
      case 2:
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          const y = Math.random() * height;
          ctx.moveTo(0, y);
          for (let x = 0; x < width; x += 10) {
            const waveY = y + Math.sin(x / 50 + i) * 30;
            ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }
        break;
      case 3:
        const gridSize = 80;
        for (let x = 0; x < width; x += gridSize) {
          for (let y = 0; y < height; y += gridSize) {
            if (Math.random() > 0.5) {
              ctx.beginPath();
              ctx.arc(x, y, 20, 0, Math.PI * 2);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.moveTo(x - 15, y - 15);
              ctx.lineTo(x + 15, y + 15);
              ctx.moveTo(x + 15, y - 15);
              ctx.lineTo(x - 15, y + 15);
              ctx.stroke();
            }
          }
        }
        break;
    }
  };

  const generateVersion = (): string => {
    const major = 1;
    const minor = Math.floor(Math.random() * 90) + 10;
    return `${major}.${minor}`;
  };

  const updateContext = (userMessage: string, detectedTopic?: string, detectedCompany?: string, detectedTech?: string) => {
    setContext((prev) => {
      const newTopics = detectedTopic && !prev.topics.includes(detectedTopic)
        ? [...prev.topics, detectedTopic]
        : prev.topics;

      const newCompanies = detectedCompany && !prev.mentionedCompanies.includes(detectedCompany)
        ? [...prev.mentionedCompanies, detectedCompany]
        : prev.mentionedCompanies;

      const newTechnologies = detectedTech && !prev.mentionedTechnologies.includes(detectedTech)
        ? [...prev.mentionedTechnologies, detectedTech]
        : prev.mentionedTechnologies;

      let newMood = prev.mood;
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.match(/(отлично|супер|круто|замечательно|прекрасно|восхитительно)/i)) {
        newMood = 'enthusiastic';
      } else if (lowerMessage.match(/(работа|професси|карьер|бизнес|деловой)/i)) {
        newMood = 'professional';
      } else if (lowerMessage.match(/(привет|хай|салют|добр|hey)/i)) {
        newMood = 'friendly';
      } else if (lowerMessage.match(/(как дела|что нового|как жизнь|как сам)/i)) {
        newMood = 'casual';
      } else if (lowerMessage.match(/(что такое|кто такой|объясни|расскажи о|что значит)/i)) {
        newMood = 'curious';
      } else if (lowerMessage.match(/(помоги|помощь|подскажи|совет)/i)) {
        newMood = 'helpful';
      }

      return {
        topics: newTopics,
        mood: newMood,
        lastTopic: detectedTopic || prev.lastTopic,
        messageCount: prev.messageCount + 1,
        mentionedCompanies: newCompanies,
        mentionedTechnologies: newTechnologies,
      };
    });
  };

  const detectCompany = (message: string): string | undefined => {
    const lower = message.toLowerCase();
    const companies = ['ragebyte', 'google', 'microsoft', 'apple', 'facebook', 'meta', 'amazon', 'netflix', 'twitter', 'x', 'yandex', 'vk', 'telegram'];
    for (const company of companies) {
      if (lower.includes(company)) return company;
    }
    return undefined;
  };

  const detectTechnology = (message: string): string | undefined => {
    const lower = message.toLowerCase();
    const techs = ['react', 'javascript', 'typescript', 'node', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'express', 'django', 'flask', 'laravel', 'spring'];
    for (const tech of techs) {
      if (lower.includes(tech)) return tech;
    }
    return undefined;
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const version = generateVersion();
    const lowerMessage = userMessage.toLowerCase().trim();
    const words = lowerMessage.split(/\s+/);
    const messageLength = words.length;

    // Определяем тему разговора
    let detectedTopic: string | undefined;
    if (lowerMessage.match(/(резюме|опыт|работа|професси|карьер)/i)) detectedTopic = 'resume';
    if (lowerMessage.match(/(навык|технологи|умеешь|знаешь|язык|фреймворк)/i)) detectedTopic = 'skills';
    if (lowerMessage.match(/(образован|университет|институт|учился)/i)) detectedTopic = 'education';
    if (lowerMessage.match(/(проект|сайт|портфолио|сделал|создал)/i)) detectedTopic = 'projects';
    if (lowerMessage.match(/(хобби|увлечен|интерес|любим)/i)) detectedTopic = 'hobbies';
    if (lowerMessage.match(/(погода|время|сегодня|завтра)/i)) detectedTopic = 'weather';
    if (lowerMessage.match(/(программирован|код|разработк|алгоритм)/i)) detectedTopic = 'programming';
    if (lowerMessage.match(/(игр|гейм|game|play)/i)) detectedTopic = 'games';
    if (lowerMessage.match(/(компани|студи|разработчик)/i)) detectedTopic = 'companies';

    const detectedCompany = detectCompany(userMessage);
    const detectedTech = detectTechnology(userMessage);

    updateContext(userMessage, detectedTopic, detectedCompany, detectedTech);

    // Вопросы "что такое" - база знаний
    if (lowerMessage.match(/(что такое|что это|что значит|расскажи о|объясни что такое)/i)) {
      if (detectedCompany) {
        const companyKey = detectedCompany.toLowerCase();
        if (knowledgeBase[companyKey]) {
          const responses = knowledgeBase[companyKey];
          return `${responses[Math.floor(Math.random() * responses.length)]} v${version}`;
        }
      }
      
      if (detectedTech) {
        const techKey = detectedTech.toLowerCase();
        if (knowledgeBase[techKey]) {
          const responses = knowledgeBase[techKey];
          return `${responses[Math.floor(Math.random() * responses.length)]} v${version}`;
        }
      }

      // Общие ответы на "что такое"
      const whatIsResponses = [
        `Интересный вопрос! Могу рассказать, если уточнишь, о чем именно речь. Или спроси о чем-то из резюме! v${version}`,
        `Хороший вопрос! Уточни, что именно тебя интересует, и я постараюсь объяснить. v${version}`,
        `Могу объяснить! Но нужно уточнить, о чем именно ты спрашиваешь. v${version}`,
      ];
      return whatIsResponses[Math.floor(Math.random() * whatIsResponses.length)];
    }

    // Вопросы о компаниях (Ragebyte и другие)
    if (lowerMessage.match(/(ragebyte|рейджбайт)/i)) {
      const ragebyteResponses = [
        `Ragebyte - это игровая студия, которая разрабатывает видеоигры. Компания известна созданием различных игровых проектов. Если интересно, могу рассказать больше о игровой индустрии! v${version}`,
        `Ragebyte - игровая компания, занимающаяся разработкой видеоигр. Они создают интересные игровые проекты. Хочешь узнать что-то конкретное о них? v${version}`,
        `Ragebyte - это студия разработки игр. Они работают над созданием различных игровых проектов. Интересная компания! v${version}`,
        `Ragebyte - игровая студия. Занимаются разработкой видеоигр. Если есть вопросы о игровой индустрии или разработке игр - могу рассказать! v${version}`,
      ];
      return ragebyteResponses[Math.floor(Math.random() * ragebyteResponses.length)];
    }

    // Приветствия с учетом контекста
    if (lowerMessage.match(/^(привет|здравствуй|hi|hello|добр|хай|салют|hey|доброе утро|добрый день|добрый вечер)/i)) {
      const greetings = {
        friendly: [
          `Привет! Рад тебя видеть! Чем могу помочь? v${version}`,
          `Здравствуй! Как дела? Готов ответить на любые вопросы! v${version}`,
          `Приветствую! Что тебя интересует? v${version}`,
          `Привет! Отлично, что заглянул! О чем поговорим? v${version}`,
          `Здравствуй! Рад общению! Чем могу быть полезен? v${version}`,
          `Привет! Как настроение? Готов поболтать! v${version}`,
        ],
        professional: [
          `Здравствуйте! Чем могу быть полезен? v${version}`,
          `Добрый день! Готов ответить на ваши вопросы. v${version}`,
          `Приветствую! Как могу помочь? v${version}`,
          `Здравствуйте! Чем могу помочь? v${version}`,
        ],
        casual: [
          `Привет! Как дела? v${version}`,
          `Хай! Что нового? v${version}`,
          `Привет! О чем поговорим? v${version}`,
          `Йо! Как сам? v${version}`,
        ],
        enthusiastic: [
          `Привет! Отлично, что ты здесь! Давай поговорим! v${version}`,
          `Здравствуй! Супер, что зашел! Чем могу помочь? v${version}`,
          `Привет! Замечательно видеть тебя! О чем поговорим? v${version}`,
        ],
        curious: [
          `Привет! Интересно, о чем ты хочешь узнать? v${version}`,
          `Здравствуй! Готов ответить на твои вопросы! v${version}`,
        ],
        helpful: [
          `Привет! Чем могу помочь? v${version}`,
          `Здравствуй! Готов помочь с любыми вопросами! v${version}`,
        ],
      };
      const moodGreetings = greetings[context.mood] || greetings.friendly;
      return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
    }

    // Вопросы "как дела" - расширенные ответы
    if (lowerMessage.match(/(как дела|как жизнь|как поживаешь|что нового|как ты|как сам|как настроение|как оно)/i)) {
      const howAreYouResponses = {
        friendly: [
          `У меня все отлично! Готов помочь узнать больше о резюме. А у тебя как дела? v${version}`,
          `Все прекрасно! Работаю над улучшением своих ответов. Как твои дела? v${version}`,
          `Дела идут хорошо! Готов ответить на вопросы. Что у тебя нового? v${version}`,
          `Отлично! Все просто замечательно. Как сам? v${version}`,
          `Все супер! Настроение отличное. А у тебя как? v${version}`,
          `Прекрасно! Готов к общению. Как дела? v${version}`,
          `Все хорошо! Работаю, развиваюсь. А ты как? v${version}`,
        ],
        casual: [
          `Нормально, работаю. А ты как? v${version}`,
          `Все ок! Что нового? v${version}`,
          `Хорошо! Как сам? v${version}`,
          `Норм! А ты? v${version}`,
          `Окей! Как дела? v${version}`,
        ],
        professional: [
          `Все в порядке, спасибо. Чем могу помочь? v${version}`,
          `Работаю над улучшением сервиса. Как ваши дела? v${version}`,
          `Все хорошо, благодарю. Чем могу быть полезен? v${version}`,
        ],
        enthusiastic: [
          `Отлично! Просто замечательно! Готов помочь! А у тебя как? v${version}`,
          `Супер! Все просто прекрасно! Как твои дела? v${version}`,
          `Великолепно! Настроение на высоте! А ты как? v${version}`,
          `Замечательно! Все просто отлично! Как сам? v${version}`,
        ],
        curious: [
          `Хорошо! Интересно, что ты хочешь узнать? v${version}`,
          `Отлично! Готов ответить на вопросы. Как дела? v${version}`,
        ],
        helpful: [
          `Все хорошо! Чем могу помочь? v${version}`,
          `Отлично! Готов помочь с любыми вопросами. Как дела? v${version}`,
        ],
      };
      const moodResponses = howAreYouResponses[context.mood] || howAreYouResponses.friendly;
      return moodResponses[Math.floor(Math.random() * moodResponses.length)];
    }

    // Вопросы о резюме
    if (lowerMessage.match(/(резюме|опыт|работа|професси|карьер|трудовой|профессиональный опыт)/i)) {
      const resumeResponses = [
        `В моем резюме есть подробная информация об опыте работы, навыках, образовании и контактах. Используй меню слева для навигации по разделам! v${version}`,
        `Резюме содержит всю необходимую информацию: опыт работы в различных компаниях, технические навыки, образование и способы связи. Что именно тебя интересует? v${version}`,
        `Мое резюме включает опыт работы, список навыков, информацию об образовании и контакты. Могу рассказать подробнее о любом разделе! v${version}`,
        `В резюме собрана вся информация о моем профессиональном опыте. Есть разделы: опыт работы, навыки, образование и контакты. Что хочешь узнать? v${version}`,
        `Резюме структурировано по разделам: о себе, навыки, опыт работы, образование и контакты. Каждый раздел содержит детальную информацию. v${version}`,
      ];
      return resumeResponses[Math.floor(Math.random() * resumeResponses.length)];
    }

    // Вопросы о навыках
    if (lowerMessage.match(/(навык|технологи|умеешь|знаешь|язык|фреймворк|библиотек|стек|инструмент|технологический стек)/i)) {
      const skillsResponses = [
        `Работаю с современными технологиями веб-разработки: JavaScript, TypeScript, React, Node.js, CSS и многими другими. Подробнее смотри в разделе "Навыки"! v${version}`,
        `Использую современный стек: React для фронтенда, Node.js для бэкенда, TypeScript для типобезопасности. Все навыки с уровнями указаны в разделе "Навыки". v${version}`,
        `Владею различными технологиями: от JavaScript и React до Docker и Linux. Каждый навык имеет свой уровень от 1 до 5. Посмотри раздел "Навыки" для деталей! v${version}`,
        `Мой технический стек включает JavaScript/TypeScript, React, Node.js, CSS, Git, Docker, Linux и другие инструменты. Подробности в разделе "Навыки"! v${version}`,
        `Работаю с современными технологиями разработки. Основной стек: React, TypeScript, Node.js. Также есть опыт с Docker, Git, Linux. Все в разделе "Навыки"! v${version}`,
        `Использую широкий спектр технологий для веб-разработки. Основные: JavaScript, TypeScript, React, Node.js. Детали и уровни владения в разделе "Навыки". v${version}`,
      ];
      return skillsResponses[Math.floor(Math.random() * skillsResponses.length)];
    }

    // Вопросы о программировании
    if (lowerMessage.match(/(программирован|код|разработк|алгоритм|программ|софт|кодинг)/i)) {
      const programmingResponses = [
        `Программирование - это моя страсть! Люблю создавать качественный код, решать сложные задачи и изучать новые технологии. v${version}`,
        `Разработка для меня - это творчество и решение проблем. Особенно интересна веб-разработка и создание пользовательских интерфейсов. v${version}`,
        `Обожаю программирование! Нравится писать чистый код, оптимизировать производительность и создавать что-то полезное. v${version}`,
        `Программирование - это искусство превращения идей в реальность. Мне нравится работать с современными технологиями и создавать инновационные решения. v${version}`,
        `Кодинг для меня - это способ самовыражения и создания чего-то нового. Люблю решать сложные задачи и находить элегантные решения. v${version}`,
        `Программирование - это постоянное обучение и развитие. Каждый день открываю что-то новое и совершенствую свои навыки. v${version}`,
      ];
      return programmingResponses[Math.floor(Math.random() * programmingResponses.length)];
    }

    // Вопросы об опыте работы
    if (lowerMessage.match(/(компани|работ|проект|где работал|опыт работы|трудовой опыт|работал в|компании)/i)) {
      const experienceResponses = [
        `У меня есть опыт работы в различных компаниях на позициях разработчика. Подробную информацию о каждой компании, должностях и проектах можно найти в разделе "Опыт работы". v${version}`,
        `Работал в нескольких компаниях, где занимался разработкой веб-приложений, оптимизацией и улучшением пользовательского опыта. Все детали в разделе "Опыт работы". v${version}`,
        `Мой профессиональный опыт включает работу в разных компаниях на различных проектах. Каждая позиция описана с периодом работы и основными обязанностями в разделе "Опыт работы". v${version}`,
        `Имею опыт работы в IT-компаниях на позициях разработчика. Занимался созданием веб-приложений, оптимизацией кода и работой в команде. Подробности в разделе "Опыт работы". v${version}`,
      ];
      return experienceResponses[Math.floor(Math.random() * experienceResponses.length)];
    }

    // Вопросы об образовании
    if (lowerMessage.match(/(образован|университет|институт|учился|учеба|диплом|степен|высшее образование|где учился)/i)) {
      const educationResponses = [
        `Информация об образовании находится в разделе "Образование". Там указаны все учебные заведения, полученные степени и специализации. v${version}`,
        `Учился в университете, получил степень в области компьютерных наук. Подробности об образовании, периоде обучения и специализации в разделе "Образование". v${version}`,
        `Мое образование включает университетскую подготовку в области компьютерных наук с фокусом на веб-разработку. Все детали в разделе "Образование". v${version}`,
        `Получил высшее образование в области компьютерных наук. Изучал программирование, алгоритмы, базы данных и веб-технологии. Подробности в разделе "Образование". v${version}`,
      ];
      return educationResponses[Math.floor(Math.random() * educationResponses.length)];
    }

    // Вопросы о проектах
    if (lowerMessage.match(/(проект|сайт|портфолио|сделал|создал|разработал|приложен|веб-сайт)/i)) {
      const projectResponses = [
        `Этот сайт-резюме создан с использованием React, TypeScript и современных веб-технологий. Интерфейс выполнен в стиле мессенджера для удобства навигации. v${version}`,
        `Разработал этот сайт на React и TypeScript. Использовал современные практики разработки, создал адаптивный дизайн и добавил интерактивные элементы. v${version}`,
        `Сайт построен на React с TypeScript для типобезопасности. Применил современные подходы к UI/UX, создал темную тему в стиле Discord и добавил AI-чат. v${version}`,
        `Этот проект - современное резюме-сайт на React. Использовал TypeScript, Framer Motion для анимаций, создал интуитивный интерфейс и интегрировал AI-ассистента. v${version}`,
        `Создал этот сайт как портфолио-резюме. Использовал React, TypeScript, современный дизайн и интерактивные элементы для лучшего пользовательского опыта. v${version}`,
      ];
      return projectResponses[Math.floor(Math.random() * projectResponses.length)];
    }

    // Вопросы о контактах
    if (lowerMessage.match(/(контакт|связаться|email|телефон|telegram|github|написать|связь|как связаться)/i)) {
      const contactResponses = [
        `Все контакты для связи находятся в разделе "Контакты". Там email, GitHub, Telegram и другие способы связи! v${version}`,
        `Со мной можно связаться через различные каналы: email, GitHub, Telegram. Все контакты доступны в разделе "Контакты". v${version}`,
        `Для связи используй контакты из раздела "Контакты". Там есть email, GitHub профиль и Telegram. Буду рад общению! v${version}`,
        `Мои контакты: email, GitHub и Telegram. Все ссылки и способы связи в разделе "Контакты". Обращайся! v${version}`,
      ];
      return contactResponses[Math.floor(Math.random() * contactResponses.length)];
    }

    // Вопросы о хобби и увлечениях
    if (lowerMessage.match(/(хобби|увлечен|интерес|любим|нравится|нравятся|чем занимаешься|что любишь)/i)) {
      const hobbyResponses = [
        `Мне нравится программирование, изучение новых технологий, создание интересных проектов. Также увлекаюсь решением сложных технических задач. v${version}`,
        `Увлекаюсь веб-разработкой, изучением новых фреймворков и библиотек. Люблю создавать качественные пользовательские интерфейсы и оптимизировать производительность. v${version}`,
        `Мои интересы связаны с разработкой: создание современных веб-приложений, изучение новых технологий, участие в open-source проектах. v${version}`,
        `Люблю программирование, особенно веб-разработку. Интересуюсь новыми технологиями, читаю техническую литературу и постоянно совершенствую свои навыки. v${version}`,
        `Увлекаюсь разработкой, изучением новых языков программирования и фреймворков. Также интересуюсь дизайном интерфейсов и UX. v${version}`,
      ];
      return hobbyResponses[Math.floor(Math.random() * hobbyResponses.length)];
    }

    // Вопросы о играх
    if (lowerMessage.match(/(игр|гейм|game|play|играть|видеоигр|игровая индустрия)/i)) {
      const gameResponses = [
        `Игры - это интересная тема! Игровая индустрия постоянно развивается, появляются новые технологии и жанры. Сам увлекаюсь разработкой, но игры тоже интересны! v${version}`,
        `Игровая индустрия - это огромная сфера с множеством возможностей. Разработка игр требует знания программирования, дизайна и понимания игровой механики. v${version}`,
        `Игры - это целое искусство! От инди-проектов до AAA-игр. Разработка игр - это сложный процесс, требующий командной работы и различных навыков. v${version}`,
        `Игровая индустрия очень интересна! Используются современные технологии, движки вроде Unity или Unreal Engine. Разработка игр - это творческий процесс. v${version}`,
      ];
      return gameResponses[Math.floor(Math.random() * gameResponses.length)];
    }

    // Вопросы "кто ты"
    if (lowerMessage.match(/(кто ты|что ты|ты кто|расскажи о себе|представься|кто такой)/i)) {
      const whoResponses = [
        `Я AI-ассистент, созданный для помощи в навигации по резюме. Могу ответить на вопросы о навыках, опыте работы, образовании и многом другом. Задавай вопросы! v${version}`,
        `Я виртуальный помощник этого сайта-резюме. Моя задача - помочь тебе узнать больше информации о резюме и ответить на любые вопросы. v${version}`,
        `Я AI-ассистент, готовый помочь с любыми вопросами о резюме. Могу рассказать о навыках, опыте, образовании, проектах - обо всем, что тебя интересует! v${version}`,
        `Я помощник-бот, созданный для общения с посетителями сайта. Могу рассказать о резюме, ответить на вопросы и просто поболтать. v${version}`,
      ];
      return whoResponses[Math.floor(Math.random() * whoResponses.length)];
    }

    // Благодарности
    if (lowerMessage.match(/(спасибо|благодар|thanks|thank you|мерси|благодарю)/i)) {
      const thanksResponses = {
        friendly: [
          `Пожалуйста! Всегда рад помочь. Если будут еще вопросы - спрашивай! v${version}`,
          `Не за что! Обращайся, если что-то еще заинтересует. v${version}`,
          `Рад был помочь! Задавай вопросы, если что-то непонятно. v${version}`,
          `Пожалуйста! Обращайся в любое время. v${version}`,
        ],
        professional: [
          `Пожалуйста! Всегда готов помочь. v${version}`,
          `Не стоит благодарности. Если возникнут вопросы - обращайтесь. v${version}`,
          `Рад был помочь. Обращайтесь, если что-то понадобится. v${version}`,
        ],
        casual: [
          `Не за что! v${version}`,
          `Пожалуйста! v${version}`,
          `Окей, не за что! v${version}`,
        ],
        enthusiastic: [
          `Пожалуйста! Всегда рад помочь! Задавай еще вопросы! v${version}`,
          `Не за что! Обращайся в любое время! v${version}`,
          `Рад помочь! Всегда к твоим услугам! v${version}`,
        ],
        curious: [
          `Пожалуйста! Если будут еще вопросы - спрашивай! v${version}`,
          `Не за что! Всегда готов ответить на вопросы. v${version}`,
        ],
        helpful: [
          `Пожалуйста! Чем еще могу помочь? v${version}`,
          `Не за что! Обращайся, если нужна помощь. v${version}`,
        ],
      };
      const moodThanks = thanksResponses[context.mood] || thanksResponses.friendly;
      return moodThanks[Math.floor(Math.random() * moodThanks.length)];
    }

    // Вопросы "что"
    if (lowerMessage.match(/^что\s+/i)) {
      const whatResponses = [
        `Могу рассказать о навыках, опыте работы, образовании или контактах. Что именно тебя интересует? v${version}`,
        `Могу поделиться информацией о резюме: навыки, опыт, образование, проекты. О чем хочешь узнать? v${version}`,
        `Могу рассказать много интересного о резюме! Спроси о навыках, опыте работы, образовании или проектах. v${version}`,
        `Могу ответить на вопросы о резюме, технологиях, опыте работы. Что именно хочешь узнать? v${version}`,
      ];
      return whatResponses[Math.floor(Math.random() * whatResponses.length)];
    }

    // Вопросы "как"
    if (lowerMessage.match(/^как\s+/i)) {
      const howResponses = [
        `Могу объяснить подробнее. Уточни, о чем именно ты спрашиваешь? v${version}`,
        `Хороший вопрос! Могу рассказать подробнее, если уточнишь детали. v${version}`,
        `Интересный вопрос! Расскажи больше, что именно тебя интересует, и я дам подробный ответ. v${version}`,
        `Могу объяснить! Но нужно уточнить детали вопроса. v${version}`,
      ];
      return howResponses[Math.floor(Math.random() * howResponses.length)];
    }

    // Вопросы "почему"
    if (lowerMessage.match(/^почему\s+/i)) {
      const whyResponses = [
        `Интересный вопрос! Могу объяснить, если уточнишь, о чем именно речь. v${version}`,
        `Хороший вопрос! Давай разберемся вместе. Уточни детали, и я дам развернутый ответ. v${version}`,
        `Могу объяснить причины! Но нужно больше контекста. v${version}`,
      ];
      return whyResponses[Math.floor(Math.random() * whyResponses.length)];
    }

    // Вопросы о времени и погоде
    if (lowerMessage.match(/(погода|время|сегодня|завтра|сейчас|который час|сколько времени)/i)) {
      const timeResponses = [
        `Я не могу узнать текущее время или погоду, но могу помочь с вопросами о резюме! v${version}`,
        `К сожалению, у меня нет доступа к информации о времени и погоде. Но могу ответить на вопросы о резюме! v${version}`,
        `Не могу сказать точное время или погоду, но с удовольствием помогу с вопросами о резюме или технологиях! v${version}`,
      ];
      return timeResponses[Math.floor(Math.random() * timeResponses.length)];
    }

    // Комплименты
    if (lowerMessage.match(/(круто|классно|отлично|супер|замечательно|прекрасно|молодец|здорово|великолепно)/i)) {
      const complimentResponses = [
        `Спасибо! Рад, что тебе нравится! Есть еще вопросы? v${version}`,
        `Спасибо за отзыв! Чем еще могу помочь? v${version}`,
        `Приятно слышать! Задавай вопросы, если что-то интересует. v${version}`,
        `Спасибо! Очень приятно! v${version}`,
      ];
      return complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
    }

    // Прощания
    if (lowerMessage.match(/(пока|до свидания|увидимся|bye|goodbye|прощай|до встречи|удачи)/i)) {
      const goodbyeResponses = [
        `До свидания! Было приятно пообщаться! Возвращайся, если будут вопросы. v${version}`,
        `Пока! Удачи! Заходи еще, всегда рад помочь. v${version}`,
        `До встречи! Если появятся вопросы - обращайся! v${version}`,
        `Пока! Хорошего дня! v${version}`,
        `До свидания! Успехов! v${version}`,
      ];
      return goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
    }

    // Короткие сообщения (1-2 слова)
    if (messageLength <= 2) {
      const shortResponses = [
        `Понял. Уточни, пожалуйста, что именно тебя интересует? v${version}`,
        `Можешь задать вопрос о резюме, навыках или опыте работы. v${version}`,
        `Чем могу помочь? Спроси о резюме! v${version}`,
        `Хорошо! О чем хочешь узнать? v${version}`,
        `Окей! Что интересует? v${version}`,
      ];
      return shortResponses[Math.floor(Math.random() * shortResponses.length)];
    }

    // Вопросы с "расскажи"
    if (lowerMessage.match(/(расскажи|покажи|поделись|дай информацию|объясни|опиши)/i)) {
      const tellResponses = [
        `Могу рассказать о навыках, опыте работы, образовании или контактах. Что именно интересует? v${version}`,
        `С удовольствием расскажу! О чем именно хочешь узнать: навыки, опыт, образование или проекты? v${version}`,
        `Конечно! Могу поделиться информацией о резюме. Что тебя больше всего интересует? v${version}`,
        `Расскажу с удовольствием! Уточни, о чем именно речь. v${version}`,
      ];
      return tellResponses[Math.floor(Math.random() * tellResponses.length)];
    }

    // Вопросы о будущем
    if (lowerMessage.match(/(планы|будущее|цели|мечты|хочу|хотел бы|планирую|собираюсь)/i)) {
      const futureResponses = [
        `Планирую продолжать развиваться в области веб-разработки, изучать новые технологии и создавать интересные проекты. v${version}`,
        `Хочу развиваться как разработчик, работать над интересными проектами и постоянно улучшать свои навыки. v${version}`,
        `Планы связаны с профессиональным ростом: изучение новых технологий, участие в проектах и постоянное совершенствование. v${version}`,
        `Стремлюсь к постоянному развитию, изучению новых инструментов и созданию качественных продуктов. v${version}`,
      ];
      return futureResponses[Math.floor(Math.random() * futureResponses.length)];
    }

    // Вопросы о сложностях
    if (lowerMessage.match(/(сложно|трудно|проблем|ошибк|баг|не работает|не получается)/i)) {
      const problemResponses = [
        `Понимаю, что могут быть сложности. Могу помочь разобраться с вопросами о резюме или проектах. Что именно вызывает трудности? v${version}`,
        `Если есть проблемы или вопросы - обращайся! Постараюсь помочь разобраться. v${version}`,
        `Сложности - это нормально! Могу помочь советом или информацией. В чем проблема? v${version}`,
      ];
      return problemResponses[Math.floor(Math.random() * problemResponses.length)];
    }

    // Вопросы о технологиях (детальные) - расширенный список
    if (detectedTech) {
      const techDetails: Record<string, string[]> = {
        react: [
          `React - отличная библиотека для создания пользовательских интерфейсов! Использую его для создания компонентов, управления состоянием и оптимизации производительности. v${version}`,
          `Работаю с React уже давно. Нравится компонентный подход, виртуальный DOM и экосистема. Создаю переиспользуемые компоненты и оптимизирую рендеринг. v${version}`,
          `React - это мощный инструмент для фронтенд разработки. Использую хуки, контекст, роутинг и другие возможности библиотеки. v${version}`,
        ],
        javascript: [
          `JavaScript - основа веб-разработки! Использую современный ES6+ синтаксис, асинхронное программирование, работаю с DOM и API. v${version}`,
          `JavaScript - мой основной язык. Работаю с функциями высшего порядка, замыканиями, промисами, async/await. Постоянно изучаю новые возможности языка. v${version}`,
          `JavaScript - универсальный язык программирования. Использую для фронтенда и бэкенда, работаю с современными возможностями ES6+. v${version}`,
        ],
        typescript: [
          `TypeScript добавляет типобезопасность к JavaScript. Использую для больших проектов, где важна надежность кода. Интерфейсы, типы, дженерики - все это помогает писать качественный код. v${version}`,
          `TypeScript - отличный выбор для серьезных проектов. Статическая типизация помогает избежать ошибок и делает код более понятным. v${version}`,
          `TypeScript - это JavaScript с типами. Использую для улучшения качества кода и предотвращения ошибок на этапе разработки. v${version}`,
        ],
        node: [
          `Node.js позволяет использовать JavaScript на сервере. Работаю с Express, создаю REST API, работаю с базами данных и файловой системой. v${version}`,
          `Node.js открывает возможности серверной разработки на JavaScript. Использую для создания бэкенда, работы с API и автоматизации задач. v${version}`,
          `Node.js - это среда выполнения JavaScript на сервере. Использую для создания серверных приложений и работы с различными библиотеками. v${version}`,
        ],
        css: [
          `CSS - для создания красивых интерфейсов! Использую современные возможности: Flexbox, Grid, анимации, переменные. Создаю адаптивные и отзывчивые дизайны. v${version}`,
          `Работаю с CSS для стилизации: препроцессоры, методологии именования, создание компонентных стилей. Важно создавать поддерживаемый и масштабируемый код. v${version}`,
          `CSS - это искусство стилизации. Использую современные техники: кастомные свойства, Grid, Flexbox, анимации для создания интерактивных интерфейсов. v${version}`,
        ],
        python: [
          `Python - отличный язык для различных задач! Использую для скриптов, автоматизации, работы с данными. Простой синтаксис и мощные библиотеки. v${version}`,
          `Python - универсальный язык программирования. Подходит для веб-разработки, анализа данных, автоматизации. Большая экосистема библиотек. v${version}`,
        ],
        vue: [
          `Vue.js - прогрессивный фреймворк для создания интерфейсов. Простой в изучении, гибкий и мощный. Хорошая альтернатива React. v${version}`,
          `Vue - отличный выбор для веб-разработки. Компонентный подход, реактивность, простота использования делают его популярным. v${version}`,
        ],
        angular: [
          `Angular - полнофункциональный фреймворк от Google. Подходит для больших приложений, имеет встроенные инструменты и TypeScript из коробки. v${version}`,
          `Angular - мощный фреймворк для enterprise приложений. Использует TypeScript, имеет собственную архитектуру и множество встроенных возможностей. v${version}`,
        ],
      };

      if (techDetails[detectedTech.toLowerCase()]) {
        const responses = techDetails[detectedTech.toLowerCase()];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Вопросы о компаниях (общие)
    if (detectedCompany && !lowerMessage.match(/(ragebyte|рейджбайт)/i)) {
      const companyResponses = [
        `${detectedCompany.charAt(0).toUpperCase() + detectedCompany.slice(1)} - интересная компания! Могу рассказать больше, если уточнишь, что именно интересует. v${version}`,
        `Слышал о ${detectedCompany}. Что именно хочешь узнать об этой компании? v${version}`,
      ];
      return companyResponses[Math.floor(Math.random() * companyResponses.length)];
    }

    // Контекстные ответы на основе предыдущих тем
    if (context.topics.length > 0 && context.lastTopic) {
      const contextualResponses: Record<string, string[]> = {
        resume: [
          `Продолжаем говорить о резюме? Что еще хочешь узнать? v${version}`,
          `Еще вопросы о резюме? Спрашивай! v${version}`,
          `О резюме еще что-то интересует? v${version}`,
        ],
        skills: [
          `Хочешь узнать больше о навыках? Могу рассказать подробнее! v${version}`,
          `Еще вопросы о технологиях и навыках? v${version}`,
          `О навыках что-то еще? v${version}`,
        ],
        education: [
          `Интересует что-то еще об образовании? v${version}`,
          `Есть еще вопросы об учебе? v${version}`,
        ],
        projects: [
          `Хочешь узнать больше о проектах? v${version}`,
          `Еще вопросы о разработке? v${version}`,
        ],
        games: [
          `Продолжаем говорить об играх? v${version}`,
          `Еще что-то об игровой индустрии? v${version}`,
        ],
      };

      if (contextualResponses[context.lastTopic]) {
        const responses = contextualResponses[context.lastTopic];
        if (Math.random() > 0.7) {
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
    }

    // Дефолтные интеллектуальные ответы с учетом контекста
    const intelligentResponses = {
      friendly: [
        `Интересный вопрос! Могу рассказать о моем опыте, навыках или образовании. Что именно тебя интересует? v${version}`,
        `Хороший вопрос! Посмотри разделы резюме - там много полезной информации. Или спроси что-то конкретное! v${version}`,
        `Понял твой вопрос. Могу помочь узнать больше о резюме. Попробуй спросить о навыках, опыте работы или образовании. v${version}`,
        `Давайте поговорим! Что тебя больше всего интересует в резюме? v${version}`,
        `Могу ответить на вопросы о резюме. Спроси о навыках, опыте, образовании или контактах. v${version}`,
        `Интересно! Могу рассказать подробнее. Уточни, о чем именно ты хочешь узнать? v${version}`,
        `Хорошо! О чем поговорим? v${version}`,
      ],
      professional: [
        `Могу предоставить информацию о резюме. Что именно вас интересует: навыки, опыт работы или образование? v${version}`,
        `Готов ответить на ваши вопросы о резюме. Уточните, пожалуйста, какой раздел вас интересует. v${version}`,
        `Могу помочь с информацией о профессиональном опыте и навыках. Что вас интересует? v${version}`,
        `Готов предоставить детальную информацию. Какой раздел резюме вас интересует? v${version}`,
      ],
      casual: [
        `Окей, понял. О чем хочешь узнать? v${version}`,
        `Норм вопрос. Что именно интересует? v${version}`,
        `Могу рассказать. Спроси что-то конкретное! v${version}`,
        `Ок! О чем речь? v${version}`,
      ],
      enthusiastic: [
        `Отличный вопрос! С удовольствием расскажу! Что именно тебя интересует: навыки, опыт или проекты? v${version}`,
        `Супер! Давай разберемся! О чем хочешь узнать подробнее? v${version}`,
        `Замечательно! Могу рассказать много интересного! Что тебя больше всего интересует? v${version}`,
        `Великолепно! Готов ответить на все вопросы! v${version}`,
      ],
      curious: [
        `Интересный вопрос! Что именно хочешь узнать? v${version}`,
        `Хорошо! Готов ответить на вопросы. О чем речь? v${version}`,
        `Понял! Могу объяснить подробнее. Уточни детали. v${version}`,
      ],
      helpful: [
        `Все хорошо! Чем могу помочь? v${version}`,
        `Отлично! Готов помочь с любыми вопросами. Что интересует? v${version}`,
        `Рад помочь! О чем хочешь узнать? v${version}`,
      ],
    };

    const moodResponses = intelligentResponses[context.mood] || intelligentResponses.friendly;
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      const aiResponse = await generateAIResponse(userMessageText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {showPattern && (
        <motion.canvas
          ref={patternRef}
          className="chat-pattern"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        />
      )}
      <div className="chat-section">
        {messages.length === 0 && !isTyping && (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2>Чат с AI</h2>
            <p>Задайте любой вопрос о резюме или просто поболтайте</p>
          </div>
        )}

        <div className="chat-messages-container">
          {messages.map((message) => (
            <Message key={message.id} delay={0}>
              <div className="message-avatar">
                {message.isUser ? (
                  resumeData.avatar ? (
                    <img src={resumeData.avatar} alt={resumeData.name} />
                  ) : (
                    <span>{getInitials('You')}</span>
                  )
                ) : (
                  <span>AI</span>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{message.isUser ? 'Вы' : 'AI Ассистент'}</span>
                  <span className="message-timestamp">
                    {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="message-text">
                  <p>
                    {message.text.split(/(v\d+\.\d+)/).map((part, index) => {
                      if (part.match(/^v\d+\.\d+$/)) {
                        return <span key={index} className="chat-version">{part}</span>;
                      }
                      return part;
                    })}
                  </p>
                </div>
              </div>
            </Message>
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-wrapper">
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Напишите сообщение..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
