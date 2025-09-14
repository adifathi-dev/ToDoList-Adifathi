import { useState, useEffect, useCallback } from 'react';
import { BudgetItem } from '../types';

const getLocalStorageKey = (date: Date) => {
    return `budget_${date.getFullYear()}_${date.getMonth()}`;
};

export const useBudget = (currentDate: Date) => {
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const key = getLocalStorageKey(currentDate);
        try {
            const items = window.localStorage.getItem(key);
            setBudgetItems(items ? JSON.parse(items) : []);
        } catch (error) {
            console.error("Error reading budget from localStorage", error);
            setBudgetItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentDate]);

    const saveBudget = useCallback(() => {
        const key = getLocalStorageKey(currentDate);
        try {
            window.localStorage.setItem(key, JSON.stringify(budgetItems));
            alert('Rencana Anggaran berhasil disimpan!');
        } catch (error) {
            console.error("Error writing budget to localStorage", error);
            alert('Gagal menyimpan Rencana Anggaran.');
        }
    }, [budgetItems, currentDate]);

    const updateBudgetItem = useCallback((id: string, updatedFields: Partial<Omit<BudgetItem, 'id'>>) => {
        setBudgetItems(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
        );
    }, []);

    const deleteBudgetItem = useCallback((id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus item anggaran ini?')) {
            setBudgetItems(prev => prev.filter(item => item.id !== id));
        }
    }, []);
    
    return { budgetItems, setBudgetItems, updateBudgetItem, deleteBudgetItem, saveBudget, isLoading };
};
