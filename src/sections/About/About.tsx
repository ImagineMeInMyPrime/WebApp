import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData } from '../../data/resume';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../components/Message/Message.css';
import './About.css';

/**
 * About Component
 * 
 * Компонент для отображения информации "О себе" в формате мессенджера.
 * Включает анимации, интерактивные элементы и расширенную функциональность.
 * 
 * @component
 * @returns {JSX.Element} Компонент секции "О себе"
 */

// Типы и интерфейсы
interface AboutSectionProps {
  onInteraction?: (type: string) => void;
}

interface TextChunk {
  text: string;
  delay: number;
  id: string;
}

interface AnimationState {
  isVisible: boolean;
  hasAnimated: boolean;
  currentStep: number;
}

interface InteractionStats {
  views: number;
  interactions: number;
  lastInteraction: Date | null;
}

// Константы
const TYPING_DELAY = 1500;
const TEXT_ANIMATION_DELAY = 100;
const MAX_TEXT_CHUNKS = 50;
const INTERACTION_THRESHOLD = 3;

// Утилиты для работы с текстом
const textUtils = {
  /**
   * Разбивает текст на части для анимированного отображения
   */
  splitTextIntoChunks: (text: string, chunkSize: number = 50): TextChunk[] => {
    const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 0);
    const chunks: TextChunk[] = [];
    
    sentences.forEach((sentence, index) => {
      if (sentence.length > chunkSize) {
        const words = sentence.split(' ');
        let currentChunk = '';
        
        words.forEach((word, wordIndex) => {
          if ((currentChunk + word).length <= chunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            if (currentChunk) {
              chunks.push({
                text: currentChunk,
                delay: index * TEXT_ANIMATION_DELAY + wordIndex * 10,
                id: `chunk-${chunks.length}`,
              });
            }
            currentChunk = word;
          }
        });
        
        if (currentChunk) {
          chunks.push({
            text: currentChunk,
            delay: index * TEXT_ANIMATION_DELAY,
            id: `chunk-${chunks.length}`,
          });
        }
      } else {
        chunks.push({
          text: sentence,
          delay: index * TEXT_ANIMATION_DELAY,
          id: `chunk-${index}`,
        });
      }
    });
    
    return chunks.slice(0, MAX_TEXT_CHUNKS);
  },

  /**
   * Форматирует текст с выделением ключевых слов
   */
  formatTextWithHighlights: (text: string): string => {
    const keywords = ['разработчик', 'React', 'TypeScript', 'веб-приложений', 'технологий'];
    let formatted = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      formatted = formatted.replace(regex, '<strong>$1</strong>');
    });
    
    return formatted;
  },

  /**
   * Извлекает инициалы из имени
   */
  getInitials: (name: string, maxLength: number = 2): string => {
    if (!name || name.trim().length === 0) return '??';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, maxLength).toUpperCase();
    }
    
    return parts
      .slice(0, maxLength)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  },

  /**
   * Подсчитывает статистику текста
   */
  getTextStats: (text: string) => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    return {
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      averageWordsPerSentence: words.length / sentences.length || 0,
    };
  },
};

// Хуки для компонента
const useAboutAnimations = () => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isVisible: false,
    hasAnimated: false,
    currentStep: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        isVisible: true,
        currentStep: 1,
      }));
    }, TYPING_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const advanceStep = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      hasAnimated: true,
    }));
  }, []);

  return { animationState, advanceStep };
};

const useInteractionTracking = () => {
  const [stats, setStats] = useState<InteractionStats>({
    views: 0,
    interactions: 0,
    lastInteraction: null,
  });

  const trackView = useCallback(() => {
    setStats(prev => ({
      ...prev,
      views: prev.views + 1,
    }));
  }, []);

  const trackInteraction = useCallback((type: string) => {
    setStats(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      lastInteraction: new Date(),
    }));
  }, []);

  useEffect(() => {
    trackView();
  }, [trackView]);

  return { stats, trackInteraction };
};

const useTextAnimation = (text: string) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) return;

    let currentIndex = 0;
    const typingSpeed = 30; // символов в секунду

    intervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 1000 / typingSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text]);

  return { displayedText, isTyping };
};

// Валидация данных
const validateResumeData = (data: typeof resumeData): boolean => {
  if (!data.name || data.name.trim().length === 0) {
    console.warn('Resume data: name is missing or empty');
    return false;
  }

  if (!data.about || data.about.trim().length === 0) {
    console.warn('Resume data: about section is missing or empty');
    return false;
  }

  if (data.about.length > 5000) {
    console.warn('Resume data: about section is too long');
    return false;
  }

  return true;
};

// Компоненты для отображения
const AvatarComponent: React.FC<{ name: string; avatar?: string }> = ({ name, avatar }) => {
  const initials = useMemo(() => textUtils.getInitials(name), [name]);
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (avatar && !imageError) {
    return (
      <motion.div
        className="message-avatar"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <img
          src={avatar}
          alt={name}
          onError={handleImageError}
          loading="lazy"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="message-avatar"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <span>{initials}</span>
    </motion.div>
  );
};

const TextContent: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const textChunks = useMemo(() => textUtils.splitTextIntoChunks(text), [text]);
  const textStats = useMemo(() => textUtils.getTextStats(text), [text]);

  return (
    <div className="about-text-content">
      <AnimatePresence mode="wait">
        {textChunks.map((chunk, index) => (
          <motion.p
            key={chunk.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: delay / 1000 + index * 0.05,
              duration: 0.3,
            }}
            className="about-text-paragraph"
          >
            {chunk.text}
          </motion.p>
        ))}
      </AnimatePresence>
      
      {/* Скрытая статистика для аналитики */}
      <div className="about-text-stats" aria-hidden="true">
        <span data-stat="words">{textStats.words}</span>
        <span data-stat="sentences">{textStats.sentences}</span>
        <span data-stat="characters">{textStats.characters}</span>
      </div>
    </div>
  );
};

const InteractiveElements: React.FC<{
  onInteraction: (type: string) => void;
  stats: InteractionStats;
}> = ({ onInteraction, stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
    onInteraction('expand');
  }, [onInteraction]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${resumeData.name} - Резюме`,
        text: resumeData.about.substring(0, 200),
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    }
    onInteraction('share');
  }, [onInteraction]);

  return (
    <motion.div
      className="about-interactive-elements"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <motion.button
        className="about-action-button"
        onClick={handleExpand}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
      >
        {isExpanded ? 'Свернуть' : 'Подробнее'}
      </motion.button>

      {navigator.share && (
        <motion.button
          className="about-action-button"
          onClick={handleShare}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Поделиться"
        >
          Поделиться
        </motion.button>
      )}

      {stats.interactions > INTERACTION_THRESHOLD && (
        <div className="about-stats-badge">
          {stats.interactions} взаимодействий
        </div>
      )}
    </motion.div>
  );
};

// Основной компонент
export const About: React.FC<AboutSectionProps> = ({ onInteraction }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { animationState, advanceStep } = useAboutAnimations();
  const { stats, trackInteraction } = useInteractionTracking();
  const { displayedText, isTyping: isTextTyping } = useTextAnimation(resumeData.about);
  const { analytics, trackInteraction: trackAnalytics } = useAboutAnalytics();
  const { share } = useAboutShare();

  // Валидация данных
  const isValidData = useMemo(() => validateResumeData(resumeData), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTyping(false);
      setShowContent(true);
      setIsVisible(true);
      advanceStep();
    }, TYPING_DELAY);

    return () => clearTimeout(timer);
  }, [advanceStep]);

  // Отслеживание видимости для аналитики
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            trackInteraction('view');
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [trackInteraction]);

  // Обработка ошибок
  if (!isValidData) {
    return (
      <div className="about-error">
        <p>Ошибка загрузки данных. Пожалуйста, обновите страницу.</p>
      </div>
    );
  }

  const handleInteraction = useCallback((type: string) => {
    trackInteraction(type);
    trackAnalytics(type);
    onInteraction?.(type);
  }, [trackInteraction, trackAnalytics, onInteraction]);

  return (
    <div ref={containerRef} className="about-container">
      <AnimatePresence mode="wait">
        {showTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TypingIndicator />
          </motion.div>
        )}

        {showContent && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Message delay={0.2}>
              <AvatarComponent name={resumeData.name} avatar={resumeData.avatar} />
              
              <div className="message-content">
                <div className="message-header">
                  <motion.span
                    className="message-author"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {resumeData.name}
                  </motion.span>
                  <motion.span
                    className="message-timestamp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    сейчас
                  </motion.span>
                </div>

                <div className="message-text">
                  {isTextTyping ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {displayedText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="typing-cursor"
                      >
                        |
                      </motion.span>
                    </motion.p>
                  ) : (
                    <TextContent text={resumeData.about} delay={TEXT_ANIMATION_DELAY} />
                  )}
                </div>

                {!isTextTyping && (
                  <>
                    <InteractiveElements
                      onInteraction={handleInteraction}
                      stats={stats}
                    />
                    <AboutSharePanel onShare={share} />
                    <AboutTextAnalysis text={resumeData.about} />
                    <AboutAnalytics analytics={analytics} />
                  </>
                )}
              </div>
            </Message>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Дополнительная информация */}
      {isVisible && resumeData.bio && (
        <motion.div
          className="about-additional-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <Message delay={0.5}>
            <div className="message-avatar">
              <span>{textUtils.getInitials(resumeData.name)}</span>
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-author">{resumeData.name}</span>
                <span className="message-timestamp">сейчас</span>
              </div>
              <div className="message-text">
                <p>{resumeData.bio}</p>
              </div>
            </div>
          </Message>
        </motion.div>
      )}

      {/* Индикатор загрузки */}
      {showTyping && (
        <div className="about-loading-indicator" aria-label="Загрузка">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
};

// Дополнительные расширенные утилиты для About компонента
const aboutAdvancedUtils = {
  /**
   * Анализирует текст и извлекает ключевые фразы
   */
  extractKeyPhrases: (text: string, minLength: number = 3): string[] => {
    const words = text.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    const stopWords = new Set(['и', 'в', 'на', 'с', 'по', 'для', 'от', 'до', 'из', 'к', 'о', 'у', 'я', 'ты', 'он', 'она', 'мы', 'вы', 'они', 'это', 'что', 'как', 'где', 'когда', 'почему', 'который', 'которая', 'которое', 'которые', 'мой', 'моя', 'мое', 'мои', 'твой', 'твоя', 'твое', 'твои', 'его', 'ее', 'их', 'наш', 'наша', 'наше', 'наши', 'ваш', 'ваша', 'ваше', 'ваши']);
    
    for (let i = 0; i < words.length - minLength + 1; i++) {
      const phrase = words.slice(i, i + minLength).join(' ');
      if (!stopWords.has(phrase) && phrase.length > minLength * 2) {
        phrases.push(phrase);
      }
    }
    
    return [...new Set(phrases)].slice(0, 20);
  },

  /**
   * Подсчитывает частоту слов в тексте
   */
  calculateWordFrequency: (text: string): Record<string, number> => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });
    
    return frequency;
  },

  /**
   * Находит самые частые слова
   */
  getTopWords: (text: string, count: number = 10): Array<{ word: string; frequency: number }> => {
    const frequency = aboutAdvancedUtils.calculateWordFrequency(text);
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word, frequency]) => ({ word, frequency }));
  },

  /**
   * Определяет тональность текста
   */
  analyzeSentiment: (text: string): { score: number; label: 'positive' | 'neutral' | 'negative' } => {
    const positiveWords = ['отлично', 'прекрасно', 'хорошо', 'успешно', 'люблю', 'нравится', 'интересно', 'увлекаюсь', 'стремлюсь', 'улучшаю', 'создаю', 'развиваю', 'изучаю', 'качественный', 'современный'];
    const negativeWords = ['плохо', 'негативно', 'проблема', 'сложно', 'трудно', 'неудобно', 'не нравится'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });
    
    if (score > 2) return { score, label: 'positive' };
    if (score < -1) return { score, label: 'negative' };
    return { score, label: 'neutral' };
  },

  /**
   * Разбивает текст на предложения
   */
  splitIntoSentences: (text: string): string[] => {
    return text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
  },

  /**
   * Создает краткое резюме текста
   */
  createSummary: (text: string, maxSentences: number = 3): string => {
    const sentences = aboutAdvancedUtils.splitIntoSentences(text);
    return sentences.slice(0, maxSentences).join('. ') + (sentences.length > maxSentences ? '...' : '');
  },

  /**
   * Подсчитывает статистику читаемости
   */
  calculateReadability: (text: string): {
    averageWordsPerSentence: number;
    averageCharsPerWord: number;
    readingTime: number; // в минутах
    complexity: 'easy' | 'medium' | 'hard';
  } => {
    const sentences = aboutAdvancedUtils.splitIntoSentences(text);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chars = text.replace(/\s/g, '').length;
    
    const avgWordsPerSentence = words.length / sentences.length || 0;
    const avgCharsPerWord = chars / words.length || 0;
    const readingTime = Math.ceil(words.length / 200); // 200 слов в минуту
    
    let complexity: 'easy' | 'medium' | 'hard' = 'medium';
    if (avgWordsPerSentence < 15 && avgCharsPerWord < 5) complexity = 'easy';
    if (avgWordsPerSentence > 20 || avgCharsPerWord > 6) complexity = 'hard';
    
    return {
      averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      averageCharsPerWord: Math.round(avgCharsPerWord * 10) / 10,
      readingTime,
      complexity,
    };
  },

  /**
   * Находит упоминания технологий
   */
  extractTechnologies: (text: string): string[] => {
    const technologies = [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'node.js', 'python',
      'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'html', 'css', 'scss', 'sass', 'less', 'webpack', 'vite', 'npm', 'yarn',
      'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'windows',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'graphql',
      'rest', 'api', 'microservices', 'agile', 'scrum', 'devops', 'ci/cd'
    ];
    
    const lowerText = text.toLowerCase();
    const found: string[] = [];
    
    technologies.forEach(tech => {
      if (lowerText.includes(tech)) {
        found.push(tech);
      }
    });
    
    return [...new Set(found)];
  },

  /**
   * Форматирует текст с выделением ключевых слов
   */
  highlightKeywords: (text: string, keywords: string[]): string => {
    let formatted = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      formatted = formatted.replace(regex, '<mark>$1</mark>');
    });
    return formatted;
  },

  /**
   * Создает облако тегов из текста
   */
  createTagCloud: (text: string, maxTags: number = 20): Array<{ word: string; size: number }> => {
    const frequency = aboutAdvancedUtils.calculateWordFrequency(text);
    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTags);
    
    const maxFreq = sorted[0]?.[1] || 1;
    
    return sorted.map(([word, freq]) => ({
      word,
      size: Math.round((freq / maxFreq) * 100),
    }));
  },
};

// Дополнительные хуки для About компонента
const useAboutAnalytics = () => {
  const [analytics, setAnalytics] = useState<{
    views: number;
    interactions: number;
    timeSpent: number;
    scrollDepth: number;
  }>({
    views: 0,
    interactions: 0,
    timeSpent: 0,
    scrollDepth: 0,
  });

  useEffect(() => {
    const startTime = Date.now();
    setAnalytics(prev => ({ ...prev, views: prev.views + 1 }));

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const depth = Math.min(100, Math.round((scrolled / scrollHeight) * 100));
      setAnalytics(prev => ({ ...prev, scrollDepth: Math.max(prev.scrollDepth, depth) }));
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      setAnalytics(prev => ({ ...prev, timeSpent: prev.timeSpent + timeSpent }));
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const trackInteraction = useCallback((type: string) => {
    setAnalytics(prev => ({ ...prev, interactions: prev.interactions + 1 }));
  }, []);

  return { analytics, trackInteraction };
};

const useAboutShare = () => {
  const share = useCallback(async () => {
    const shareData = {
      title: `${resumeData.name} - Резюме`,
      text: resumeData.about.substring(0, 200),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return true;
      } else {
        // Fallback: копирование в буфер обмена
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        return true;
      }
    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error);
      return false;
    }
  }, []);

  return { share };
};

// Дополнительные компоненты для About
const AboutAnalytics: React.FC<{ analytics: ReturnType<typeof useAboutAnalytics>['analytics'] }> = ({ analytics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="about-analytics"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <button
        className="analytics-toggle"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span>Аналитика ({analytics.views} просмотров)</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="analytics-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="analytics-stats">
              <div className="analytics-stat">
                <span className="stat-label">Просмотры</span>
                <span className="stat-value">{analytics.views}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Взаимодействия</span>
                <span className="stat-value">{analytics.interactions}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Время на странице</span>
                <span className="stat-value">{analytics.timeSpent}с</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Глубина прокрутки</span>
                <span className="stat-value">{analytics.scrollDepth}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AboutTextAnalysis: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sentiment = useMemo(() => aboutAdvancedUtils.analyzeSentiment(text), [text]);
  const readability = useMemo(() => aboutAdvancedUtils.calculateReadability(text), [text]);
  const topWords = useMemo(() => aboutAdvancedUtils.getTopWords(text, 10), [text]);
  const technologies = useMemo(() => aboutAdvancedUtils.extractTechnologies(text), [text]);

  return (
    <motion.div
      className="about-text-analysis"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    >
      <button
        className="analysis-toggle"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span>Анализ текста</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="analysis-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="analysis-section">
              <h4>Тональность</h4>
              <div className={`sentiment-badge sentiment-${sentiment.label}`}>
                {sentiment.label === 'positive' ? 'Позитивная' : sentiment.label === 'negative' ? 'Негативная' : 'Нейтральная'}
                <span className="sentiment-score">({sentiment.score})</span>
              </div>
            </div>

            <div className="analysis-section">
              <h4>Читаемость</h4>
              <div className="readability-info">
                <div>Слов в предложении: {readability.averageWordsPerSentence}</div>
                <div>Символов в слове: {readability.averageCharsPerWord}</div>
                <div>Время чтения: {readability.readingTime} мин</div>
                <div>Сложность: {readability.complexity === 'easy' ? 'Легкая' : readability.complexity === 'hard' ? 'Сложная' : 'Средняя'}</div>
              </div>
            </div>

            {topWords.length > 0 && (
              <div className="analysis-section">
                <h4>Топ слова</h4>
                <div className="top-words-list">
                  {topWords.map((item, index) => (
                    <span key={index} className="word-tag">
                      {item.word} ({item.frequency})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {technologies.length > 0 && (
              <div className="analysis-section">
                <h4>Упоминаемые технологии</h4>
                <div className="technologies-list">
                  {technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AboutSharePanel: React.FC<{ onShare: () => Promise<boolean> }> = ({ onShare }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    const success = await onShare();
    setShareSuccess(success);
    setIsSharing(false);
    
    if (success) {
      setTimeout(() => setShareSuccess(false), 3000);
    }
  }, [onShare]);

  return (
    <motion.div
      className="about-share-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      <button
        className="share-button"
        onClick={handleShare}
        disabled={isSharing}
      >
        {isSharing ? 'Поделиться...' : shareSuccess ? '✓ Поделено!' : 'Поделиться'}
      </button>
    </motion.div>
  );
};

// Обновляем основной компонент для использования новых функций
// Экспорт утилит для тестирования
export { textUtils, validateResumeData, aboutAdvancedUtils };

// Экспорт типов
export type { AboutSectionProps, TextChunk, AnimationState, InteractionStats };
