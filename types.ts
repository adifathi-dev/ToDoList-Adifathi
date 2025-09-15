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

export interface Kepanitiaan {
    ketua: string;
    sekretaris: string;
    bendahara: string;
    koordinator: string;
    lainnya: string;
}

export interface Task {
    id: string;
    completed: boolean;
    name: string;
    priority: Priority;
    status: Status;
    createdAt: string; // Perencanaan Start
    perencanaanEnd: string; // Perencanaan End
    pelaksanaanStart: string;
    deadline: string; // Pelaksanaan End
    pelaporanStart: string;
    pelaporanEnd: string;
    updatedAt: string;
    penanggungJawab: string;
    kepanitiaan: Kepanitiaan;
    tempat?: string;
    suratTugas?: string;
}

export interface BudgetItem {
    id: string; // Linked to task id
    taskName: string;
    anggaranKegiatan: number;
    anggaranTransport: number;
    anggaranPanitia: number;
    fileRAB?: string; // filename
}

export interface ExpenseItem {
    id: string; // Linked to task id
    taskName: string;
    biayaKegiatan: number;
    biayaTransport: number;
    biayaPanitia: number;
    fileBukti?: string; // filename
}