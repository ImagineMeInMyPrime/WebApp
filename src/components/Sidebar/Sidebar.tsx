import { motion } from 'framer-motion';
import './Sidebar.css';

export type Section = 'about' | 'skills' | 'experience' | 'education' | 'contacts';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const sections: { id: Section; label: string; icon: string }[] = [
  { id: 'about', label: 'О себе', icon: '👤' },
  { id: 'skills', label: 'Навыки', icon: '💻' },
  { id: 'experience', label: 'Опыт работы', icon: '💼' },
  { id: 'education', label: 'Образование', icon: '🎓' },
  { id: 'contacts', label: 'Контакты', icon: '📧' },
];

export const Sidebar = ({ activeSection, onSectionChange, isMobileOpen, onMobileClose }: SidebarProps) => {
  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <motion.aside
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        initial={false}
        animate={{ x: isMobileOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title">Разделы</h2>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => {
                onSectionChange(section.id);
                onMobileClose();
              }}
            >
              <span className="sidebar-icon">{section.icon}</span>
              <span className="sidebar-label">{section.label}</span>
            </button>
          ))}
        </nav>
      </motion.aside>
    </>
  );
};
