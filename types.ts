export const deadlineColors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6'];

export enum Priority {
    Urgent = 'Urgent',
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export enum Status {
    Selesai = 'Selesai',
    InProgress = 'In Progress',
    NeedApproval = 'Need Approval',
    Pending = 'Pending',
}

export interface Task {
    id: string;
    completed: boolean;
    name: string;
    priority: Priority;
    status: Status;
    deadline: string; // ISO string format 'YYYY-MM-DD'
}