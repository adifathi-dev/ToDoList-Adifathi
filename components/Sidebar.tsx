import React from 'react';
import { Task } from '../types';
import Calendar from './Calendar';
import StatusSummary from './StatusSummary';

interface SidebarProps {
    tasks: Task[];
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
}

const UserInfo: React.FC = () => (
    <div className="bg-blue; border border-slate-200 rounded-lg p-4">
         <h3 className="font-bold text-slate-800 text-sm mb-3">RENCANA KEGIATAN</h3>
         <div className="space-y-2 text-xs text-slate-600">
             <div className="flex">
                 <span className="font-semibold w-1/3">Nama</span>
                 <span>: Komarudin, S.Pd.I</span>
             </div>
             <div className="flex">
                 <span className="font-semibold w-1/3">Jabatan</span>
                 <span>: Kepala Sekolah</span>
             </div>
         </div>
    </div>
);

const Logo: React.FC = () => (
    <div className="bg-[#06064F] rounded-lg p-4 flex items-center justify-center mt-4">
        <img 
            src="https://vhljvdqjlzjcutcnamgz.supabase.co/storage/v1/object/public/Adifathi-guru/loggoo.webp" 
            alt="Adifathi Logo"
            className="w-20 h-20 object-contain"
        />
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ tasks, currentDate, setCurrentDate }) => {
    return (
        <aside className="space-y-4">
            <Calendar date={currentDate} setDate={setCurrentDate} tasks={tasks} />
            <StatusSummary tasks={tasks} />
            <UserInfo />
            <Logo />
        </aside>
    );
};

export default Sidebar;