import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    onAddTask: () => void;
    onUpdateTask: (id: string, updatedTask: Partial<Omit<Task, 'id'>>) => void;
    onDeleteTask: (id: string) => void;
    onToggleTask: (id: string) => void;
    onSaveTasks: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, onToggleTask, onSaveTasks }) => {
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
                        <th className="p-3 min-w-[80px] font-semibold text-xs uppercase">Pelaksanaan</th>
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
            <div data-html2canvas-ignore="true" className="p-3 flex justify-start items-center gap-2 print:hidden">
                 <button 
                    onClick={onAddTask}
                    className="bg-[#06064F] text-white px-3 py-2 rounded-md text-xs font-semibold hover:opacity-90 active:opacity-100 transition-opacity flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Tambah Tugas
                </button>
                <button 
                    onClick={onSaveTasks}
                    className="bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    Simpan Tugas
                </button>
            </div>
        </div>
    );
};

export default TaskList;