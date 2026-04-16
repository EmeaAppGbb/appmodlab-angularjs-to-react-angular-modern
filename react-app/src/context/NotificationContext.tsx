import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

type UINotificationType = 'success' | 'error' | 'warning' | 'info';

interface UINotification {
  id: string;
  message: string;
  type: UINotificationType;
  createdAt: number;
}

interface NotificationContextType {
  notifications: UINotification[];
  addNotification: (message: string, type: UINotificationType) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let nextId = 0;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeNotification = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (message: string, type: UINotificationType) => {
      const id = `notif-${++nextId}`;
      const notification: UINotification = {
        id,
        message,
        type,
        createdAt: Date.now(),
      };
      setNotifications((prev) => [...prev, notification]);

      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
      timersRef.current.set(id, timer);
    },
    [],
  );

  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
