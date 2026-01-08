import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatBot.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageCount, setMessageCount] = useState(0);

  // Генерация версии для ответа
  const generateVersion = (): string => {
    const major = 1;
    const minor = Math.floor(Math.random() * 90) + 10; // От 10 до 99
    return `${major}.${minor}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const version = generateVersion();
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Анализ контекста сообщения
    const words = lowerMessage.split(/\s+/);
    const messageLength = words.length;
    
    // Приветствия и начало разговора
    if (lowerMessage.match(/^(привет|здравствуй|hi|hello|добр|хай|салют)/i)) {
      const greetings = [
        `Привет! Чем могу помочь? v${version}`,
        `Здравствуйте! Готов ответить на ваши вопросы. v${version}`,
        `Приветствую! Что вас интересует? v${version}`,
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Вопросы о резюме и опыте
    if (lowerMessage.match(/(резюме|опыт|работа|професси|карьер)/i)) {
      return `В резюме есть информация о моем опыте работы, навыках, образовании и контактах. Используйте меню слева для навигации! v${version}`;
    }
    
    // Вопросы о навыках и технологиях
    if (lowerMessage.match(/(навык|технологи|умеешь|знаешь|язык|фреймворк|библиотек)/i)) {
      const techResponses = [
        `Работаю с JavaScript/TypeScript, React, Node.js, CSS и другими современными технологиями. Подробнее в разделе "Навыки"! v${version}`,
        `Использую современный стек: React, TypeScript, Node.js. Все навыки указаны в разделе "Навыки". v${version}`,
        `Владею различными технологиями веб-разработки. Смотрите раздел "Навыки" для деталей. v${version}`,
      ];
      return techResponses[Math.floor(Math.random() * techResponses.length)];
    }
    
    // Вопросы о компаниях и опыте работы
    if (lowerMessage.match(/(компани|работ|проект|где работал|опыт работы)/i)) {
      return `Есть опыт работы в различных компаниях. Подробности в разделе "Опыт работы". v${version}`;
    }
    
    // Вопросы об образовании
    if (lowerMessage.match(/(образован|университет|институт|учился|образование)/i)) {
      return `Информация об образовании находится в разделе "Образование". v${version}`;
    }
    
    // Вопросы о контактах
    if (lowerMessage.match(/(контакт|связаться|email|телефон|telegram|github|linkedin|написать)/i)) {
      return `Все контакты для связи в разделе "Контакты". Там email, GitHub, LinkedIn и другие способы связи! v${version}`;
    }
    
    // Вопросы о проекте/сайте
    if (lowerMessage.match(/(проект|сайт|портфолио|сделал|создал|разработал)/i)) {
      return `Сайт создан на React, TypeScript и современных веб-технологиях. Интерфейс в стиле мессенджера. v${version}`;
    }
    
    // Вопросы "как дела"
    if (lowerMessage.match(/(как дела|как жизнь|как поживаешь|что нового)/i)) {
      return `Все отлично! Готов помочь узнать больше о резюме. v${version}`;
    }
    
    // Благодарности
    if (lowerMessage.match(/(спасибо|благодар|thanks|thank you)/i)) {
      const thanksResponses = [
        `Пожалуйста! Всегда рад помочь. v${version}`,
        `Не за что! Если будут вопросы - спрашивайте. v${version}`,
        `Рад был помочь! v${version}`,
      ];
      return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
    }
    
    // Вопросы "кто ты"
    if (lowerMessage.match(/(кто ты|что ты|ты кто|расскажи о себе)/i)) {
      return `Я AI-ассистент, помогаю узнать больше о резюме. Задавайте вопросы! v${version}`;
    }
    
    // Вопросы с "что"
    if (lowerMessage.match(/^что\s+/i)) {
      return `Могу рассказать о навыках, опыте работы, образовании или контактах. Что именно интересует? v${version}`;
    }
    
    // Вопросы с "как"
    if (lowerMessage.match(/^как\s+/i)) {
      return `Могу объяснить подробнее. Уточните, о чем именно вы спрашиваете? v${version}`;
    }
    
    // Короткие сообщения (1-2 слова)
    if (messageLength <= 2) {
      const shortResponses = [
        `Понял. Уточните, пожалуйста, что именно вас интересует? v${version}`,
        `Можете задать вопрос о резюме, навыках или опыте работы. v${version}`,
        `Чем могу помочь? Спросите о резюме! v${version}`,
      ];
      return shortResponses[Math.floor(Math.random() * shortResponses.length)];
    }
    
    // Умные ответы на основе контекста
    if (lowerMessage.match(/(расскажи|покажи|поделись|дай информацию)/i)) {
      return `Могу рассказать о навыках, опыте работы, образовании или контактах. Что именно интересует? v${version}`;
    }
    
    // Дефолтные интеллектуальные ответы
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
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setMessageCount((prev) => prev + 1);

    // Имитация задержки ответа AI
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(userMessageText);
      const aiMessage: Message = {
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

  return (
    <>
      {isOpen && (
        <motion.div
          className="chatbot-container"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
              <button 
                className="chatbot-close" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`chatbot-message ${message.isUser ? 'user' : 'ai'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {!message.isUser && (
                    <div className="chatbot-message-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  )}
                  <div className="chatbot-message-content">
                    <p>
                      {message.text.split(/(v\d+\.\d+)/).map((part, index) => {
                        if (part.match(/^v\d+\.\d+$/)) {
                          return <span key={index} className="chatbot-version">{part}</span>;
                        }
                        return part;
                      })}
                    </p>
                    <span className="chatbot-message-time">
                      {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="chatbot-message ai">
                  <div className="chatbot-message-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="chatbot-message-content">
                    <div className="chatbot-typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
              <input
                type="text"
                className="chatbot-input"
                placeholder="Напишите сообщение..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                className="chatbot-send-button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </motion.div>
      )}

      <motion.button
        className="chatbot-toggle-button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        type="button"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <path d="M7 9h2v2H7zm4 0h6v2h-6zm-4 4h6v2H7z"/>
          </svg>
        )}
        {!isOpen && messages.length > 0 && (
          <span className="chatbot-notification-badge">{messages.filter(m => m.isUser).length}</span>
        )}
      </motion.button>
    </>
  );
};
