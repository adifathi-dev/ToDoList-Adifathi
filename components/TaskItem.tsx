import React from 'react';
import { Task, Priority, Status, deadlineColors } from '../types';
import { calculateSisaWaktu } from '../utils/dateUtils';

interface TaskItemProps {
    task: Task;
    index: number;
    onUpdate: (id: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

const priorityColors: { [key in Priority]: string } = {
    [Priority.Urgent]: 'bg-red-100 text-red-800 border-red-200',
    [Priority.High]: 'bg-orange-100 text-orange-800 border-orange-200',
    [Priority.Medium]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [Priority.Low]: 'bg-green-100 text-green-800 border-green-200',
};

const statusColors: { [key in Status]: string } = {
    [Status.NeedApproval]: 'bg-blue-100 text-blue-800',
    [Status.InProgress]: 'bg-teal-100 text-teal-800',
    [Status.Pending]: 'bg-purple-100 text-purple-800',
    [Status.Selesai]: 'bg-slate-200 text-slate-600 line-through',
};


const TaskItem: React.FC<TaskItemProps> = ({ task, index, onUpdate, onDelete, onToggle }) => {
    
    const sisaWaktu = calculateSisaWaktu(task.deadline);
    const taskDeadlineColor = deadlineColors[index % deadlineColors.length];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onUpdate(task.id, { [e.target.name]: e.target.value });
    };

    return (
        <tr className="hover:bg-slate-50 group">
            <td className="p-3 text-center text-slate-500">{index + 1}</td>
            <td className="p-3 text-center">
                <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => onToggle(task.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
            </td>
            <td className="p-2">
                <input
                    type="text"
                    name="name"
                    value={task.name}
                    onChange={handleInputChange}
                    className={`w-full bg-transparent p-1 rounded-md transition-all ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'} hover:bg-slate-100 focus:bg-white focus:shadow`}
                />
            </td>
            <td className="p-2">
                <select
                    name="priority"
                    value={task.priority}
                    onChange={handleInputChange}
                    className={`w-full p-1.5 border rounded-md text-xs font-semibold ${priorityColors[task.priority]} focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </td>
            <td className="p-2">
                <select
                    name="status"
                    value={task.status}
                    onChange={handleInputChange}
                    className={`w-full p-1.5 border-0 rounded-md text-xs font-semibold ${statusColors[task.status]} focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                >
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </td>
            <td className="p-2">
                <input
                    type="date"
                    name="pelaksanaanStart"
                    value={task.pelaksanaanStart}
                    onChange={handleInputChange}
                    className="w-full bg-transparent p-1 border border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-md text-slate-600 transition-colors"
                />
            </td>
             <td className="p-2">
                <input
                    type="date"
                    name="deadline"
                    value={task.deadline}
                    onChange={handleInputChange}
                    className="w-full bg-transparent p-1 border border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-md text-slate-600 transition-colors"
                />
            </td>
            <td className="p-3 text-center font-bold text-sm" style={{ color: taskDeadlineColor }}>
                {sisaWaktu}
            </td>
            <td className="p-3 text-center print:hidden">
                <button onClick={() => onDelete(task.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </td>
        </tr>
    );
};

export default TaskItem;