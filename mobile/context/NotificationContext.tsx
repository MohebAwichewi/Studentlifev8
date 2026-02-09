import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomNotification, { NotificationType } from '../components/CustomNotification';

interface NotificationContextProps {
    showNotification: (type: NotificationType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState({
        type: 'info' as NotificationType,
        title: '',
        message: ''
    });

    const showNotification = (type: NotificationType, title: string, message: string) => {
        setConfig({ type, title, message });
        setVisible(true);
    };

    const hideNotification = () => {
        setVisible(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <CustomNotification
                visible={visible}
                onHide={hideNotification}
                title={config.title}
                message={config.message}
                type={config.type}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
