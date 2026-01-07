import { Message } from '../../components/Message/Message';
import { TypingIndicator } from '../../components/TypingIndicator/TypingIndicator';
import { resumeData } from '../../data/resume';
import { useState, useEffect } from 'react';
import '../../components/Message/Message.css';
import './Skills.css';

export const Skills = () => {
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
              <p>Вот мои основные навыки:</p>
              <div className="skills-list">
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}/5</span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className="skill-bar-fill"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Message>
      )}
    </>
  );
};
