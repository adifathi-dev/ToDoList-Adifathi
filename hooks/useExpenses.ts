import { useState, useEffect, useCallback } from 'react';
import { ExpenseItem } from '../types';

const getLocalStorageKey = (date: Date) => {
    return `expenses_${date.getFullYear()}_${date.getMonth()}`;
};

export const useExpenses = (currentDate: Date) => {
    const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const key = getLocalStorageKey(currentDate);
        try {
            const items = window.localStorage.getItem(key);
            setExpenseItems(items ? JSON.parse(items) : []);
        } catch (error) {
            console.error("Error reading expenses from localStorage", error);
            setExpenseItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentDate]);

    const saveExpenses = useCallback(() => {
        const key = getLocalStorageKey(currentDate);
        try {
            window.localStorage.setItem(key, JSON.stringify(expenseItems));
            alert('Laporan Biaya berhasil disimpan!');
        } catch (error) {
            console.error("Error writing expenses to localStorage", error);
            alert('Gagal menyimpan Laporan Biaya.');
        }
    }, [expenseItems, currentDate]);

    const updateExpenseItem = useCallback((id: string, updatedFields: Partial<Omit<ExpenseItem, 'id'>>) => {
        setExpenseItems(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
        );
    }, []);
    
    return { expenseItems, setExpenseItems, updateExpenseItem, saveExpenses, isLoading };
};
