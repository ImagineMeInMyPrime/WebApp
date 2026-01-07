import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData } from '../../data/resume';
import { useState, useEffect } from 'react';
import '../../components/Message/Message.css';
import './Contacts.css';

export const Contacts = () => {
  const [showTyping, setShowTyping] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTyping(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getContactIcon = (type: string) => {
    const icons: Record<string, string> = {
      Email: '📧',
      GitHub: '💻',
      LinkedIn: '💼',
      Telegram: '✈️',
      Phone: '📱',
    };
    return icons[type] || '📌';
  };

  return (
    <>
      {showTyping && <TypingIndicator />}
      {showContent && (
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
              <div className="contacts-list">
                {resumeData.contacts.map((contact, index) => {
                  // Автоматически создаем ссылку если её нет
                  let finalLink = contact.link;
                  if (!finalLink) {
                    if (contact.type === 'Email') {
                      finalLink = `mailto:${contact.value}`;
                    } else if (contact.type === 'GitHub' && contact.value.includes('github.com')) {
                      finalLink = `https://${contact.value}`;
                    } else if (contact.type === 'GitHub' && !contact.value.startsWith('http')) {
                      finalLink = `https://github.com/${contact.value.replace('github.com/', '').replace('@', '')}`;
                    } else if (contact.type === 'LinkedIn' && contact.value.includes('linkedin.com')) {
                      finalLink = `https://${contact.value}`;
                    } else if (contact.type === 'LinkedIn' && !contact.value.startsWith('http')) {
                      finalLink = `https://linkedin.com/in/${contact.value.replace('linkedin.com/in/', '').replace('@', '')}`;
                    } else if (contact.type === 'Telegram' && contact.value.startsWith('@')) {
                      finalLink = `https://t.me/${contact.value.replace('@', '')}`;
                    } else if (contact.type === 'Telegram' && !contact.value.startsWith('http')) {
                      finalLink = `https://t.me/${contact.value}`;
                    } else if (contact.type === 'Phone') {
                      finalLink = `tel:${contact.value.replace(/\s/g, '')}`;
                    }
                  }
                  
                  // Если ссылка все еще не создана, не делаем её кликабельной
                  if (!finalLink || finalLink === '#') {
                    return (
                      <div key={index} className="contact-item contact-item-disabled">
                        <span className="contact-icon">{getContactIcon(contact.type)}</span>
                        <div className="contact-info">
                          <span className="contact-type">{contact.type}</span>
                          <span className="contact-value">{contact.value}</span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <a
                      key={index}
                      href={finalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-item"
                      onClick={(e) => {
                        // Убеждаемся что ссылка валидна
                        if (!finalLink || finalLink === '#') {
                          e.preventDefault();
                        }
                      }}
                    >
                      <span className="contact-icon">{getContactIcon(contact.type)}</span>
                      <div className="contact-info">
                        <span className="contact-type">{contact.type}</span>
                        <span className="contact-value">{contact.value}</span>
                      </div>
                      <svg className="contact-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </Message>
      )}
    </>
  );
};
