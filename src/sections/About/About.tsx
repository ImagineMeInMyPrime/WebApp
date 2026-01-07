import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData } from '../../data/resume';
import { useState, useEffect } from 'react';
import '../../components/Message/Message.css';

export const About = () => {
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
              <p>{resumeData.about}</p>
            </div>
          </div>
        </Message>
      )}
    </>
  );
};
