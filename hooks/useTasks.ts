

import { useState, useEffect, useCallback } from 'react';
import { Task, Priority, Status, Kepanitiaan } from '../types';

const getLocalStorageKey = (date: Date) => {
    return `tasks_${date.getFullYear()}_${date.getMonth()}`;
};

const initialTasks: Task[] = [
    { id: '1', completed: false, name: 'Pelatihan Koding & KA OJT 2', priority: Priority.Urgent, status: Status.InProgress, createdAt: '2025-09-01', perencanaanEnd: '2025-09-03', pelaksanaanStart: '2025-09-04', deadline: '2025-09-09', pelaporanStart: '2025-09-10', pelaporanEnd: '2025-09-11', updatedAt: '2025-09-01T10:00:00Z', penanggungJawab: 'Ayu Wandira', kepanitiaan: { ketua: 'Ayu Wandira', sekretaris: 'Budi', bendahara: 'Cici', koordinator: 'Dedi', lainnya: 'Tim IT, Panitia Inti' }, tempat: 'Ruang Meeting A', suratTugas: 'ST/001/IX/2025' },
    { id: '2', completed: false, name: 'Pelatihan PMKS OJT 1', priority: Priority.Urgent, status: Status.NeedApproval, createdAt: '2025-09-01', perencanaanEnd: '2025-09-03', pelaksanaanStart: '2025-09-04', deadline: '2025-09-09', pelaporanStart: '2025-09-10', pelaporanEnd: '2025-09-11', updatedAt: '2025-09-01T10:00:00Z', penanggungJawab: 'Komarudin', kepanitiaan: { ketua: 'Komarudin', sekretaris: 'Ani', bendahara: 'Siti', koordinator: 'Rudi', lainnya: 'Tim Pelatihan' }, tempat: 'Aula Utama', suratTugas: 'ST/002/IX/2025' },
    { id: '3', completed: false, name: 'Syukuran & Rapat Bersama Yayasan', priority: Priority.High, status: Status.Pending, createdAt: '2025-09-16', perencanaanEnd: '2025-09-16', pelaksanaanStart: '2025-09-17', deadline: '2025-09-17', pelaporanStart: '2025-09-18', pelaporanEnd: '2025-09-18', updatedAt: '2025-09-01T10:00:00Z', penanggungJawab: 'Komarudin', kepanitiaan: { ketua: '', sekretaris: '', bendahara: '', koordinator: '', lainnya: 'Manajemen Sekolah' }, tempat: 'Kantor Yayasan', suratTugas: 'ST/003/IX/2025' },
    { id: '4', completed: true, name: 'Pengambilan Dokumen KSP ke Dinas', priority: Priority.Low, status: Status.Selesai, createdAt: '2025-09-12', perencanaanEnd: '2025-09-16', pelaksanaanStart: '2025-09-17', deadline: '2025-09-25', pelaporanStart: '2025-09-26', pelaporanEnd: '2025-09-26', updatedAt: '2025-09-01T10:00:00Z', penanggungJawab: 'Desti, S.Pd', kepanitiaan: { ketua: '', sekretaris: '', bendahara: '', koordinator: '', lainnya: 'Staf Administrasi' }, tempat: 'Dinas Pendidikan', suratTugas: 'ST/004/IX/2025' },
    { id: '5', completed: true, name: 'Pembuatan SI September tahap 1', priority: Priority.Medium, status: Status.Selesai, createdAt: '2025-09-01', perencanaanEnd: '2025-09-01', pelaksanaanStart: '2025-09-02', deadline: '2025-09-03', pelaporanStart: '2025-09-04', pelaporanEnd: '2025-09-04', updatedAt: '2025-09-01T10:00:00Z', penanggungJawab: 'Tim IT', kepanitiaan: { ketua: '', sekretaris: '', bendahara: '', koordinator: '', lainnya: 'Tim IT' }, tempat: 'Online', suratTugas: '' },
    { id: '6', completed: false, name: 'Pembuatan SI September tahap 2', priority: Priority.Medium, status: Status.InProgress, createdAt: '2025-09-05', perencanaanEnd: '2025-09-08', pelaksanaanStart: '2025-09-09', deadline: '2025-09-15', pelaporanStart: '2025-09-16', pelaporanEnd: '2025-09-16', updatedAt: '2025-09-01T10:00:00Z', penanggungJawab: 'Tim IT', kepanitiaan: { ketua: '', sekretaris: '', bendahara: '', koordinator: '', lainnya: 'Tim IT' }, tempat: 'Online', suratTugas: '' },
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

    const saveTasks = useCallback(() => {
        const key = getLocalStorageKey(currentDate);
        try {
            window.localStorage.setItem(key, JSON.stringify(tasks));
            alert('Tugas berhasil disimpan!');
        } catch (error) {
            console.error("Error writing to localStorage", error);
            alert('Gagal menyimpan tugas.');
        }
    }, [tasks, currentDate]);

    const addTask = useCallback((taskData: Omit<Task, 'id' | 'completed' | 'updatedAt'>) => {
        const nowISO = new Date().toISOString();
        
        const newTask: Task = {
            id: nowISO,
            completed: false,
            updatedAt: nowISO,
            name: taskData.name,
            priority: taskData.priority,
            status: taskData.status,
            createdAt: taskData.createdAt,
            perencanaanEnd: taskData.perencanaanEnd,
            pelaksanaanStart: taskData.pelaksanaanStart,
            deadline: taskData.deadline,
            pelaporanStart: taskData.pelaporanStart,
            pelaporanEnd: taskData.pelaporanEnd,
            penanggungJawab: taskData.penanggungJawab,
            kepanitiaan: taskData.kepanitiaan || { ketua: '', sekretaris: '', bendahara: '', koordinator: '', lainnya: '' },
            tempat: taskData.tempat || '',
            suratTugas: taskData.suratTugas || '',
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

    return { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion, currentDate, setCurrentDate, saveTasks };
};