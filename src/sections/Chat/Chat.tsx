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

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPattern, setShowPattern] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const patternRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Показываем узор при загрузке
    const timer = setTimeout(() => {
      setShowPattern(false);
    }, 2000);

    // Рисуем случайный узор
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

    // Очистка
    ctx.fillStyle = '#2f3136';
    ctx.fillRect(0, 0, width, height);

    // Выбираем случайный тип узора
    const patternType = Math.floor(Math.random() * 4);

    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;

    switch (patternType) {
      case 0:
        // Спирали
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
        // Геометрические фигуры
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
        // Волны
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
        // Сетка с узорами
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

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const version = generateVersion();
    const lowerMessage = userMessage.toLowerCase().trim();
    const words = lowerMessage.split(/\s+/);
    const messageLength = words.length;

    if (lowerMessage.match(/^(привет|здравствуй|hi|hello|добр|хай|салют)/i)) {
      const greetings = [
        `Привет! Чем могу помочь? v${version}`,
        `Здравствуйте! Готов ответить на ваши вопросы. v${version}`,
        `Приветствую! Что вас интересует? v${version}`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lowerMessage.match(/(резюме|опыт|работа|професси|карьер)/i)) {
      return `В резюме есть информация о моем опыте работы, навыках, образовании и контактах. Используйте меню слева для навигации! v${version}`;
    }

    if (lowerMessage.match(/(навык|технологи|умеешь|знаешь|язык|фреймворк|библиотек)/i)) {
      const techResponses = [
        `Работаю с JavaScript/TypeScript, React, Node.js, CSS и другими современными технологиями. Подробнее в разделе "Навыки"! v${version}`,
        `Использую современный стек: React, TypeScript, Node.js. Все навыки указаны в разделе "Навыки". v${version}`,
        `Владею различными технологиями веб-разработки. Смотрите раздел "Навыки" для деталей. v${version}`,
      ];
      return techResponses[Math.floor(Math.random() * techResponses.length)];
    }

    if (lowerMessage.match(/(компани|работ|проект|где работал|опыт работы)/i)) {
      return `Есть опыт работы в различных компаниях. Подробности в разделе "Опыт работы". v${version}`;
    }

    if (lowerMessage.match(/(образован|университет|институт|учился|образование)/i)) {
      return `Информация об образовании находится в разделе "Образование". v${version}`;
    }

    if (lowerMessage.match(/(контакт|связаться|email|телефон|telegram|github|написать)/i)) {
      return `Все контакты для связи в разделе "Контакты". Там email, GitHub, Telegram и другие способы связи! v${version}`;
    }

    if (lowerMessage.match(/(проект|сайт|портфолио|сделал|создал|разработал)/i)) {
      return `Сайт создан на React, TypeScript и современных веб-технологиях. Интерфейс в стиле мессенджера. v${version}`;
    }

    if (lowerMessage.match(/(как дела|как жизнь|как поживаешь|что нового)/i)) {
      return `Все отлично! Готов помочь узнать больше о резюме. v${version}`;
    }

    if (lowerMessage.match(/(спасибо|благодар|thanks|thank you)/i)) {
      const thanksResponses = [
        `Пожалуйста! Всегда рад помочь. v${version}`,
        `Не за что! Если будут вопросы - спрашивайте. v${version}`,
        `Рад был помочь! v${version}`,
      ];
      return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
    }

    if (lowerMessage.match(/(кто ты|что ты|ты кто|расскажи о себе)/i)) {
      return `Я AI-ассистент, помогаю узнать больше о резюме. Задавайте вопросы! v${version}`;
    }

    if (lowerMessage.match(/^что\s+/i)) {
      return `Могу рассказать о навыках, опыте работы, образовании или контактах. Что именно интересует? v${version}`;
    }

    if (lowerMessage.match(/^как\s+/i)) {
      return `Могу объяснить подробнее. Уточните, о чем именно вы спрашиваете? v${version}`;
    }

    if (messageLength <= 2) {
      const shortResponses = [
        `Понял. Уточните, пожалуйста, что именно вас интересует? v${version}`,
        `Можете задать вопрос о резюме, навыках или опыте работы. v${version}`,
        `Чем могу помочь? Спросите о резюме! v${version}`,
      ];
      return shortResponses[Math.floor(Math.random() * shortResponses.length)];
    }

    if (lowerMessage.match(/(расскажи|покажи|поделись|дай информацию)/i)) {
      return `Могу рассказать о навыках, опыте работы, образовании или контактах. Что именно интересует? v${version}`;
    }

    const intelligentResponses = [
      `Интересный вопрос! Могу рассказать о моем опыте, навыках или образовании. Что именно вас интересует? v${version}`,
      `Хороший вопрос! Посмотрите разделы резюме - там много полезной информации. v${version}`,
      `Понял ваш вопрос. Могу помочь узнать больше о резюме. Попробуйте спросить о навыках, опыте работы или образовании. v${version}`,
      `Давайте поговорим! Что вас больше всего интересует в резюме? v${version}`,
      `Могу ответить на вопросы о резюме. Спросите о навыках, опыте, образовании или контактах. v${version}`,
    ];

    return intelligentResponses[Math.floor(Math.random() * intelligentResponses.length)];
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
