import { useState } from 'react';
import { Header } from './components/Header/Header';
import { Sidebar, Section } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import { ChatBot } from './components/ChatBot/ChatBot';
import { About } from './sections/About/About';
import { Skills } from './sections/Skills/Skills';
import { Experience } from './sections/Experience/Experience';
import { Education } from './sections/Education/Education';
import { Contacts } from './sections/Contacts/Contacts';
import { Chat } from './sections/Chat/Chat';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('about');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'about':
        return <About />;
      case 'skills':
        return <Skills />;
      case 'experience':
        return <Experience />;
      case 'education':
        return <Education />;
      case 'contacts':
        return <Contacts />;
      case 'chat':
        return <Chat />;
      default:
        return <About />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="main-content">
        <div className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
        <Header />
        <ChatWindow>{renderSection()}</ChatWindow>
      </div>
      <ChatBot />
    </div>
  );
}

export default App;
