import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData, Education as EducationType } from '../../data/resume';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../components/Message/Message.css';
import './Education.css';

/**
 * Education Component
 * 
 * Расширенный компонент для отображения образования с детальной информацией,
 * курсами, достижениями и интерактивными элементами.
 * 
 * @component
 * @returns {JSX.Element} Компонент секции "Образование"
 */

// Типы и интерфейсы
interface EducationSectionProps {
  onEducationClick?: (education: EducationType) => void;
}

interface EducationStats {
  total: number;
  totalYears: number;
  institutions: string[];
  degrees: string[];
  averageDuration: number;
}

interface TimelineEducation {
  id: string;
  education: EducationType;
  index: number;
  startDate: Date | null;
  endDate: Date | null;
  duration: number;
}

// Константы
const TYPING_DELAY = 1500;
const ANIMATION_DELAY = 100;
const MONTHS_IN_YEAR = 12;

// Утилиты для работы с образованием
const educationUtils = {
  /**
   * Парсит период обучения в даты
   */
  parsePeriod: (period: string): { start: Date | null; end: Date | null } => {
    const parts = period.split('-').map(p => p.trim());
    
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (parts[0]) {
      const startYear = parseInt(parts[0]);
      if (!isNaN(startYear)) {
        startDate = new Date(startYear, 0, 1);
      }
    }

    if (parts[1]) {
      const endYear = parseInt(parts[1]);
      if (!isNaN(endYear)) {
        endDate = new Date(endYear, 11, 31);
      }
    }

    return { start: startDate, end: endDate };
  },

  /**
   * Вычисляет длительность обучения в месяцах
   */
  calculateDuration: (period: string): number => {
    const { start, end } = educationUtils.parsePeriod(period);
    if (!start || !end) return 0;

    const months = (end.getFullYear() - start.getFullYear()) * MONTHS_IN_YEAR +
                   (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  },

  /**
   * Форматирует длительность обучения
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
   * Вычисляет статистику образования
   */
  calculateStats: (education: EducationType[]): EducationStats => {
    const institutions = new Set<string>();
    const degrees = new Set<string>();
    let totalMonths = 0;

    education.forEach(edu => {
      institutions.add(edu.institution);
      degrees.add(edu.degree);
      totalMonths += educationUtils.calculateDuration(edu.period);
    });

    return {
      total: education.length,
      totalYears: Math.round((totalMonths / MONTHS_IN_YEAR) * 10) / 10,
      institutions: Array.from(institutions),
      degrees: Array.from(degrees),
      averageDuration: education.length > 0 ? totalMonths / education.length : 0,
    };
  },

  /**
   * Создает timeline элементы
   */
  createTimeline: (education: EducationType[]): TimelineEducation[] => {
    return education.map((edu, index) => {
      const { start, end } = educationUtils.parsePeriod(edu.period);
      const duration = educationUtils.calculateDuration(edu.period);
      
      return {
        id: `edu-${index}`,
        education: edu,
        index,
        startDate: start,
        endDate: end,
        duration,
      };
    });
  },

  /**
   * Получает иконку для типа образования
   */
  getEducationIcon: (degree: string): string => {
    if (degree.toLowerCase().includes('бакалавр') || degree.toLowerCase().includes('bachelor')) {
      return '🎓';
    }
    if (degree.toLowerCase().includes('магистр') || degree.toLowerCase().includes('master')) {
      return '🎖️';
    }
    if (degree.toLowerCase().includes('доктор') || degree.toLowerCase().includes('phd') || degree.toLowerCase().includes('doctor')) {
      return '👨‍🎓';
    }
    return '📚';
  },
};

// Хуки
const useEducationAnimation = () => {
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
const EducationCard: React.FC<{
  education: EducationType;
  index: number;
  isVisible: boolean;
  onClick?: (education: EducationType) => void;
}> = ({ education, index, isVisible, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  const duration = useMemo(() => educationUtils.calculateDuration(education.period), [education.period]);
  const formattedDuration = useMemo(() => educationUtils.formatDuration(duration), [duration]);
  const { start, end } = useMemo(() => educationUtils.parsePeriod(education.period), [education.period]);
  const icon = useMemo(() => educationUtils.getEducationIcon(education.degree), [education.degree]);

  const handleClick = useCallback(() => {
    onClick?.(education);
    setIsExpanded(prev => !prev);
  }, [education, onClick]);

  return (
    <motion.div
      className="education-card"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="education-header">
        <div className="education-title-section">
          <span className="education-icon">{icon}</span>
          <h3 className="education-degree">{education.degree}</h3>
        </div>
        <div className="education-meta">
          <span className="education-period">{education.period}</span>
          <span className="education-duration">{formattedDuration}</span>
        </div>
      </div>

      <div className="education-institution-section">
        <p className="education-institution">{education.institution}</p>
        {start && end && (
          <div className="education-dates">
            <span>{start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
            <span>→</span>
            <span>{end.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {education.description && (
        <div className="education-description-section">
          <p className="education-description">{education.description}</p>
        </div>
      )}

      {education.courses && education.courses.length > 0 && (
        <div className="education-courses-section">
          <button
            className="education-toggle-button"
            onClick={() => setShowCourses(prev => !prev)}
          >
            <span>Курсы ({education.courses.length})</span>
            <span>{showCourses ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {showCourses && (
              <motion.ul
                className="education-courses"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {education.courses.map((course, i) => (
                  <li key={i} className="course-item">
                    <span className="course-icon">📖</span>
                    {course}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {education.achievements && education.achievements.length > 0 && (
        <div className="education-achievements-section">
          <button
            className="education-toggle-button"
            onClick={() => setShowAchievements(prev => !prev)}
          >
            <span>Достижения ({education.achievements.length})</span>
            <span>{showAchievements ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {showAchievements && (
              <motion.ul
                className="education-achievements"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {education.achievements.map((achievement, i) => (
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
        className="education-expand-button"
        onClick={handleClick}
        aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
      >
        {isExpanded ? 'Свернуть детали' : 'Подробнее'}
      </button>
    </motion.div>
  );
};

const EducationStats: React.FC<{ stats: EducationStats }> = ({ stats }) => {
  return (
    <motion.div
      className="education-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h3>Статистика образования</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Учебных заведений</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.totalYears}</span>
          <span className="stat-label">Лет обучения</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.degrees.length}</span>
          <span className="stat-label">Степеней</span>
        </div>
      </div>

      {stats.institutions.length > 0 && (
        <div className="institutions-list">
          <h4>Учебные заведения:</h4>
          <div className="institutions-tags">
            {stats.institutions.map(institution => (
              <span key={institution} className="institution-tag">
                {institution}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const EducationTimeline: React.FC<{ timeline: TimelineEducation[] }> = ({ timeline }) => {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div className="education-timeline-section">
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
            className="education-timeline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {timeline.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-date">
                    {item.startDate?.getFullYear()} - {item.endDate?.getFullYear()}
                  </div>
                  <div className="timeline-info">
                    <strong>{item.education.degree}</strong> в {item.education.institution}
                  </div>
                  <div className="timeline-duration">
                    {educationUtils.formatDuration(item.duration)}
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
export const Education: React.FC<EducationSectionProps> = ({ onEducationClick }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { visibleItems, showAllItems } = useEducationAnimation();
  const {
    filteredEducation,
    searchQuery,
    setSearchQuery,
    selectedInstitution,
    setSelectedInstitution,
    selectedDegreeType,
    setSelectedDegreeType,
    institutions,
    degreeTypes,
  } = useEducationFilter(resumeData.education);
  const { exportToJSON, exportToCSV } = useEducationExport();

  const stats = useMemo(() => educationUtils.calculateStats(filteredEducation), [filteredEducation]);
  const timeline = useMemo(() => educationUtils.createTimeline(filteredEducation), [filteredEducation]);
  const summary = useMemo(() => educationAdvancedUtils.createSummary(resumeData.education), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTyping(false);
      setShowContent(true);
      showAllItems(filteredEducation.length);
    }, TYPING_DELAY);

    return () => clearTimeout(timer);
  }, [filteredEducation.length, showAllItems]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleEducationClick = useCallback((education: EducationType) => {
    onEducationClick?.(education);
  }, [onEducationClick]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedInstitution(null);
    setSelectedDegreeType(null);
  }, [setSearchQuery, setSelectedInstitution, setSelectedDegreeType]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredEducation);
  }, [filteredEducation, exportToJSON]);

  const handleExportCSV = useCallback(() => {
    exportToCSV(filteredEducation);
  }, [filteredEducation, exportToCSV]);

  return (
    <div ref={containerRef} className="education-container">
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
            {filteredEducation.map((edu, index) => (
              <Message key={`edu-${index}`} delay={0.2 + index * 0.1}>
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
                        <p>Мое образование:</p>
                        <p className="education-summary">{summary}</p>
                        <EducationFilterPanel
                          searchQuery={searchQuery}
                          onSearchChange={setSearchQuery}
                          institutions={institutions}
                          selectedInstitution={selectedInstitution}
                          onInstitutionChange={setSelectedInstitution}
                          degreeTypes={degreeTypes}
                          selectedDegreeType={selectedDegreeType}
                          onDegreeTypeChange={setSelectedDegreeType}
                          onReset={handleResetFilters}
                        />
                        <EducationExportPanel
                          onExportJSON={handleExportJSON}
                          onExportCSV={handleExportCSV}
                        />
                        <EducationKeywordsPanel education={filteredEducation} />
                        <EducationStats stats={stats} />
                        <EducationTimeline timeline={timeline} />
                      </>
                    )}
                    <EducationCard
                      education={edu}
                      index={index}
                      isVisible={visibleItems.has(index) || !showTyping}
                      onClick={handleEducationClick}
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

// Дополнительные утилиты для расширенной функциональности
const educationAdvancedUtils = {
  /**
   * Валидирует данные образования
   */
  validateEducation: (education: EducationType): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!education.institution || education.institution.trim().length === 0) {
      errors.push('Название учебного заведения обязательно');
    }
    
    if (!education.degree || education.degree.trim().length === 0) {
      errors.push('Степень образования обязательна');
    }
    
    if (!education.period || education.period.trim().length === 0) {
      errors.push('Период обучения обязателен');
    }
    
    const { start, end } = educationUtils.parsePeriod(education.period);
    if (start && end && start > end) {
      errors.push('Дата начала не может быть позже даты окончания');
    }
    
    return { valid: errors.length === 0, errors };
  },

  /**
   * Форматирует степень образования
   */
  formatDegree: (degree: string): { level: string; field: string } => {
    const lowerDegree = degree.toLowerCase();
    let level = '';
    let field = '';
    
    if (lowerDegree.includes('бакалавр') || lowerDegree.includes('bachelor')) {
      level = 'Бакалавр';
    } else if (lowerDegree.includes('магистр') || lowerDegree.includes('master')) {
      level = 'Магистр';
    } else if (lowerDegree.includes('доктор') || lowerDegree.includes('phd') || lowerDegree.includes('doctor')) {
      level = 'Доктор';
    } else if (lowerDegree.includes('специалист') || lowerDegree.includes('specialist')) {
      level = 'Специалист';
    }
    
    // Извлекаем область знаний
    const fieldMatch = degree.match(/,\s*(.+)$/);
    if (fieldMatch) {
      field = fieldMatch[1];
    } else {
      field = degree.replace(level, '').trim();
    }
    
    return { level, field };
  },

  /**
   * Группирует образование по типам степеней
   */
  groupByDegreeType: (education: EducationType[]): Record<string, EducationType[]> => {
    const groups: Record<string, EducationType[]> = {};
    
    education.forEach(edu => {
      const { level } = educationAdvancedUtils.formatDegree(edu.degree);
      const key = level || 'Другое';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(edu);
    });
    
    return groups;
  },

  /**
   * Сортирует образование по дате начала
   */
  sortByDate: (education: EducationType[], ascending: boolean = false): EducationType[] => {
    const sorted = [...education];
    return sorted.sort((a, b) => {
      const aStart = educationUtils.parsePeriod(a.period).start;
      const bStart = educationUtils.parsePeriod(b.period).start;
      
      if (!aStart || !bStart) return 0;
      
      const comparison = aStart.getTime() - bStart.getTime();
      return ascending ? comparison : -comparison;
    });
  },

  /**
   * Вычисляет общий стаж обучения
   */
  calculateTotalEducationYears: (education: EducationType[]): number => {
    const periods = new Set<string>();
    let totalMonths = 0;
    
    education.forEach(edu => {
      const { start, end } = educationUtils.parsePeriod(edu.period);
      if (start && end) {
        const periodKey = `${start.getTime()}-${end.getTime()}`;
        if (!periods.has(periodKey)) {
          periods.add(periodKey);
          totalMonths += educationUtils.calculateDuration(edu.period);
        }
      }
    });
    
    return Math.round((totalMonths / MONTHS_IN_YEAR) * 10) / 10;
  },

  /**
   * Находит пересекающиеся периоды обучения
   */
  findOverlappingPeriods: (education: EducationType[]): Array<{ edu1: EducationType; edu2: EducationType }> => {
    const overlaps: Array<{ edu1: EducationType; edu2: EducationType }> = [];
    
    for (let i = 0; i < education.length; i++) {
      for (let j = i + 1; j < education.length; j++) {
        const edu1 = education[i];
        const edu2 = education[j];
        const period1 = educationUtils.parsePeriod(edu1.period);
        const period2 = educationUtils.parsePeriod(edu2.period);
        
        if (period1.start && period1.end && period2.start && period2.end) {
          const overlap = period1.start <= period2.end && period2.start <= period1.end;
          if (overlap) {
            overlaps.push({ edu1, edu2 });
          }
        }
      }
    }
    
    return overlaps;
  },

  /**
   * Форматирует список курсов для отображения
   */
  formatCoursesList: (courses: string[]): string => {
    if (courses.length === 0) return '';
    if (courses.length === 1) return courses[0];
    if (courses.length === 2) return `${courses[0]} и ${courses[1]}`;
    return `${courses.slice(0, -1).join(', ')}, и ${courses[courses.length - 1]}`;
  },

  /**
   * Извлекает ключевые слова из описания образования
   */
  extractKeywords: (education: EducationType): string[] => {
    const keywords: string[] = [];
    const text = `${education.degree} ${education.institution} ${education.description || ''}`.toLowerCase();
    
    const commonKeywords = [
      'программирование', 'разработка', 'веб', 'frontend', 'backend',
      'алгоритмы', 'базы данных', 'сети', 'безопасность', 'машинное обучение',
      'искусственный интеллект', 'компьютерные науки', 'информатика',
      'программная инженерия', 'тестирование', 'devops', 'cloud'
    ];
    
    commonKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  },

  /**
   * Создает краткое резюме образования
   */
  createSummary: (education: EducationType[]): string => {
    if (education.length === 0) return 'Нет данных об образовании';
    
    const totalYears = educationAdvancedUtils.calculateTotalEducationYears(education);
    const degrees = new Set(education.map(edu => educationAdvancedUtils.formatDegree(edu.degree).level));
    const institutions = new Set(education.map(edu => edu.institution));
    
    const parts: string[] = [];
    
    if (degrees.size > 0) {
      parts.push(`Образование: ${Array.from(degrees).join(', ')}`);
    }
    
    if (totalYears > 0) {
      parts.push(`Общий стаж обучения: ${totalYears} ${totalYears === 1 ? 'год' : totalYears < 5 ? 'года' : 'лет'}`);
    }
    
    if (institutions.size > 0) {
      parts.push(`Учебные заведения: ${institutions.size}`);
    }
    
    return parts.join('. ') + '.';
  },
};

// Дополнительные хуки для расширенной функциональности
const useEducationFilter = (education: EducationType[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [selectedDegreeType, setSelectedDegreeType] = useState<string | null>(null);
  
  const filteredEducation = useMemo(() => {
    let result = [...education];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(edu =>
        edu.institution.toLowerCase().includes(query) ||
        edu.degree.toLowerCase().includes(query) ||
        edu.description?.toLowerCase().includes(query) ||
        edu.courses?.some(course => course.toLowerCase().includes(query))
      );
    }
    
    if (selectedInstitution) {
      result = result.filter(edu => edu.institution === selectedInstitution);
    }
    
    if (selectedDegreeType) {
      result = result.filter(edu => {
        const { level } = educationAdvancedUtils.formatDegree(edu.degree);
        return level === selectedDegreeType;
      });
    }
    
    return result;
  }, [education, searchQuery, selectedInstitution, selectedDegreeType]);
  
  const institutions = useMemo(() => {
    return Array.from(new Set(education.map(edu => edu.institution)));
  }, [education]);
  
  const degreeTypes = useMemo(() => {
    const types = new Set<string>();
    education.forEach(edu => {
      const { level } = educationAdvancedUtils.formatDegree(edu.degree);
      if (level) types.add(level);
    });
    return Array.from(types);
  }, [education]);
  
  return {
    filteredEducation,
    searchQuery,
    setSearchQuery,
    selectedInstitution,
    setSelectedInstitution,
    selectedDegreeType,
    setSelectedDegreeType,
    institutions,
    degreeTypes,
  };
};

const useEducationExport = () => {
  const exportToJSON = useCallback((education: EducationType[]) => {
    const dataStr = JSON.stringify(education, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'education.json';
    link.click();
    URL.revokeObjectURL(url);
  }, []);
  
  const exportToCSV = useCallback((education: EducationType[]) => {
    const headers = ['Учебное заведение', 'Степень', 'Период', 'Описание'];
    const rows = education.map(edu => [
      edu.institution,
      edu.degree,
      edu.period,
      edu.description || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'education.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, []);
  
  return { exportToJSON, exportToCSV };
};

// Дополнительные компоненты для расширенной функциональности
const EducationFilterPanel: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  institutions: string[];
  selectedInstitution: string | null;
  onInstitutionChange: (institution: string | null) => void;
  degreeTypes: string[];
  selectedDegreeType: string | null;
  onDegreeTypeChange: (type: string | null) => void;
  onReset: () => void;
}> = ({
  searchQuery,
  onSearchChange,
  institutions,
  selectedInstitution,
  onInstitutionChange,
  degreeTypes,
  selectedDegreeType,
  onDegreeTypeChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      className="education-filter-panel"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <button
        className="filter-panel-toggle"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span>Фильтры и поиск</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="filter-panel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="filter-group">
              <label>Поиск</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Поиск по учебному заведению, степени, описанию..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Учебное заведение</label>
              <select
                className="filter-select"
                value={selectedInstitution || ''}
                onChange={(e) => onInstitutionChange(e.target.value || null)}
              >
                <option value="">Все заведения</option>
                {institutions.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Тип степени</label>
              <select
                className="filter-select"
                value={selectedDegreeType || ''}
                onChange={(e) => onDegreeTypeChange(e.target.value || null)}
              >
                <option value="">Все типы</option>
                {degreeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <button className="filter-reset-button" onClick={onReset}>
              Сбросить фильтры
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EducationExportPanel: React.FC<{
  onExportJSON: () => void;
  onExportCSV: () => void;
}> = ({ onExportJSON, onExportCSV }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      className="education-export-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <button
        className="export-panel-toggle"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span>Экспорт данных</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="export-panel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button className="export-button" onClick={onExportJSON}>
              Экспорт в JSON
            </button>
            <button className="export-button" onClick={onExportCSV}>
              Экспорт в CSV
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EducationKeywordsPanel: React.FC<{
  education: EducationType[];
}> = ({ education }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const allKeywords = useMemo(() => {
    const keywordsSet = new Set<string>();
    education.forEach(edu => {
      const keywords = educationAdvancedUtils.extractKeywords(edu);
      keywords.forEach(kw => keywordsSet.add(kw));
    });
    return Array.from(keywordsSet);
  }, [education]);
  
  if (allKeywords.length === 0) return null;
  
  return (
    <motion.div
      className="education-keywords-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <button
        className="keywords-panel-toggle"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <span>Ключевые слова ({allKeywords.length})</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="keywords-panel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="keywords-list">
              {allKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Обновляем основной компонент для использования новых функций
// Экспорт утилит
export { educationUtils, educationAdvancedUtils };

// Экспорт типов
export type { EducationSectionProps, EducationStats, TimelineEducation };
