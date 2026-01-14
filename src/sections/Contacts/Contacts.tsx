import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData, Contact } from '../../data/resume';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../components/Message/Message.css';
import './Contacts.css';

/**
 * Contacts Component
 * 
 * Расширенный компонент для отображения контактов с автоматическим созданием ссылок,
 * копированием в буфер обмена, QR-кодами и интерактивными элементами.
 * 
 * @component
 * @returns {JSX.Element} Компонент секции "Контакты"
 */

// Типы и интерфейсы
interface ContactsSectionProps {
  onContactClick?: (contact: Contact) => void;
}

interface ContactStats {
  total: number;
  byType: Record<string, number>;
  hasLinks: number;
}

interface CopyState {
  contactId: string | null;
  copied: boolean;
}

// Константы
const TYPING_DELAY = 1500;
const ANIMATION_DELAY = 50;
const COPY_FEEDBACK_DURATION = 2000;

// Утилиты для работы с контактами
const contactUtils = {
  /**
   * Получает иконку для типа контакта
   */
  getContactIcon: (type: string): string => {
    const icons: Record<string, string> = {
      Email: '📧',
      GitHub: '💻',
      LinkedIn: '💼',
      Telegram: '✈️',
      Phone: '📱',
      Website: '🌐',
      Twitter: '🐦',
      Instagram: '📷',
      Facebook: '👤',
      VK: '🔵',
      Discord: '💬',
    };
    return icons[type] || '📌';
  },

  /**
   * Автоматически создает ссылку если её нет
   */
  generateLink: (contact: Contact): string | null => {
    if (contact.link) {
      return contact.link;
    }

    const type = contact.type.toLowerCase();
    const value = contact.value.trim();

    // Email
    if (type === 'email' || type.includes('mail')) {
      if (value.includes('@')) {
        return `mailto:${value}`;
      }
      return `mailto:${value}`;
    }

    // GitHub
    if (type === 'github' || type.includes('git')) {
      if (value.includes('github.com')) {
        return value.startsWith('http') ? value : `https://${value}`;
      }
      const username = value.replace('github.com/', '').replace('@', '').replace('github.com', '').trim();
      return `https://github.com/${username}`;
    }

    // LinkedIn
    if (type === 'linkedin') {
      if (value.includes('linkedin.com')) {
        return value.startsWith('http') ? value : `https://${value}`;
      }
      const username = value.replace('linkedin.com/in/', '').replace('@', '').trim();
      return `https://linkedin.com/in/${username}`;
    }

    // Telegram
    if (type === 'telegram' || type.includes('tg')) {
      if (value.startsWith('@')) {
        return `https://t.me/${value.replace('@', '')}`;
      }
      if (value.includes('t.me')) {
        return value.startsWith('http') ? value : `https://${value}`;
      }
      return `https://t.me/${value.replace('@', '')}`;
    }

    // Phone
    if (type === 'phone' || type.includes('тел')) {
      const phone = value.replace(/\s/g, '').replace(/[^\d+]/g, '');
      return `tel:${phone}`;
    }

    // Website
    if (type === 'website' || type.includes('сайт') || type.includes('site')) {
      if (value.startsWith('http')) {
        return value;
      }
      return `https://${value}`;
    }

    // Twitter/X
    if (type === 'twitter' || type === 'x') {
      const username = value.replace('@', '').replace('twitter.com/', '').trim();
      return `https://twitter.com/${username}`;
    }

    return null;
  },

  /**
   * Проверяет валидность ссылки
   */
  isValidLink: (link: string | null | undefined): boolean => {
    if (!link || link === '#') return false;
    try {
      const url = new URL(link);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Копирует текст в буфер обмена
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  },

  /**
   * Форматирует значение контакта для отображения
   */
  formatContactValue: (contact: Contact): string => {
    if (contact.type.toLowerCase() === 'phone') {
      return contact.value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
    }
    return contact.value;
  },

  /**
   * Вычисляет статистику контактов
   */
  calculateStats: (contacts: Contact[]): ContactStats => {
    const byType: Record<string, number> = {};
    let hasLinks = 0;

    contacts.forEach(contact => {
      byType[contact.type] = (byType[contact.type] || 0) + 1;
      if (contactUtils.isValidLink(contactUtils.generateLink(contact))) {
        hasLinks++;
      }
    });

    return {
      total: contacts.length,
      byType,
      hasLinks,
    };
  },

  /**
   * Группирует контакты по типам
   */
  groupByType: (contacts: Contact[]): Record<string, Contact[]> => {
    const groups: Record<string, Contact[]> = {};
    
    contacts.forEach(contact => {
      const type = contact.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(contact);
    });

    return groups;
  },
};

// Хуки
const useContactCopy = () => {
  const [copyState, setCopyState] = useState<CopyState>({
    contactId: null,
    copied: false,
  });

  const copyContact = useCallback(async (contact: Contact, contactId: string) => {
    const link = contactUtils.generateLink(contact);
    const textToCopy = link || contact.value;

    const success = await contactUtils.copyToClipboard(textToCopy);
    
    if (success) {
      setCopyState({ contactId, copied: true });
      setTimeout(() => {
        setCopyState({ contactId: null, copied: false });
      }, COPY_FEEDBACK_DURATION);
    }
  }, []);

  return { copyState, copyContact };
};

const useContactAnimation = () => {
  const [visibleContacts, setVisibleContacts] = useState<Set<number>>(new Set());

  const showContact = useCallback((index: number) => {
    setVisibleContacts(prev => new Set(prev).add(index));
  }, []);

  const showAllContacts = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => showContact(i), i * ANIMATION_DELAY);
    }
  }, [showContact]);

  return { visibleContacts, showContact, showAllContacts };
};

// Компоненты
const ContactItem: React.FC<{
  contact: Contact;
  index: number;
  isVisible: boolean;
  onContactClick?: (contact: Contact) => void;
  onCopy?: (contact: Contact, contactId: string) => void;
  copyState: CopyState;
}> = ({ contact, index, isVisible, onContactClick, onCopy, copyState }) => {
  const [isHovered, setIsHovered] = useState(false);
  const contactId = `contact-${index}`;
  const link = useMemo(() => contactUtils.generateLink(contact), [contact]);
  const isValid = useMemo(() => contactUtils.isValidLink(link), [link]);
  const icon = useMemo(() => contact.icon || contactUtils.getContactIcon(contact.type), [contact]);
  const formattedValue = useMemo(() => contactUtils.formatContactValue(contact), [contact]);
  const isCopied = copyState.contactId === contactId && copyState.copied;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isValid && link) {
      window.open(link, '_blank', 'noopener,noreferrer');
      onContactClick?.(contact);
    }
  }, [contact, link, isValid, onContactClick]);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy?.(contact, contactId);
  }, [contact, contactId, onCopy]);

  return (
    <motion.a
      href={isValid ? link || '#' : undefined}
      className={`contact-item ${!isValid ? 'contact-item-disabled' : ''} ${isCopied ? 'contact-item-copied' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={isValid ? handleClick : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      target={isValid ? '_blank' : undefined}
      rel={isValid ? 'noopener noreferrer' : undefined}
      aria-label={`${contact.type}: ${contact.value}`}
    >
      <motion.span
        className="contact-icon"
        animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.span>
      
      <div className="contact-info">
        <span className="contact-type">{contact.type}</span>
        <span className="contact-value">{formattedValue}</span>
      </div>

      <div className="contact-actions">
        {isValid && (
          <motion.button
            className="contact-copy-button"
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Копировать"
            aria-label="Копировать контакт"
          >
            {isCopied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </motion.button>
        )}
        
        {isValid && (
          <motion.svg
            className="contact-arrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            animate={isHovered ? { x: 4 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </motion.svg>
        )}
      </div>

      {isCopied && (
        <motion.div
          className="contact-copy-feedback"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          Скопировано!
        </motion.div>
      )}
    </motion.a>
  );
};

const ContactsStats: React.FC<{ stats: ContactStats }> = ({ stats }) => {
  return (
    <motion.div
      className="contacts-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3>Статистика контактов</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Всего контактов</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.hasLinks}</span>
          <span className="stat-label">С активными ссылками</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{Object.keys(stats.byType).length}</span>
          <span className="stat-label">Типов контактов</span>
        </div>
      </div>
    </motion.div>
  );
};

const ContactGroups: React.FC<{
  contacts: Contact[];
  visibleContacts: Set<number>;
  onContactClick?: (contact: Contact) => void;
  onCopy: (contact: Contact, contactId: string) => void;
  copyState: CopyState;
}> = ({ contacts, visibleContacts, onContactClick, onCopy, copyState }) => {
  const groups = useMemo(() => contactUtils.groupByType(contacts), [contacts]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(Object.keys(groups)));

  const toggleGroup = useCallback((type: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="contact-groups">
      {Object.entries(groups).map(([type, typeContacts]) => (
        <div key={type} className="contact-group">
          <button
            className="group-header"
            onClick={() => toggleGroup(type)}
          >
            <div className="group-title">
              <span className="group-icon">{contactUtils.getContactIcon(type)}</span>
              <span>{type}</span>
              <span className="group-count">({typeContacts.length})</span>
            </div>
            <span className="group-toggle">{expandedGroups.has(type) ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {expandedGroups.has(type) && (
              <motion.div
                className="group-contacts"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {typeContacts.map((contact, index) => {
                  const globalIndex = contacts.indexOf(contact);
                  return (
                    <ContactItem
                      key={`${type}-${index}`}
                      contact={contact}
                      index={globalIndex}
                      isVisible={visibleContacts.has(globalIndex)}
                      onContactClick={onContactClick}
                      onCopy={onCopy}
                      copyState={copyState}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

// Основной компонент
export const Contacts: React.FC<ContactsSectionProps> = ({ onContactClick }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'groups'>('list');
  const containerRef = useRef<HTMLDivElement>(null);

  const { copyState, copyContact } = useContactCopy();
  const { visibleContacts, showAllContacts } = useContactAnimation();

  const stats = useMemo(() => contactUtils.calculateStats(resumeData.contacts), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTyping(false);
      setShowContent(true);
      showAllContacts(resumeData.contacts.length);
    }, TYPING_DELAY);

    return () => clearTimeout(timer);
  }, [showAllContacts]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleContactClick = useCallback((contact: Contact) => {
    onContactClick?.(contact);
  }, [onContactClick]);

  const handleCopy = useCallback((contact: Contact, contactId: string) => {
    copyContact(contact, contactId);
  }, [copyContact]);

  return (
    <div ref={containerRef} className="contacts-container">
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
                  <p>Свяжитесь со мной:</p>

                  <ContactsStats stats={stats} />

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
                      По типам
                    </button>
                  </div>

                  {viewMode === 'list' ? (
                    <div className="contacts-list">
                      {resumeData.contacts.map((contact, index) => (
                        <ContactItem
                          key={`contact-${index}`}
                          contact={contact}
                          index={index}
                          isVisible={visibleContacts.has(index) || !showTyping}
                          onContactClick={handleContactClick}
                          onCopy={handleCopy}
                          copyState={copyState}
                        />
                      ))}
                    </div>
                  ) : (
                    <ContactGroups
                      contacts={resumeData.contacts}
                      visibleContacts={visibleContacts}
                      onContactClick={handleContactClick}
                      onCopy={handleCopy}
                      copyState={copyState}
                    />
                  )}
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
export { contactUtils };

// Экспорт типов
export type { ContactsSectionProps, ContactStats, CopyState };
