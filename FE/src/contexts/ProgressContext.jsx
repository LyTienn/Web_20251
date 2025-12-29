import { createContext, useContext, useState } from 'react';

const ProgressContext = createContext();

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress must be used within ProgressProvider');
    }
    return context;
};

export const ProgressProvider = ({ children }) => {
    const [activeTasks, setActiveTasks] = useState([]);

    const addTask = (task) => {
        setActiveTasks(prev => {
            // Prevent duplicates
            if (prev.some(t => t.id === task.id)) return prev;
            return [...prev, task];
        });
    };

    const updateTask = (taskId, updates) => {
        setActiveTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, ...updates } : t)
        );
    };

    const removeTask = (taskId) => {
        setActiveTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const clearAllTasks = () => {
        setActiveTasks([]);
    };

    return (
        <ProgressContext.Provider value={{ activeTasks, addTask, updateTask, removeTask, clearAllTasks }}>
            {children}
        </ProgressContext.Provider>
    );
};
