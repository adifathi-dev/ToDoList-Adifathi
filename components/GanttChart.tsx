import React from 'react';
import { Status, Priority } from '../types';

interface GanttChartTask {
    id: string;
    taskName: string;
    status: Status;
    priority: Priority;
    createdAt: string; // Perencanaan Start
    perencanaanEnd: string;
    pelaksanaanStart: string;
    deadline: string; // Pelaksanaan End
    pelaporanStart: string;
    pelaporanEnd: string;
    penanggungJawab: string;
}

interface GanttChartProps {
    tasks: GanttChartTask[];
    year: number;
    selectedMonth: string;
}

const statusColors: { [key in Status]: string } = {
    [Status.Selesai]: 'bg-teal-500',
    [Status.InProgress]: 'bg-orange-400',
    [Status.NeedApproval]: 'bg-blue-500',
    [Status.Pending]: 'bg-purple-500',
};

const YearlyGanttView: React.FC<{ tasks: GanttChartTask[]; year: number }> = ({ tasks, year }) => {
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1).toLocaleString('id-ID', { month: 'short' }));
    const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear(year) ? 366 : 365;

    const getDayOfYear = (dateStr: string): number => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 1;
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };

    return (
        <div className="w-full overflow-x-auto bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Visualisasi Jadwal Kerja Tim</h3>
            <div className="relative text-xs font-semibold" style={{ minWidth: '1000px' }}>
                <div className="grid grid-cols-12 h-8 sticky top-0 bg-white z-10 border-b-2 border-slate-300">
                    {months.map(month => (
                        <div key={month} className="flex items-center justify-center text-slate-600">
                            {month}
                        </div>
                    ))}
                </div>
                <div className="relative mt-4 space-y-2 h-[500px] overflow-y-auto pr-2">
                    {tasks.map((task) => {
                        const startDate = new Date(task.createdAt);
                        const endDate = new Date(task.deadline);
                        if (startDate.getFullYear() > year || endDate.getFullYear() < year) return null;

                        const startDay = startDate.getFullYear() < year ? 1 : getDayOfYear(task.createdAt);
                        const endDay = endDate.getFullYear() > year ? daysInYear : getDayOfYear(task.deadline);
                        const leftPercent = ((startDay - 1) / daysInYear) * 100;
                        const widthPercent = Math.max(((endDay - startDay + 1) / daysInYear) * 100, 0.5);

                        return (
                            <div key={task.id} className="relative h-8 group flex items-center">
                                <div
                                    className={`absolute h-6 rounded-md ${statusColors[task.status]} transition-all duration-300 ease-in-out hover:opacity-80 cursor-pointer`}
                                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, minWidth: '2px' }}
                                >
                                     <span className="text-white text-[10px] font-bold px-2 truncate block leading-6">{task.taskName}</span>
                                </div>
                                <div className="absolute z-20 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -mt-32" style={{ left: `${leftPercent}%`}}>
                                    <h4 className="font-bold mb-1">{task.taskName}</h4>
                                    <p><span className="font-semibold">Status:</span> {task.status}</p>
                                    <p><span className="font-semibold">Prioritas:</span> {task.priority}</p>
                                    <p><span className="font-semibold">Jadwal:</span> {new Date(task.createdAt).toLocaleDateString('id-ID')} - {new Date(task.deadline).toLocaleDateString('id-ID')}</p>
                                    <div className="absolute w-3 h-3 bg-slate-800 transform rotate-45 -bottom-1.5 left-4"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                 <div className="absolute top-8 left-0 w-full h-full pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-l border-slate-200" style={{ left: `${(i / 12) * 100}%` }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MonthlyGanttView: React.FC<{ tasks: GanttChartTask[]; year: number, monthName: string }> = ({ tasks, year, monthName }) => {
    const monthIndex = new Date(Date.parse(monthName +" 1, 2021")).getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(y, m - 1, d));
    };
    
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = parseDate(dateStr);
        if (!date) return '';
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatBarLabel = (startStr: string, endStr: string): string => {
        if (!startStr || !endStr) return '';
        const start = parseDate(startStr);
        const end = parseDate(endStr);
        if (!start || !end) return '';

        const startDay = start.getUTCDate();
        const endDay = end.getUTCDate();
        const shortMonth = start.toLocaleString('id-ID', { month: 'short' });
        const longMonth = start.toLocaleString('id-ID', { month: 'long' });
        const fullYear = start.getUTCFullYear();
        const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;

        if (duration <= 1) {
            return `${startDay} ${shortMonth}`;
        }
        if (duration > 5) {
             return `${startDay} - ${endDay} ${longMonth} ${fullYear}`;
        }
        return `${startDay} - ${endDay} ${shortMonth}`;
    };
    
    const renderBar = (startDateStr: string, endDateStr: string, color: string, label: string) => {
        if (!startDateStr || !endDateStr) return null;
        const start = parseDate(startDateStr);
        const end = parseDate(endDateStr);
        if (!start || !end) return null;

        const monthStart = new Date(Date.UTC(year, monthIndex, 1));
        const monthEnd = new Date(Date.UTC(year, monthIndex, daysInMonth, 23, 59, 59));

        if (end < monthStart || start > monthEnd) return null;

        const barStart = start < monthStart ? 1 : start.getUTCDate();
        const barEnd = end > monthEnd ? daysInMonth : end.getUTCDate();
        
        const left = ((barStart - 1) / daysInMonth) * 100;
        const width = ((barEnd - barStart + 1) / daysInMonth) * 100;

        return (
            <div
                className={`absolute h-6 ${color} rounded flex items-center justify-center text-white text-[11px] font-semibold px-2 shadow-sm`}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={label}
            >
                <span className="truncate">{label}</span>
            </div>
        );
    }
    
    const weeklyHeaders = React.useMemo(() => {
        const headers = [];
        let dayCounter = 1;
        let weekNumber = 1;
        const firstDayOfMonth = new Date(year, monthIndex, 1).getUTCDay();
        const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

        const daysInFirstWeek = 7 - startDayIndex;
        if (daysInFirstWeek > 0 && daysInFirstWeek < 7) {
            headers.push({ name: `Pekan ke ${weekNumber++}`, days: daysInFirstWeek });
            dayCounter += daysInFirstWeek;
        } else {
            // If the month starts on Monday, the first week is a full 7 days.
            const initialDays = 7;
            headers.push({ name: `Pekan ke ${weekNumber++}`, days: initialDays });
            dayCounter += initialDays;
        }


        while (dayCounter + 6 <= daysInMonth) {
            headers.push({ name: `Pekan ke ${weekNumber++}`, days: 7 });
            dayCounter += 7;
        }

        const daysInLastWeek = daysInMonth - dayCounter + 1;
        if (daysInLastWeek > 0) {
            headers.push({ name: `Pekan ke ${weekNumber++}`, days: daysInLastWeek });
        }
        return headers;
    }, [year, monthIndex, daysInMonth]);


    return (
        <div className="w-full overflow-x-auto bg-slate-100 rounded-lg border border-slate-200 shadow-md">
            {/* Headers */}
            <div className="flex sticky top-0 bg-white z-10 shadow-sm">
                 <div className="w-[320px] shrink-0 border-r-2 border-slate-300">
                    <div className="h-10 flex items-center justify-center bg-[#06064F] text-white font-bold rounded-tl-lg">
                        Daftar Tugas
                    </div>
                     <div className="h-8 flex items-center justify-center bg-slate-100 border-b-2 border-slate-300 text-xs font-semibold text-slate-600 px-2">
                        Bulan ini ada {tasks.length} Tugas yang harus dilaksanakan
                    </div>
                </div>
                 <div className="flex-grow min-w-[1200px]">
                    <div className="h-10 flex items-center justify-center bg-[#06064F] text-white font-bold text-lg rounded-tr-lg">
                        {monthName}
                    </div>
                     <div className="flex text-center font-semibold text-sm text-slate-700 border-b-2 border-slate-300 bg-blue-100 h-8">
                        {weeklyHeaders.map((h, index) => (
                             <div key={h.name} className={`flex-grow flex items-center justify-center ${index < weeklyHeaders.length -1 ? 'border-r border-slate-300' : ''}`} style={{ flexBasis: `${(h.days/daysInMonth)*100}%` }}>Pekan ke {index + 1}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body Content */}
            <div className="relative">
                {tasks.map((task) => (
                    <div key={task.id} className="flex border-b-[16px] border-blue-400 bg-white">
                        {/* Left Task Detail Cell */}
                        <div className="w-[320px] shrink-0 p-2 border-r-2 border-slate-300 bg-slate-50 flex flex-col">
                            <h4 className="bg-blue-600 text-white p-1.5 font-bold text-xs rounded-t-md">{task.taskName}</h4>
                            <div className="bg-white p-2 rounded-b-md border border-t-0 border-slate-200 text-[11px] flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="grid grid-cols-[1fr,auto,auto] gap-x-2 font-bold text-slate-700">
                                        <span>Tahapan</span>
                                        <span>Mulai</span>
                                        <span>Selesai</span>
                                    </div>
                                    <div className="grid grid-cols-[1fr,auto,auto] gap-x-2 text-slate-600 mt-1">
                                        <span>Perencanaan</span>
                                        <span className="text-right">{formatDate(task.createdAt)}</span>
                                        <span className="text-right">{formatDate(task.perencanaanEnd)}</span>
                                    </div>
                                    <div className="grid grid-cols-[1fr,auto,auto] gap-x-2 text-slate-600 mt-1">
                                        <span>Pelaksanaan</span>
                                        <span className="text-right">{formatDate(task.pelaksanaanStart)}</span>
                                        <span className="text-right">{formatDate(task.deadline)}</span>
                                    </div>
                                    <div className="grid grid-cols-[1fr,auto,auto] gap-x-2 text-slate-600 mt-1">
                                        <span>Pelaporan</span>
                                        <span className="text-right">{formatDate(task.pelaporanStart)}</span>
                                        <span className="text-right">{formatDate(task.pelaporanEnd)}</span>
                                    </div>
                                </div>
                                <div className="pt-2 mt-2 border-t border-slate-200">
                                    <span className="font-bold text-slate-700">Penanggung Jawab</span>
                                    <span className="text-slate-600 ml-2">{task.penanggungJawab}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Timeline Cell */}
                        <div className="relative flex-grow p-2 min-w-[1200px] bg-white">
                            <div className="relative h-full w-full">
                                {renderBar(task.createdAt, task.perencanaanEnd, 'bg-lime-500', formatBarLabel(task.createdAt, task.perencanaanEnd))}
                                {renderBar(task.pelaksanaanStart, task.deadline, 'bg-orange-400', formatBarLabel(task.pelaksanaanStart, task.deadline))}
                                {renderBar(task.pelaporanStart, task.pelaporanEnd, 'bg-fuchsia-500', formatBarLabel(task.pelaporanStart, task.pelaporanEnd))}
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Vertical week lines Overlay */}
                 <div className="absolute top-0 left-[320px] right-0 h-full pointer-events-none">
                    <div className="relative w-full h-full">
                         {(() => {
                            const lines = [];
                            let accumulatedDays = 0;
                            for (let i = 0; i < weeklyHeaders.length - 1; i++) {
                                accumulatedDays += weeklyHeaders[i].days;
                                const left = (accumulatedDays / daysInMonth) * 100;
                                lines.push(<div key={`line-${i}`} className="absolute top-0 bottom-0 border-l border-slate-300" style={{ left: `${left}%` }}></div>);
                            }
                            return lines;
                        })()}
                    </div>
                 </div>
            </div>
        </div>
    );
};


const GanttChart: React.FC<GanttChartProps> = ({ tasks, year, selectedMonth }) => {
    
    if (tasks.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Tidak ada tugas yang sesuai dengan filter untuk ditampilkan di timeline.</p>
            </div>
        );
    }
    
    if (selectedMonth === 'All') {
        return <YearlyGanttView tasks={tasks} year={year} />;
    }

    return <MonthlyGanttView tasks={tasks} year={year} monthName={selectedMonth} />;
};

export default GanttChart;