
import { useState, useEffect, useCallback } from 'react';
import { Task, Priority, Status } from '../types';

const getLocalStorageKey = (date: Date) => {
    return `tasks_${date.getFullYear()}_${date.getMonth()}`;
};

const initialTasks: Task[] = [
    { id: '1', completed: false, name: 'Pelatihan Koding OJT 2', priority: Priority.Urgent, status: Status.NeedApproval, deadline: '2025-09-09', createdAt: '2025-09-01T10:00:00Z', updatedAt: '2025-09-01T10:00:00Z' },
    { id: '2', completed: false, name: 'Pelatihan PMMKS OJT 1', priority: Priority.Urgent, status: Status.NeedApproval, deadline: '2025-09-17', createdAt: '2025-09-01T10:00:00Z', updatedAt: '2025-09-01T10:00:00Z' },
    { id: '3', completed: false, name: 'Syukuran & Rapat Berssama Yayasan', priority: Priority.High, status: Status.InProgress, deadline: '2025-09-13', createdAt: '2025-09-01T10:00:00Z', updatedAt: '2025-09-01T10:00:00Z' },
    { id: '4', completed: true, name: 'Pengambilan Dokumen KSP ke Dinas Pendidikan', priority: Priority.Low, status: Status.Pending, deadline: '2025-09-15', createdAt: '2025-09-01T10:00:00Z', updatedAt: '2025-09-01T10:00:00Z' },
    { id: '5', completed: true, name: 'Pembuatan SI September tahap 1', priority: Priority.Medium, status: Status.NeedApproval, deadline: '2025-09-03', createdAt: '2025-09-01T10:00:00Z', updatedAt: '2025-09-01T10:00:00Z' },
    { id: '6', completed: false, name: 'Pembuatan SI September tahap 2', priority: Priority.Medium, status: Status.InProgress, deadline: '2025-09-15', createdAt: '2025-09-01T10:00:00Z', updatedAt: '2025-09-01T10:00:00Z' },
];


export const useTasks = (date?: Date) => {
    const [currentDate, setCurrentDate] = useState(date || new Date(2025, 8, 1)); // Set to Sep 2025 for demo
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const key = getLocalStorageKey(currentDate);
        try {
            const items = window.localStorage.getItem(key);
            if (items) {
                setTasks(JSON.parse(items));
            } else {
                 // For demo purposes, load initial data for September 2025
                if(currentDate.getFullYear() === 2025 && currentDate.getMonth() === 8) {
                    setTasks(initialTasks);
                } else {
                    setTasks([]);
                }
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
            setTasks(initialTasks);
        }
    }, [currentDate]);

    useEffect(() => {
        const key = getLocalStorageKey(currentDate);
        try {
            window.localStorage.setItem(key, JSON.stringify(tasks));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [tasks, currentDate]);

    const addTask = useCallback(() => {
        const now = new Date().toISOString();
        const newTask: Task = {
            id: now,
            name: 'Tugas Baru',
            completed: false,
            priority: Priority.Medium,
            status: Status.Pending,
            deadline: new Date().toISOString().split('T')[0],
            createdAt: now,
            updatedAt: now,
        };
        setTasks(prevTasks => [...prevTasks, newTask]);
    }, []);

    const updateTask = useCallback((id: string, updatedTask: Partial<Omit<Task, 'id'>>) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() } : task
            )
        );
    }, []);

    const deleteTask = useCallback((id: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }, []);

    const toggleTaskCompletion = useCallback((id: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed, status: !task.completed ? Status.Selesai : Status.Pending, updatedAt: new Date().toISOString() } : task
            )
        );
    }, []);

    return { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion, currentDate, setCurrentDate };
};
