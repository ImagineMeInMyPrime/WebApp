import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import './Message.css';

interface MessageProps {
  children: ReactNode;
  delay?: number;
}

export const Message = ({ children, delay = 0 }: MessageProps) => {
  return (
    <motion.div
      className="message"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
};
