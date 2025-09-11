import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    onAddTask: () => void;
    onUpdateTask: (id: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
    onDeleteTask: (id: string) => void;
    onToggleTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, onToggleTask }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#06064F] text-white">
                    <tr>
                        <th className="p-3 w-12 text-center font-semibold text-xs uppercase">No</th>
                        <th className="p-3 w-12 font-semibold text-xs uppercase"></th>
                        <th className="p-3 min-w-[290px] font-semibold text-xs uppercase">Tugas</th>
                        <th className="p-3 min-w-[100px] font-semibold text-xs uppercase">Prioritas</th>
                        <th className="p-3 min-w-[120px] font-semibold text-xs uppercase">Status</th>
                        <th className="p-3 min-w-[80px] font-semibold text-xs uppercase">Deadline</th>
                        <th className="p-3 font-semibold text-xs uppercase">Sisa Waktu</th>
                        <th className="p-3 w-12 font-semibold text-xs uppercase"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {tasks.map((task, index) => (
                        <TaskItem 
                            key={task.id}
                            task={task} 
                            index={index}
                            onUpdate={onUpdateTask}
                            onDelete={onDeleteTask}
                            onToggle={onToggleTask}
                        />
                    ))}
                </tbody>
            </table>
            <div data-html2canvas-ignore="true" className="p-3 flex justify-start print:hidden">
                 <button 
                    onClick={onAddTask}
                    className="bg-[#06064F] text-white px-3 py-2 rounded-md text-xs font-semibold hover:opacity-90 active:opacity-100 transition-opacity flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Tambah Tugas
                </button>
            </div>
        </div>
    );
};

export default TaskList;