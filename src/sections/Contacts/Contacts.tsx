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
                {resumeData.contacts.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.link || '#'}
                    target={contact.link ? '_blank' : undefined}
                    rel={contact.link ? 'noopener noreferrer' : undefined}
                    className="contact-item"
                  >
                    <span className="contact-icon">{getContactIcon(contact.type)}</span>
                    <div className="contact-info">
                      <span className="contact-type">{contact.type}</span>
                      <span className="contact-value">{contact.value}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Message>
      )}
    </>
  );
};
