import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData } from '../../data/resume';
import { useState, useEffect } from 'react';
import '../../components/Message/Message.css';
import './Experience.css';

export const Experience = () => {
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
        <>
          {resumeData.experience.map((exp, index) => (
            <Message key={index} delay={0.2 + index * 0.1}>
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
                  <div className="experience-card">
                    <div className="experience-header">
                      <h3 className="experience-position">{exp.position}</h3>
                      <span className="experience-period">{exp.period}</span>
                    </div>
                    <p className="experience-company">{exp.company}</p>
                    <ul className="experience-description">
                      {exp.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Message>
          ))}
        </>
      )}
    </>
  );
};
