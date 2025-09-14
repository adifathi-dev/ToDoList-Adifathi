import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
  HeadingLevel, AlignmentType, WidthType
} from 'docx';
import * as XLSX from 'xlsx';
import { useBudget } from '../hooks/useBudget';
import { useTasks } from '../hooks/useTasks';
import { BudgetItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import BudgetPieChart from './BudgetPieChart';

const MonthYearSelector: React.FC<{ currentDate: Date, setCurrentDate: (date: Date) => void }> = ({ currentDate, setCurrentDate }) => {
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    
    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-3">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h3 className="font-bold text-sm text-slate-800">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
            <p className="text-xs text-center text-slate-500">Pilih bulan dan tahun untuk melihat atau menginput Rencana Anggaran.</p>
        </div>
    );
};


const BudgetPlanPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Default to Sep 2025
    const { tasks } = useTasks(currentDate); 
    const { budgetItems, setBudgetItems, saveBudget, updateBudgetItem, deleteBudgetItem, isLoading } = useBudget(currentDate);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);

    useEffect(() => {
        if (isLoading) return; // Prevent running logic while data is loading
        const monthTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate.getMonth() === currentDate.getMonth() && taskDate.getFullYear() === currentDate.getFullYear();
        });
        
        const existingTaskIds = new Set(budgetItems.map(b => b.id));
        const newBudgetItems: BudgetItem[] = monthTasks
            .filter(task => !existingTaskIds.has(task.id))
            .map(task => ({
                id: task.id,
                taskName: task.name,
                anggaranKegiatan: 0,
                anggaranTransport: 0,
                anggaranPanitia: 0,
            }));

        // A more robust way to merge tasks and budget items
        const currentBudgetItemsMap = new Map(budgetItems.map(item => [item.id, item]));
        const updatedBudgetItems = monthTasks.map(task => {
            return currentBudgetItemsMap.get(task.id) || {
                id: task.id,
                taskName: task.name,
                anggaranKegiatan: 0,
                anggaranTransport: 0,
                anggaranPanitia: 0,
            };
        });

        // Only update if there's a change to avoid loops
        if (JSON.stringify(updatedBudgetItems) !== JSON.stringify(budgetItems)) {
            setBudgetItems(updatedBudgetItems);
        }
    }, [tasks, currentDate, budgetItems, setBudgetItems, isLoading]);
    
    const handleInputChange = (id: string, field: keyof Omit<BudgetItem, 'id' | 'taskName' | 'fileRAB'>, value: string) => {
        const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
        updateBudgetItem(id, { [field]: numericValue });
    };

    const handleTriggerUpload = (itemId: string) => {
        setUploadTargetId(itemId);
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (uploadTargetId && event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            updateBudgetItem(uploadTargetId, { fileRAB: file.name });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setUploadTargetId(null);
    };

    const handleRemoveFile = (itemId: string) => {
        updateBudgetItem(itemId, { fileRAB: undefined });
    };

    const totalAnggaran = useMemo(() => {
        return budgetItems.reduce((sum, item) => sum + item.anggaranKegiatan + item.anggaranTransport + item.anggaranPanitia, 0);
    }, [budgetItems]);

    const progressPercentage = useMemo(() => {
        if (tasks.length === 0) return 0;
        const budgetedCount = budgetItems.filter(item => item.anggaranKegiatan > 0 || item.anggaranTransport > 0 || item.anggaranPanitia > 0).length;
        return Math.round((budgetedCount / tasks.length) * 100);
    }, [budgetItems, tasks]);

    const handleExportXLSX = () => {
        const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
        const year = currentDate.getFullYear();
        const printDate = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const headers = ["No", "Tugas", "Anggaran Kegiatan", "Anggaran Transport", "Anggaran Pelaksana", "Jumlah", "File RAB"];
        
        const data = budgetItems.map((item, index) => {
            const jumlah = item.anggaranKegiatan + item.anggaranTransport + item.anggaranPanitia;
            return [
                index + 1,
                item.taskName,
                item.anggaranKegiatan,
                item.anggaranTransport,
                item.anggaranPanitia,
                jumlah,
                item.fileRAB || ''
            ];
        });

        const totalAnggaranKegiatan = budgetItems.reduce((sum, item) => sum + item.anggaranKegiatan, 0);
        const totalAnggaranTransport = budgetItems.reduce((sum, item) => sum + item.anggaranTransport, 0);
        const totalAnggaranPanitia = budgetItems.reduce((sum, item) => sum + item.anggaranPanitia, 0);
        const totalSum = totalAnggaranKegiatan + totalAnggaranTransport + totalAnggaranPanitia;

        const totalRow = ["", "TOTAL", totalAnggaranKegiatan, totalAnggaranTransport, totalAnggaranPanitia, totalSum, ""];
        
        const signatureBlock = [
            [],
            [],
            ["", "", "", "", "", `Majalengka, ${printDate}`],
            [],
            ["", "", "", "", "", "Mengetahui,"],
            ["", "", "", "", "", "Kepala Sekolah"],
            [],
            [],
            [],
            ["", "", "", "", "", "KOMARUDIN, S.Pd.I"],
        ];

        const sheetData = [headers, ...data, totalRow, ...signatureBlock];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rencana Anggaran");

        worksheet["!cols"] = [
            { wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }
        ];

        for (let i = 2; i <= data.length + 2; i++) {
          for (let j = 2; j <= 5; j++) {
              const cell_address = XLSX.utils.encode_cell({c:j, r:i-1});
              if(worksheet[cell_address]) {
                  worksheet[cell_address].t = 'n';
                  worksheet[cell_address].z = '"Rp"#,##0';
              }
          }
        }

        XLSX.writeFile(workbook, `Rencana_Anggaran_${monthName}_${year}.xlsx`);
    };

    const handleExportDOCX = () => {
        const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
        const year = currentDate.getFullYear();
        const printDate = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const createHeaderCell = (text: string) => new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
            shading: { fill: "06064F" },
        });
        
        const header = new TableRow({
            tableHeader: true,
            children: [
                createHeaderCell("No"),
                createHeaderCell("Tugas"),
                createHeaderCell("Anggaran Kegiatan"),
                createHeaderCell("Anggaran Transport"),
                createHeaderCell("Anggaran Pelaksana"),
                createHeaderCell("Jumlah"),
                createHeaderCell("File RAB"),
            ],
        });

        const dataRows = budgetItems.map((item, index) => {
            const jumlah = item.anggaranKegiatan + item.anggaranTransport + item.anggaranPanitia;
            return new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph(item.taskName)] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.anggaranKegiatan), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.anggaranTransport), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.anggaranPanitia), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(jumlah), bold: true })], alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph(item.fileRAB || '')] }),
                ],
            });
        });

        const totalRow = new TableRow({
            children: [
                new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true })], alignment: AlignmentType.RIGHT })],
                    columnSpan: 5,
                 }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(totalAnggaran), bold: true })], alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph('')] }),
            ],
        });

        const table = new Table({
            rows: [header, ...dataRows, totalRow],
            width: { size: 100, type: WidthType.PERCENTAGE },
        });

        const doc = new Document({
          sections: [{
            children: [
              new Paragraph({ text: `Rencana Anggaran - ${monthName} ${year}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
              new Paragraph({ text: "", spacing: { after: 400 } }),
              table,
              new Paragraph({ text: "", spacing: { after: 800 } }),
              new Paragraph({
                text: `Majalengka, ${printDate}`,
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({ text: "", spacing: { after: 200 } }),
              new Paragraph({
                text: "Mengetahui,",
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                text: "Kepala Sekolah",
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({ text: "", spacing: { after: 1200 } }),
              new Paragraph({
                children: [
                  new TextRun({ text: "KOMARUDIN, S.Pd.I", bold: true, underline: {} })
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }],
        });
        
        Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Rencana_Anggaran_${monthName}_${year}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
            />
            <aside className="lg:col-span-3 space-y-4">
                <MonthYearSelector currentDate={currentDate} setCurrentDate={setCurrentDate} />
                <BudgetPieChart budgetItems={budgetItems} />
            </aside>
            <div className="lg:col-span-9">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Rencana Anggaran</h1>
                        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                             <button onClick={handleExportXLSX} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span className="hidden sm:inline">Export XLSX</span>
                            </button>
                            <button onClick={handleExportDOCX} className="bg-blue-700 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span className="hidden sm:inline">Export DOCX</span>
                            </button>
                            <button onClick={saveBudget} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-semibold shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                Simpan Anggaran
                            </button>
                        </div>
                    </div>
                    
                    <div className="my-4">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-600 w-12 text-right">{progressPercentage}%</span>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-[#06064F] text-white">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-xs uppercase">Tugas</th>
                                    <th className="p-3 font-semibold text-xs uppercase w-40">Anggaran Kegiatan</th>
                                    <th className="p-3 font-semibold text-xs uppercase w-40">Anggaran Transport</th>
                                    <th className="p-3 font-semibold text-xs uppercase w-40">Anggaran Pelaksana</th>
                                    <th className="p-3 font-semibold text-xs uppercase w-44">Jumlah</th>
                                    <th className="p-3 font-semibold text-xs uppercase w-40">File RAB</th>
                                    <th className="p-3 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {isLoading ? (
                                    <tr><td colSpan={7} className="text-center p-8 text-slate-500">Loading...</td></tr>
                                ) : budgetItems.length > 0 ? (
                                    budgetItems.map(item => {
                                        const total = item.anggaranKegiatan + item.anggaranTransport + item.anggaranPanitia;
                                        return (
                                        <tr key={item.id} className="hover:bg-slate-50 group">
                                            <td className="p-2 font-medium text-slate-700">{item.taskName}</td>
                                            {[ 'anggaranKegiatan', 'anggaranTransport', 'anggaranPanitia' ].map(field => (
                                                <td key={field} className="p-2">
                                                    <input 
                                                        type="text"
                                                        value={
                                                            editingField?.id === item.id && editingField?.field === field 
                                                            ? item[field as keyof Omit<BudgetItem, 'id' | 'taskName' | 'fileRAB'>]
                                                            : formatCurrency(item[field as keyof Omit<BudgetItem, 'id' | 'taskName' | 'fileRAB'>])
                                                        }
                                                        onFocus={() => setEditingField({ id: item.id, field })}
                                                        onBlur={() => setEditingField(null)}
                                                        onChange={(e) => handleInputChange(item.id, field as any, e.target.value)}
                                                        className="w-full bg-transparent p-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none text-blue-600 font-semibold"
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-2 font-bold text-slate-800 text-right pr-4">{formatCurrency(total)}</td>
                                            <td className="p-2 text-center align-middle">
                                                {item.fileRAB ? (
                                                    <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
                                                        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                        <span className="truncate" title={item.fileRAB}>{item.fileRAB}</span>
                                                        <button 
                                                            onClick={() => handleRemoveFile(item.id)}
                                                            className="text-slate-400 hover:text-red-500 shrink-0"
                                                            title="Hapus file"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleTriggerUpload(item.id)}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors" 
                                                        title="Unggah File RAB"
                                                    >
                                                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => deleteBudgetItem(item.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )})
                                ) : (
                                    <tr><td colSpan={7} className="text-center p-8 text-slate-500">Tidak ada tugas untuk bulan ini. Silakan tambahkan di To-Do List.</td></tr>
                                )}
                            </tbody>
                             <tfoot className="bg-slate-50">
                                <tr>
                                    <td className="p-3 font-bold text-slate-800 text-right" colSpan={4}>TOTAL</td>
                                    <td className="p-3 font-extrabold text-blue-700 text-base text-right pr-4" colSpan={1}>{formatCurrency(totalAnggaran)}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetPlanPage;