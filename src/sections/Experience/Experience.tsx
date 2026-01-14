import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData, Experience as ExperienceType } from '../../data/resume';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../components/Message/Message.css';
import './Experience.css';

/**
 * Experience Component
 * 
 * Расширенный компонент для отображения опыта работы с фильтрацией,
 * детальной информацией, технологиями и достижениями.
 * 
 * @component
 * @returns {JSX.Element} Компонент секции "Опыт работы"
 */

// Типы и интерфейсы
interface ExperienceSectionProps {
  onExperienceClick?: (experience: ExperienceType) => void;
}

interface ExperienceFilter {
  company: string;
  position: string;
  period: string;
  technologies: string[];
}

interface ExperienceStats {
  total: number;
  totalYears: number;
  companies: string[];
  technologies: Set<string>;
  averageDuration: number;
}

interface TimelineItem {
  id: string;
  experience: ExperienceType;
  index: number;
  startDate: Date | null;
  endDate: Date | null;
  duration: number;
}

// Константы
const TYPING_DELAY = 1500;
const ANIMATION_DELAY = 100;
const MONTHS_IN_YEAR = 12;

// Утилиты для работы с опытом
const experienceUtils = {
  /**
   * Парсит период работы в даты
   */
  parsePeriod: (period: string): { start: Date | null; end: Date | null; isCurrent: boolean } => {
    const parts = period.split('-').map(p => p.trim());
    const isCurrent = parts[1]?.toLowerCase().includes('настоящее') || 
                      parts[1]?.toLowerCase().includes('current') ||
                      parts[1] === '';
    
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (parts[0]) {
      const startYear = parseInt(parts[0]);
      if (!isNaN(startYear)) {
        startDate = new Date(startYear, 0, 1);
      }
    }

    if (!isCurrent && parts[1]) {
      const endYear = parseInt(parts[1]);
      if (!isNaN(endYear)) {
        endDate = new Date(endYear, 11, 31);
      }
    } else if (isCurrent) {
      endDate = new Date();
    }

    return { start: startDate, end: endDate, isCurrent };
  },

  /**
   * Вычисляет длительность работы в месяцах
   */
  calculateDuration: (period: string): number => {
    const { start, end } = experienceUtils.parsePeriod(period);
    if (!start || !end) return 0;

    const months = (end.getFullYear() - start.getFullYear()) * MONTHS_IN_YEAR +
                   (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  },

  /**
   * Форматирует длительность работы
   */
  formatDuration: (months: number): string => {
    if (months < MONTHS_IN_YEAR) {
      return `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`;
    }
    const years = Math.floor(months / MONTHS_IN_YEAR);
    const remainingMonths = months % MONTHS_IN_YEAR;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
    }
    
    return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} ${remainingMonths} ${remainingMonths === 1 ? 'месяц' : remainingMonths < 5 ? 'месяца' : 'месяцев'}`;
  },

  /**
   * Фильтрует опыт работы
   */
  filterExperience: (experiences: ExperienceType[], filter: Partial<ExperienceFilter>): ExperienceType[] => {
    return experiences.filter(exp => {
      if (filter.company && !exp.company.toLowerCase().includes(filter.company.toLowerCase())) {
        return false;
      }
      if (filter.position && !exp.position.toLowerCase().includes(filter.position.toLowerCase())) {
        return false;
      }
      if (filter.technologies && filter.technologies.length > 0) {
        const expTechs = exp.technologies || [];
        const hasMatchingTech = filter.technologies.some(tech =>
          expTechs.some(expTech => expTech.toLowerCase().includes(tech.toLowerCase()))
        );
        if (!hasMatchingTech) return false;
      }
      return true;
    });
  },

  /**
   * Сортирует опыт работы
   */
  sortExperience: (experiences: ExperienceType[], sortBy: 'date' | 'company' | 'position' = 'date'): ExperienceType[] => {
    const sorted = [...experiences];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => {
          const aStart = experienceUtils.parsePeriod(a.period).start;
          const bStart = experienceUtils.parsePeriod(b.period).start;
          if (!aStart || !bStart) return 0;
          return bStart.getTime() - aStart.getTime();
        });
      case 'company':
        return sorted.sort((a, b) => a.company.localeCompare(b.company));
      case 'position':
        return sorted.sort((a, b) => a.position.localeCompare(b.position));
      default:
        return sorted;
    }
  },

  /**
   * Вычисляет статистику опыта
   */
  calculateStats: (experiences: ExperienceType[]): ExperienceStats => {
    const companies = new Set<string>();
    const technologies = new Set<string>();
    let totalMonths = 0;

    experiences.forEach(exp => {
      companies.add(exp.company);
      exp.technologies?.forEach(tech => technologies.add(tech));
      totalMonths += experienceUtils.calculateDuration(exp.period);
    });

    return {
      total: experiences.length,
      totalYears: Math.round((totalMonths / MONTHS_IN_YEAR) * 10) / 10,
      companies: Array.from(companies),
      technologies,
      averageDuration: experiences.length > 0 ? totalMonths / experiences.length : 0,
    };
  },

  /**
   * Создает timeline элементы
   */
  createTimeline: (experiences: ExperienceType[]): TimelineItem[] => {
    return experiences.map((exp, index) => {
      const { start, end } = experienceUtils.parsePeriod(exp.period);
      const duration = experienceUtils.calculateDuration(exp.period);
      
      return {
        id: `exp-${index}`,
        experience: exp,
        index,
        startDate: start,
        endDate: end,
        duration,
      };
    });
  },
};

// Хуки
const useExperienceFilter = (initialExperiences: ExperienceType[]) => {
  const [filter, setFilter] = useState<Partial<ExperienceFilter>>({});
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'position'>('date');

  const filteredAndSorted = useMemo(() => {
    let result = experienceUtils.filterExperience(initialExperiences, filter);
    result = experienceUtils.sortExperience(result, sortBy);
    return result;
  }, [initialExperiences, filter, sortBy]);

  const updateFilter = useCallback((updates: Partial<ExperienceFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({});
    setSortBy('date');
  }, []);

  return { filter, sortBy, filteredAndSorted, updateFilter, setSortBy, resetFilter };
};

const useExperienceAnimation = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  const showItem = useCallback((index: number) => {
    setVisibleItems(prev => new Set(prev).add(index));
  }, []);

  const showAllItems = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => showItem(i), i * ANIMATION_DELAY);
    }
  }, [showItem]);

  return { visibleItems, showItem, showAllItems };
};

// Компоненты
const ExperienceCard: React.FC<{
  experience: ExperienceType;
  index: number;
  isVisible: boolean;
  onClick?: (experience: ExperienceType) => void;
}> = ({ experience, index, isVisible, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTechnologies, setShowTechnologies] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const duration = useMemo(() => experienceUtils.calculateDuration(experience.period), [experience.period]);
  const formattedDuration = useMemo(() => experienceUtils.formatDuration(duration), [duration]);
  const { start, end, isCurrent } = useMemo(() => experienceUtils.parsePeriod(experience.period), [experience.period]);

  const handleClick = useCallback(() => {
    onClick?.(experience);
    setIsExpanded(prev => !prev);
  }, [experience, onClick]);

  return (
    <motion.div
      className="experience-card"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="experience-header">
        <div className="experience-title-section">
          <h3 className="experience-position">{experience.position}</h3>
          {isCurrent && (
            <span className="experience-current-badge" title="Текущее место работы">
              Текущее
            </span>
          )}
        </div>
        <div className="experience-meta">
          <span className="experience-period">{experience.period}</span>
          <span className="experience-duration">{formattedDuration}</span>
        </div>
      </div>

      <div className="experience-company-section">
        <p className="experience-company">{experience.company}</p>
        {start && end && (
          <div className="experience-dates">
            <span>{start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
            <span>→</span>
            <span>{isCurrent ? 'Настоящее время' : end.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      <div className="experience-description-section">
        <h4 className="experience-section-title">Обязанности:</h4>
        <ul className="experience-description">
          {experience.description.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + i * 0.05 }}
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      {experience.technologies && experience.technologies.length > 0 && (
        <div className="experience-technologies-section">
          <button
            className="experience-toggle-button"
            onClick={() => setShowTechnologies(prev => !prev)}
          >
            <span>Технологии ({experience.technologies.length})</span>
            <span>{showTechnologies ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {showTechnologies && (
              <motion.div
                className="experience-technologies"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="technologies-list">
                  {experience.technologies.map((tech, i) => (
                    <span key={i} className="technology-badge">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {experience.achievements && experience.achievements.length > 0 && (
        <div className="experience-achievements-section">
          <button
            className="experience-toggle-button"
            onClick={() => setShowAchievements(prev => !prev)}
          >
            <span>Достижения ({experience.achievements.length})</span>
            <span>{showAchievements ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {showAchievements && (
              <motion.ul
                className="experience-achievements"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {experience.achievements.map((achievement, i) => (
                  <li key={i} className="achievement-item">
                    <span className="achievement-icon">🏆</span>
                    {achievement}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      <button
        className="experience-expand-button"
        onClick={handleClick}
        aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
      >
        {isExpanded ? 'Свернуть детали' : 'Подробнее'}
      </button>
    </motion.div>
  );
};

const ExperienceFilter: React.FC<{
  filter: Partial<ExperienceFilter>;
  onFilterChange: (updates: Partial<ExperienceFilter>) => void;
  onReset: () => void;
  companies: string[];
  technologies: string[];
  sortBy: 'date' | 'company' | 'position';
  onSortChange: (sort: 'date' | 'company' | 'position') => void;
}> = ({ filter, onFilterChange, onReset, companies, technologies, sortBy, onSortChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="experience-filter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="filter-header">
        <h3>Фильтры и сортировка</h3>
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(prev => !prev)}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="filter-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="filter-group">
              <label>Компания</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Поиск по компании..."
                value={filter.company || ''}
                onChange={(e) => onFilterChange({ company: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Должность</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Поиск по должности..."
                value={filter.position || ''}
                onChange={(e) => onFilterChange({ position: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Сортировка</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as 'date' | 'company' | 'position')}
              >
                <option value="date">По дате (новые первые)</option>
                <option value="company">По компании</option>
                <option value="position">По должности</option>
              </select>
            </div>

            <button className="filter-reset" onClick={onReset}>
              Сбросить фильтры
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ExperienceStats: React.FC<{ stats: ExperienceStats }> = ({ stats }) => {
  return (
    <motion.div
      className="experience-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h3>Статистика опыта</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Мест работы</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.totalYears}</span>
          <span className="stat-label">Лет опыта</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.companies.length}</span>
          <span className="stat-label">Компаний</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.technologies.size}</span>
          <span className="stat-label">Технологий</span>
        </div>
      </div>

      {stats.companies.length > 0 && (
        <div className="companies-list">
          <h4>Компании:</h4>
          <div className="companies-tags">
            {stats.companies.map(company => (
              <span key={company} className="company-tag">
                {company}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ExperienceTimeline: React.FC<{ timeline: TimelineItem[] }> = ({ timeline }) => {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div className="experience-timeline-section">
      <button
        className="timeline-toggle"
        onClick={() => setShowTimeline(prev => !prev)}
      >
        <span>Показать timeline</span>
        <span>{showTimeline ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {showTimeline && (
          <motion.div
            className="experience-timeline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {timeline.map((item, index) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-date">
                    {item.startDate?.getFullYear()} - {item.endDate?.getFullYear() || 'н.в.'}
                  </div>
                  <div className="timeline-info">
                    <strong>{item.experience.position}</strong> в {item.experience.company}
                  </div>
                  <div className="timeline-duration">
                    {experienceUtils.formatDuration(item.duration)}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Основной компонент
export const Experience: React.FC<ExperienceSectionProps> = ({ onExperienceClick }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { filter, sortBy, filteredAndSorted, updateFilter, setSortBy, resetFilter } = useExperienceFilter(resumeData.experience);
  const { visibleItems, showAllItems } = useExperienceAnimation();

  const stats = useMemo(() => experienceUtils.calculateStats(resumeData.experience), []);
  const timeline = useMemo(() => experienceUtils.createTimeline(filteredAndSorted), [filteredAndSorted]);
  
  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();
    resumeData.experience.forEach(exp => {
      exp.technologies?.forEach(tech => techs.add(tech));
    });
    return Array.from(techs);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTyping(false);
      setShowContent(true);
      showAllItems(filteredAndSorted.length);
    }, TYPING_DELAY);

    return () => clearTimeout(timer);
  }, [filteredAndSorted.length, showAllItems]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleExperienceClick = useCallback((experience: ExperienceType) => {
    onExperienceClick?.(experience);
  }, [onExperienceClick]);

  return (
    <div ref={containerRef} className="experience-container">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {filteredAndSorted.map((exp, index) => (
              <Message key={`exp-${index}`} delay={0.2 + index * 0.1}>
                <div className="message-avatar">
                  {resumeData.avatar ? (
                    <img src={resumeData.avatar} alt={resumeData.name} />
                  ) : (
                    <span>{getInitials(resumeData.name)}</span>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-author">{resumeData.name}</span>
                    <span className="message-timestamp">сейчас</span>
                  </div>
                  <div className="message-text">
                    {index === 0 && (
                      <>
                        <p>Мой опыт работы:</p>
                        <ExperienceFilter
                          filter={filter}
                          onFilterChange={updateFilter}
                          onReset={resetFilter}
                          companies={stats.companies}
                          technologies={allTechnologies}
                          sortBy={sortBy}
                          onSortChange={setSortBy}
                        />
                        <ExperienceStats stats={stats} />
                        <ExperienceTimeline timeline={timeline} />
                      </>
                    )}
                    <ExperienceCard
                      experience={exp}
                      index={index}
                      isVisible={visibleItems.has(index) || !showTyping}
                      onClick={handleExperienceClick}
                    />
                  </div>
                </div>
              </Message>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Экспорт утилит
export { experienceUtils };

// Экспорт типов
export type { ExperienceSectionProps, ExperienceFilter, ExperienceStats, TimelineItem };
