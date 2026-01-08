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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я AI-ассистент. Могу ответить на вопросы о резюме или просто поболтать. Чем могу помочь?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Простая система ответов на основе ключевых слов
    // В будущем здесь можно подключить реальный AI API
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Ответы о резюме
    if (lowerMessage.includes('резюме') || lowerMessage.includes('опыт') || lowerMessage.includes('навыки')) {
      return 'В моем резюме вы найдете информацию о моем опыте работы, навыках, образовании и контактах. Используйте меню слева для навигации по разделам!';
    }
    
    if (lowerMessage.includes('навык') || lowerMessage.includes('технологи')) {
      return 'Я работаю с современными технологиями: JavaScript/TypeScript, React, Node.js, CSS и многими другими. Подробнее смотрите в разделе "Навыки"!';
    }
    
    if (lowerMessage.includes('опыт работы') || lowerMessage.includes('компания')) {
      return 'У меня есть опыт работы в различных компаниях. Подробную информацию о моем опыте вы можете найти в разделе "Опыт работы".';
    }
    
    if (lowerMessage.includes('образование') || lowerMessage.includes('университет')) {
      return 'Информацию об образовании можно найти в разделе "Образование". Там указаны все учебные заведения и достижения.';
    }
    
    if (lowerMessage.includes('контакт') || lowerMessage.includes('связаться')) {
      return 'Все контакты для связи находятся в разделе "Контакты". Там вы найдете email, GitHub, LinkedIn и другие способы связи!';
    }
    
    // Приветствия
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return 'Привет! Рад вас видеть! Чем могу помочь?';
    }
    
    // Вопросы о проекте
    if (lowerMessage.includes('проект') || lowerMessage.includes('сайт') || lowerMessage.includes('портфолио')) {
      return 'Этот сайт-резюме создан с использованием React, TypeScript и современных веб-технологий. Интерфейс выполнен в стиле мессенджера для удобства навигации.';
    }
    
    // Общие ответы
    if (lowerMessage.includes('как дела') || lowerMessage.includes('как жизнь')) {
      return 'У меня все отлично! Готов помочь вам узнать больше о моем резюме.';
    }
    
    if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодар')) {
      return 'Пожалуйста! Всегда рад помочь. Если есть еще вопросы - спрашивайте!';
    }
    
    // Дефолтные ответы
    const defaultResponses = [
      'Интересный вопрос! Могу рассказать больше о моем опыте и навыках. Что именно вас интересует?',
      'Хороший вопрос! Посмотрите разделы резюме - там много полезной информации.',
      'Я могу помочь вам узнать больше о моем резюме. Попробуйте спросить о навыках, опыте работы или образовании.',
      'Давайте поговорим о резюме! Что вас больше всего интересует?',
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Имитация задержки ответа AI
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="chatbot-title">AI Ассистент</h3>
                  <p className="chatbot-subtitle">Онлайн</p>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
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
                    <p>{message.text}</p>
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
      </AnimatePresence>

      <motion.button
        className="chatbot-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
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
        {!isOpen && messages.length > 1 && (
          <span className="chatbot-notification-badge">{messages.length - 1}</span>
        )}
      </motion.button>
    </>
  );
};
