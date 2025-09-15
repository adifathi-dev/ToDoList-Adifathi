import React from 'react';
import { Task, Status, Priority } from '../types';

interface FilterControlsProps {
    tasks: Task[];
    selectedStatus: Status | 'All';
    onStatusChange: (status: Status | 'All') => void;
    selectedPriority: Priority | 'All';
    onPriorityChange: (priority: Priority | 'All') => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onResetFilter: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    tasks,
    selectedStatus,
    onStatusChange,
    selectedPriority,
    onPriorityChange,
    searchTerm,
    onSearchChange,
    onResetFilter
}) => {
    // Get unique values for filters, preserving enum order for Priority if possible
    const uniqueStatuses = Object.values(Status).filter(status => tasks.some(task => task.status === status));
    const uniquePriorities = Object.values(Priority).filter(priority => tasks.some(task => task.priority === priority));

    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 print:hidden">
            <div className="flex-1">
                <label htmlFor="name-filter" className="block text-xs font-medium text-slate-600 mb-1">Filter by Name</label>
                <input
                    id="name-filter"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cari nama tugas..."
                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                />
            </div>
            <div className="flex-1">
                <label htmlFor="status-filter" className="block text-xs font-medium text-slate-600 mb-1">Filter by Status</label>
                <select
                    id="status-filter"
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value as Status | 'All')}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                >
                    <option value="All">All Statuses</option>
                    {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className="flex-1">
                <label htmlFor="priority-filter" className="block text-xs font-medium text-slate-600 mb-1">Filter by Priority</label>
                <select
                    id="priority-filter"
                    value={selectedPriority}
                    onChange={(e) => onPriorityChange(e.target.value as Priority | 'All')}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                >
                    <option value="All">All Priorities</option>
                    {uniquePriorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                    ))}
                </select>
            </div>
            <div className="flex sm:items-end pt-2 sm:pt-0">
                <button
                    onClick={onResetFilter}
                    className="w-full sm:w-auto bg-[#06064F] text-white px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 active:opacity-100 transition-opacity"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default FilterControls;
