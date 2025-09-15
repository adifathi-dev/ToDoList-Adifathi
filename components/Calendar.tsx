import React, { useMemo } from 'react';
import { Task, deadlineColors } from '../types';

interface CalendarProps {
    date: Date;
    setDate: (date: Date) => void;
    tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ date, setDate, tasks }) => {
    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    const handlePrevMonth = () => {
        setDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setDate(new Date(year, month + 1, 1));
    };

    const today = new Date();

    const taskDateRanges = useMemo(() => {
        const map = new Map<string, { color: string }[]>();
        if (!tasks) return map;

        tasks.forEach((task, index) => {
            if (typeof task.pelaksanaanStart !== 'string' || typeof task.deadline !== 'string' || !task.pelaksanaanStart || !task.deadline) {
                return;
            }

            try {
                const [startY, startM, startD] = task.pelaksanaanStart.split('-').map(Number);
                const startDate = new Date(Date.UTC(startY, startM - 1, startD));

                const [endY, endM, endD] = task.deadline.split('-').map(Number);
                const endDate = new Date(Date.UTC(endY, endM - 1, endD));

                if (startDate > endDate) return;

                const color = deadlineColors[index % deadlineColors.length];
                
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const year = currentDate.getUTCFullYear();
                    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getUTCDate()).padStart(2, '0');
                    const dayString = `${year}-${month}-${day}`;
                    
                    const dayTasks = map.get(dayString) || [];
                    dayTasks.push({ color });
                    map.set(dayString, dayTasks);

                    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                }
            } catch (e) {
                console.error("Error parsing task dates for calendar:", task, e);
            }
        });
        return map;
    }, [tasks]);

    const renderDays = () => {
        const days = [];
        const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Monday is 0

        for (let i = 0; i < dayOffset; i++) {
            days.push(<div key={`empty-${i}`} className="p-1 text-center h-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayMarkersInfo = taskDateRanges.get(dayString);
            
            days.push(
                <div key={day} className="relative h-10 flex justify-center items-center">
                    {dayMarkersInfo && dayMarkersInfo.slice(0, 7).map((info, i) => (
                        <div
                            key={i}
                            className="absolute w-8 h-8 rounded-full border-2"
                            style={{ borderColor: info.color, transform: `rotate(${i * 15}deg)` }}
                        ></div>
                    ))}
                    <span className={`relative text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center transition-colors
                        ${isToday ? 'bg-[#06064F] text-white' : 'text-slate-700 hover:bg-slate-100'}
                    `}>
                        {day}
                    </span>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h3 className="font-bold text-sm text-slate-800">{date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
                {dayNames.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
                {renderDays()}
            </div>
        </div>
    );
};

export default Calendar;