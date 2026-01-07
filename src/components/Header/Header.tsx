import { resumeData } from '../../data/resume';
import './Header.css';

export const Header = () => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-avatar">
          {resumeData.avatar ? (
            <img src={resumeData.avatar} alt={resumeData.name} />
          ) : (
            <span>{getInitials(resumeData.name)}</span>
          )}
        </div>
        <div className="header-info">
          <h1 className="header-name">{resumeData.name}</h1>
          <p className="header-title">{resumeData.title}</p>
        </div>
      </div>
    </header>
  );
};
