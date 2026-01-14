import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData, Skill } from '../../data/resume';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../components/Message/Message.css';
import './Skills.css';

/**
 * Skills Component
 * 
 * Расширенный компонент для отображения навыков с фильтрацией,
 * сортировкой, поиском и интерактивными элементами.
 * 
 * @component
 * @returns {JSX.Element} Компонент секции "Навыки"
 */

// Типы и интерфейсы
interface SkillsSectionProps {
  onSkillClick?: (skill: Skill) => void;
}

interface SkillFilter {
  category: string | 'all';
  minLevel: number;
  maxLevel: number;
  searchQuery: string;
}

interface SkillStats {
  total: number;
  byCategory: Record<string, number>;
  averageLevel: number;
  topSkills: Skill[];
}

interface SkillGroup {
  category: string;
  skills: Skill[];
  averageLevel: number;
}

// Константы
const TYPING_DELAY = 1500;
const ANIMATION_DELAY = 50;
const CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Инструменты',
  languages: 'Языки программирования',
  other: 'Прочее',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Начальный',
  2: 'Базовый',
  3: 'Средний',
  4: 'Продвинутый',
  5: 'Эксперт',
};

// Утилиты для работы с навыками
const skillUtils = {
  /**
   * Группирует навыки по категориям
   */
  groupByCategory: (skills: Skill[]): SkillGroup[] => {
    const groups: Record<string, Skill[]> = {};
    
    skills.forEach(skill => {
      const category = skill.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
    });

    return Object.entries(groups).map(([category, categorySkills]) => ({
      category,
      skills: categorySkills,
      averageLevel: categorySkills.reduce((sum, s) => sum + s.level, 0) / categorySkills.length,
    })).sort((a, b) => b.averageLevel - a.averageLevel);
  },

  /**
   * Фильтрует навыки по критериям
   */
  filterSkills: (skills: Skill[], filter: SkillFilter): Skill[] => {
    return skills.filter(skill => {
      // Фильтр по категории
      if (filter.category !== 'all' && skill.category !== filter.category) {
        return false;
      }

      // Фильтр по уровню
      if (skill.level < filter.minLevel || skill.level > filter.maxLevel) {
        return false;
      }

      // Поиск по названию
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const nameMatch = skill.name.toLowerCase().includes(query);
        const descMatch = skill.description?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Сортирует навыки
   */
  sortSkills: (skills: Skill[], sortBy: 'level' | 'name' | 'category' = 'level'): Skill[] => {
    const sorted = [...skills];
    
    switch (sortBy) {
      case 'level':
        return sorted.sort((a, b) => b.level - a.level);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'category':
        return sorted.sort((a, b) => {
          const catA = a.category || 'other';
          const catB = b.category || 'other';
          if (catA !== catB) {
            return catA.localeCompare(catB);
          }
          return b.level - a.level;
        });
      default:
        return sorted;
    }
  },

  /**
   * Вычисляет статистику навыков
   */
  calculateStats: (skills: Skill[]): SkillStats => {
    const byCategory: Record<string, number> = {};
    let totalLevel = 0;

    skills.forEach(skill => {
      const category = skill.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;
      totalLevel += skill.level;
    });

    const averageLevel = skills.length > 0 ? totalLevel / skills.length : 0;
    const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 5);

    return {
      total: skills.length,
      byCategory,
      averageLevel: Math.round(averageLevel * 10) / 10,
      topSkills,
    };
  },

  /**
   * Получает цвет для уровня навыка
   */
  getLevelColor: (level: number): string => {
    const colors = [
      '#e74c3c', // 1 - красный
      '#f39c12', // 2 - оранжевый
      '#f1c40f', // 3 - желтый
      '#2ecc71', // 4 - зеленый
      '#27ae60', // 5 - темно-зеленый
    ];
    return colors[Math.min(level - 1, 4)] || colors[0];
  },

  /**
   * Получает иконку для категории
   */
  getCategoryIcon: (category: string): string => {
    const icons: Record<string, string> = {
      frontend: '🎨',
      backend: '⚙️',
      tools: '🔧',
      languages: '💻',
      other: '📦',
    };
    return icons[category] || icons.other;
  },
};

// Хуки
const useSkillsFilter = (initialSkills: Skill[]) => {
  const [filter, setFilter] = useState<SkillFilter>({
    category: 'all',
    minLevel: 1,
    maxLevel: 5,
    searchQuery: '',
  });

  const filteredSkills = useMemo(() => {
    let result = skillUtils.filterSkills(initialSkills, filter);
    result = skillUtils.sortSkills(result, 'level');
    return result;
  }, [initialSkills, filter]);

  const updateFilter = useCallback((updates: Partial<SkillFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({
      category: 'all',
      minLevel: 1,
      maxLevel: 5,
      searchQuery: '',
    });
  }, []);

  return { filter, filteredSkills, updateFilter, resetFilter };
};

const useSkillsAnimation = () => {
  const [visibleSkills, setVisibleSkills] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(true);

  const showSkill = useCallback((index: number) => {
    setVisibleSkills(prev => new Set(prev).add(index));
  }, []);

  const showAllSkills = useCallback((count: number) => {
    const timer = setTimeout(() => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => showSkill(i), i * ANIMATION_DELAY);
      }
      setIsAnimating(false);
    }, TYPING_DELAY);

    return () => clearTimeout(timer);
  }, [showSkill]);

  return { visibleSkills, isAnimating, showSkill, showAllSkills };
};

// Компоненты
const SkillItem: React.FC<{
  skill: Skill;
  index: number;
  isVisible: boolean;
  onClick?: (skill: Skill) => void;
}> = ({ skill, index, isVisible, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const levelColor = useMemo(() => skillUtils.getLevelColor(skill.level), [skill.level]);
  const levelLabel = useMemo(() => LEVEL_LABELS[skill.level] || 'Неизвестно', [skill.level]);

  const handleClick = useCallback(() => {
    onClick?.(skill);
    setShowDescription(prev => !prev);
  }, [skill, onClick]);

  return (
    <motion.div
      className="skill-item"
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="skill-header">
        <div className="skill-name-wrapper">
          <span className="skill-name">{skill.name}</span>
          {skill.category && (
            <span className="skill-category-badge">
              {skillUtils.getCategoryIcon(skill.category)} {CATEGORY_LABELS[skill.category] || skill.category}
            </span>
          )}
        </div>
        <div className="skill-level-info">
          <span className="skill-level-label" title={levelLabel}>
            {levelLabel}
          </span>
          <span className="skill-level">{skill.level}/5</span>
        </div>
      </div>

      <div className="skill-bar-container">
        <div className="skill-bar">
          <motion.div
            className="skill-bar-fill"
            initial={{ width: 0 }}
            animate={isVisible ? { width: `${(skill.level / 5) * 100}%` } : { width: 0 }}
            transition={{ delay: index * 0.05 + 0.2, duration: 0.5, ease: "easeOut" }}
            style={{
              background: isHovered
                ? `linear-gradient(90deg, ${levelColor}, ${levelColor}dd)`
                : `linear-gradient(90deg, var(--discord-accent), var(--discord-accent-hover))`,
            }}
          />
        </div>
        <div className="skill-level-markers">
          {[1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className={`skill-marker ${skill.level >= level ? 'active' : ''}`}
              style={{ '--marker-color': levelColor } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {skill.description && (
        <motion.div
          className="skill-description"
          initial={{ height: 0, opacity: 0 }}
          animate={showDescription ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p>{skill.description}</p>
        </motion.div>
      )}

      <button
        className="skill-toggle-button"
        onClick={handleClick}
        aria-label={showDescription ? 'Скрыть описание' : 'Показать описание'}
      >
        {showDescription ? '▲' : '▼'}
      </button>
    </motion.div>
  );
};

const SkillsFilter: React.FC<{
  filter: SkillFilter;
  onFilterChange: (updates: Partial<SkillFilter>) => void;
  onReset: () => void;
  categories: string[];
  stats: SkillStats;
}> = ({ filter, onFilterChange, onReset, categories, stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="skills-filter"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="filter-header">
        <h3>Фильтры</h3>
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-label={isExpanded ? 'Свернуть фильтры' : 'Развернуть фильтры'}
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
            transition={{ duration: 0.2 }}
          >
            <div className="filter-group">
              <label>Поиск</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Поиск навыков..."
                value={filter.searchQuery}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Категория</label>
              <select
                className="filter-select"
                value={filter.category}
                onChange={(e) => onFilterChange({ category: e.target.value })}
              >
                <option value="all">Все категории</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Уровень: {filter.minLevel} - {filter.maxLevel}</label>
              <div className="filter-range">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={filter.minLevel}
                  onChange={(e) => onFilterChange({ minLevel: parseInt(e.target.value) })}
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={filter.maxLevel}
                  onChange={(e) => onFilterChange({ maxLevel: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <button className="filter-reset" onClick={onReset}>
              Сбросить фильтры
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="filter-stats">
        <span>Найдено: {stats.total}</span>
        <span>Средний уровень: {stats.averageLevel}</span>
      </div>
    </motion.div>
  );
};

const SkillsStats: React.FC<{ stats: SkillStats }> = ({ stats }) => {
  return (
    <motion.div
      className="skills-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <h3>Статистика навыков</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Всего навыков</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.averageLevel}</span>
          <span className="stat-label">Средний уровень</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.topSkills.length}</span>
          <span className="stat-label">Топ навыков</span>
        </div>
      </div>

      {Object.keys(stats.byCategory).length > 0 && (
        <div className="category-stats">
          <h4>По категориям:</h4>
          <div className="category-list">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="category-stat-item">
                <span>{skillUtils.getCategoryIcon(category)}</span>
                <span>{CATEGORY_LABELS[category] || category}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const SkillsGroup: React.FC<{
  group: SkillGroup;
  skills: Skill[];
  onSkillClick?: (skill: Skill) => void;
  startIndex: number;
}> = ({ group, skills, onSkillClick, startIndex }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const groupSkills = skills.filter(s => s.category === group.category);

  return (
    <motion.div
      className="skills-group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <button
        className="group-header"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="group-title">
          <span className="group-icon">{skillUtils.getCategoryIcon(group.category)}</span>
          <span>{CATEGORY_LABELS[group.category] || group.category}</span>
          <span className="group-count">({groupSkills.length})</span>
        </div>
        <div className="group-average">
          Средний уровень: {group.averageLevel.toFixed(1)}
        </div>
        <span className="group-toggle">{isExpanded ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="group-skills"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {groupSkills.map((skill, index) => {
              const globalIndex = startIndex + index;
              return (
                <SkillItem
                  key={`${skill.name}-${index}`}
                  skill={skill}
                  index={globalIndex}
                  isVisible={true}
                  onClick={onSkillClick}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Основной компонент
export const Skills: React.FC<SkillsSectionProps> = ({ onSkillClick }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'groups'>('list');
  const containerRef = useRef<HTMLDivElement>(null);

  const { filter, filteredSkills, updateFilter, resetFilter } = useSkillsFilter(resumeData.skills);
  const { visibleSkills, showAllSkills } = useSkillsAnimation();

  const stats = useMemo(() => skillUtils.calculateStats(filteredSkills), [filteredSkills]);
  const groups = useMemo(() => skillUtils.groupByCategory(resumeData.skills), []);
  const categories = useMemo(() => {
    const cats = new Set(resumeData.skills.map(s => s.category || 'other'));
    return Array.from(cats);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTyping(false);
      setShowContent(true);
      showAllSkills(filteredSkills.length);
    }, TYPING_DELAY);

    return () => clearTimeout(timer);
  }, [filteredSkills.length, showAllSkills]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleSkillClick = useCallback((skill: Skill) => {
    onSkillClick?.(skill);
  }, [onSkillClick]);

  return (
    <div ref={containerRef} className="skills-container">
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
            <Message delay={0.2}>
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
                  <p>Вот мои основные навыки:</p>

                  <SkillsFilter
                    filter={filter}
                    onFilterChange={updateFilter}
                    onReset={resetFilter}
                    categories={categories}
                    stats={stats}
                  />

                  <div className="view-mode-toggle">
                    <button
                      className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      Список
                    </button>
                    <button
                      className={`view-mode-button ${viewMode === 'groups' ? 'active' : ''}`}
                      onClick={() => setViewMode('groups')}
                    >
                      По категориям
                    </button>
                  </div>

                  {viewMode === 'list' ? (
                    <div className="skills-list">
                      <AnimatePresence>
                        {filteredSkills.map((skill, index) => (
                          <SkillItem
                            key={`${skill.name}-${index}`}
                            skill={skill}
                            index={index}
                            isVisible={visibleSkills.has(index) || !showTyping}
                            onClick={handleSkillClick}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="skills-groups">
                      {groups.map((group, groupIndex) => {
                        const startIndex = groups
                          .slice(0, groupIndex)
                          .reduce((sum, g) => sum + g.skills.length, 0);
                        return (
                          <SkillsGroup
                            key={group.category}
                            group={group}
                            skills={filteredSkills}
                            onSkillClick={handleSkillClick}
                            startIndex={startIndex}
                          />
                        );
                      })}
                    </div>
                  )}

                  <SkillsStats stats={stats} />
                </div>
              </div>
            </Message>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Экспорт утилит
export { skillUtils };

// Экспорт типов
export type { SkillsSectionProps, SkillFilter, SkillStats, SkillGroup };
