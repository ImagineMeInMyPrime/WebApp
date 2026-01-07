import { ReactNode } from 'react';
import './ChatWindow.css';

interface ChatWindowProps {
  children: ReactNode;
}

export const ChatWindow = ({ children }: ChatWindowProps) => {
  return (
    <div className="chat-window">
      <div className="chat-content">{children}</div>
    </div>
  );
};
