import React, { useMemo } from 'react';
import { Task, Status } from '../types';

interface StatusSummaryProps {
    tasks: Task[];
}

const StatusSummary: React.FC<StatusSummaryProps> = ({ tasks }) => {
    const summary = useMemo(() => {
        return {
            total: tasks.length,
            selesai: tasks.filter(t => t.status === Status.Selesai || t.completed).length,
            inProgress: tasks.filter(t => t.status === Status.InProgress).length,
            needApproval: tasks.filter(t => t.status === Status.NeedApproval).length,
            pending: tasks.filter(t => t.status === Status.Pending).length,
        };
    }, [tasks]);
    
    const summaryItems = [
        { label: 'Total', value: summary.total },
        { label: 'Selesai', value: summary.selesai },
        { label: 'In Progress', value: summary.inProgress },
        { label: 'Need Approval', value: summary.needApproval },
        { label: 'Pending', value: summary.pending },
    ];

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Keterangan Tugas</h3>
            <div className="space-y-2">
                {summaryItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs py-2 border-b border-slate-100 last:border-b-0">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-bold text-slate-800 bg-slate-100 rounded-full px-2 py-0.5">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusSummary;
