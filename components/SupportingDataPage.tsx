import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
  HeadingLevel, AlignmentType, WidthType
} from 'docx';
import * as XLSX from 'xlsx';
import { useTasks } from '../hooks/useTasks';
import { Task, Kepanitiaan } from '../types';

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
             <p className="text-xs text-center text-slate-500">Pilih bulan dan tahun untuk mengelola Data Pendukung Tugas.</p>
        </div>
    );
};

const SupportingDataPage: React.FC = () => {
    const { tasks, updateTask, currentDate, setCurrentDate } = useTasks();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<Partial<Task>>({});

    useEffect(() => {
        if (tasks.length > 0 && (!selectedTask || !tasks.find(t => t.id === selectedTask.id))) {
            setSelectedTask(tasks[0]);
        } else if (tasks.length === 0) {
            setSelectedTask(null);
        }
    }, [tasks, selectedTask]);

    useEffect(() => {
        setFormData(selectedTask ? { ...selectedTask } : {});
    }, [selectedTask]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleKepanitiaanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            kepanitiaan: {
                ...(prev.kepanitiaan as Kepanitiaan),
                [name]: value,
            }
        }));
    };

    const handleSave = () => {
        if (selectedTask && formData) {
            updateTask(selectedTask.id, formData);
            alert('Data pendukung berhasil disimpan!');
        }
    };

    const progressPercentage = useMemo(() => {
        if (tasks.length === 0) return 0;
        const fieldsToCheck: (keyof Task)[] = ['createdAt', 'perencanaanEnd', 'pelaksanaanStart', 'deadline', 'pelaporanStart', 'pelaporanEnd', 'penanggungJawab', 'kepanitiaan', 'tempat', 'suratTugas'];
        const totalPossibleFields = tasks.length * fieldsToCheck.length;
        
        let filledFields = 0;
        tasks.forEach(task => {
            fieldsToCheck.forEach(field => {
                if (field === 'kepanitiaan') {
                    const panitia = task.kepanitiaan;
                    if (panitia && (panitia.ketua || panitia.sekretaris || panitia.bendahara || panitia.koordinator || panitia.lainnya)) {
                        filledFields++;
                    }
                } else if (task[field]) {
                    filledFields++;
                }
            });
        });
        
        return totalPossibleFields > 0 ? Math.round((filledFields / totalPossibleFields) * 100) : 0;
    }, [tasks]);

    const formatDateForInput = (dateString: string | undefined) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };
    
    const formatKepanitiaanToString = (kepanitiaan?: Kepanitiaan) => {
        if (!kepanitiaan) return '';
        return Object.entries(kepanitiaan)
            .filter(([, value]) => value && String(value).trim() !== '')
            .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
            .join('; ');
    };

    const handleExportXLSX = () => {
        const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
        const year = currentDate.getFullYear();
        const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const headers = ["Tugas", "Perencanaan", "Pelaksanaan", "Pelaporan", "Penanggung Jawab", "Kepanitiaan", "Tempat", "Surat Tugas"];
        
        const data = tasks.map(task => [
            task.name,
            `${formatDateForInput(task.createdAt)} s/d ${formatDateForInput(task.perencanaanEnd)}`,
            `${formatDateForInput(task.pelaksanaanStart)} s/d ${formatDateForInput(task.deadline)}`,
            `${formatDateForInput(task.pelaporanStart)} s/d ${formatDateForInput(task.pelaporanEnd)}`,
            task.penanggungJawab,
            formatKepanitiaanToString(task.kepanitiaan),
            task.tempat || '',
            task.suratTugas || ''
        ]);

        const signatureBlock = [ [], [], ["", "", "", "", `Majalengka, ${printDate}`], [], ["", "", "", "", "Mengetahui,"], ["", "", "", "", "Kepala Sekolah"], [], [], [], ["", "", "", "", "KOMARUDIN, S.Pd.I"], ];

        const sheetData = [headers, ...data, ...signatureBlock];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet["!cols"] = [ { wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 40 }, { wch: 20 }, { wch: 20 } ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendukung");
        XLSX.writeFile(workbook, `Data_Pendukung_${monthName}_${year}.xlsx`);
    };

    const handleExportDOCX = () => {
        const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
        const year = currentDate.getFullYear();
        const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const createHeaderCell = (text: string) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })], shading: { fill: "06064F" }, });

        const header = new TableRow({ tableHeader: true, children: [ "Tugas", "Perencanaan", "Pelaksanaan", "Pelaporan", "Penanggung Jawab", "Kepanitiaan", "Tempat", "Surat Tugas"].map(createHeaderCell), });

        const dataRows = tasks.map(task => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(task.name)] }),
                new TableCell({ children: [new Paragraph(`${formatDateForInput(task.createdAt)} s/d ${formatDateForInput(task.perencanaanEnd)}`)] }),
                new TableCell({ children: [new Paragraph(`${formatDateForInput(task.pelaksanaanStart)} s/d ${formatDateForInput(task.deadline)}`)] }),
                new TableCell({ children: [new Paragraph(`${formatDateForInput(task.pelaporanStart)} s/d ${formatDateForInput(task.pelaporanEnd)}`)] }),
                new TableCell({ children: [new Paragraph(task.penanggungJawab)] }),
                new TableCell({ children: [new Paragraph(formatKepanitiaanToString(task.kepanitiaan))] }),
                new TableCell({ children: [new Paragraph(task.tempat || '')] }),
                new TableCell({ children: [new Paragraph(task.suratTugas || '')] }),
            ],
        }));

        const table = new Table({ rows: [header, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } });

        const doc = new Document({
          sections: [{
            children: [
              new Paragraph({ text: `Data Pendukung Tugas - ${monthName} ${year}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
              new Paragraph({ text: "", spacing: { after: 400 } }),
              table,
              new Paragraph({ text: "", spacing: { after: 800 } }),
              new Paragraph({ text: `Majalengka, ${printDate}`, alignment: AlignmentType.RIGHT }),
              new Paragraph({ text: "", spacing: { after: 200 } }),
              new Paragraph({ text: "Mengetahui,", alignment: AlignmentType.RIGHT }),
              new Paragraph({ text: "Kepala Sekolah", alignment: AlignmentType.RIGHT }),
              new Paragraph({ text: "", spacing: { after: 1200 } }),
              new Paragraph({ children: [new TextRun({ text: "KOMARUDIN, S.Pd.I", bold: true, underline: {} })], alignment: AlignmentType.RIGHT }),
            ],
          }],
        });

        Packer.toBlob(doc).then(blob => { const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Data_Pendukung_${monthName}_${year}.docx`; a.click(); window.URL.revokeObjectURL(url); });
    };
    
    const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-4 space-y-4">
                <MonthYearSelector currentDate={currentDate} setCurrentDate={setCurrentDate} />
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-800 text-sm mb-3">Daftar Tugas Bulan Ini</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {tasks.length > 0 ? tasks.map(task => (
                            <button
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${selectedTask?.id === task.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}
                            >
                                <p className="font-semibold text-sm">{task.name}</p>
                                <p className="text-xs text-slate-500">Deadline: {task.deadline}</p>
                            </button>
                        )) : (
                            <p className="text-center text-slate-500 py-4 text-xs">Tidak ada tugas untuk bulan ini.</p>
                        )}
                    </div>
                </div>
            </aside>
            <div className="lg:col-span-8">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Detail Data Pendukung Tugas</h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={handleExportXLSX} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span className="hidden sm:inline">XLSX</span>
                            </button>
                            <button onClick={handleExportDOCX} className="bg-blue-700 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                <span className="hidden sm:inline">DOCX</span>
                            </button>
                            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-semibold shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                Simpan Data
                            </button>
                        </div>
                    </div>
                    
                    <div className="my-4">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Progres Kelengkapan Data</p>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-600 w-12 text-right">{progressPercentage}%</span>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {selectedTask ? (
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">{selectedTask.name}</h3>
                            
                            <div className="space-y-4">
                                <div className="font-semibold text-slate-700 text-sm border-b pb-2">Jadwal</div>
                                <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                                    <h4 className="font-medium text-slate-600">Perencanaan</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Mulai</label>
                                            <input type="date" name="createdAt" value={formatDateForInput(formData.createdAt)} onChange={handleInputChange} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Selesai</label>
                                            <input type="date" name="perencanaanEnd" value={formatDateForInput(formData.perencanaanEnd)} onChange={handleInputChange} className={inputClasses} />
                                        </div>
                                    </div>
                                    <h4 className="font-medium text-slate-600 pt-2">Pelaksanaan</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Mulai</label>
                                            <input type="date" name="pelaksanaanStart" value={formatDateForInput(formData.pelaksanaanStart)} onChange={handleInputChange} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Deadline</label>
                                            <input type="date" name="deadline" value={formatDateForInput(formData.deadline)} onChange={handleInputChange} className={inputClasses} />
                                        </div>
                                    </div>
                                    <h4 className="font-medium text-slate-600 pt-2">Pelaporan</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Mulai</label>
                                            <input type="date" name="pelaporanStart" value={formatDateForInput(formData.pelaporanStart)} onChange={handleInputChange} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Berakhir</label>
                                            <input type="date" name="pelaporanEnd" value={formatDateForInput(formData.pelaporanEnd)} onChange={handleInputChange} className={inputClasses} />
                                        </div>
                                    </div>
                                </div>

                                <div className="font-semibold text-slate-700 text-sm border-b pb-2 pt-4">Detail Pelaksana</div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Penanggung Jawab</label>
                                    <input type="text" name="penanggungJawab" value={formData.penanggungJawab || ''} onChange={handleInputChange} className={inputClasses} />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                                    <h4 className="font-medium text-slate-600">Kepanitiaan</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Ketua</label>
                                            <input type="text" name="ketua" value={formData.kepanitiaan?.ketua || ''} onChange={handleKepanitiaanChange} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Sekretaris</label>
                                            <input type="text" name="sekretaris" value={formData.kepanitiaan?.sekretaris || ''} onChange={handleKepanitiaanChange} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Bendahara</label>
                                            <input type="text" name="bendahara" value={formData.kepanitiaan?.bendahara || ''} onChange={handleKepanitiaanChange} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Koordinator</label>
                                            <input type="text" name="koordinator" value={formData.kepanitiaan?.koordinator || ''} onChange={handleKepanitiaanChange} className={inputClasses} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Lainnya</label>
                                            <input type="text" name="lainnya" value={formData.kepanitiaan?.lainnya || ''} onChange={handleKepanitiaanChange} className={inputClasses} />
                                        </div>
                                    </div>
                                </div>


                                <div className="font-semibold text-slate-700 text-sm border-b pb-2 pt-4">Lainnya</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Tempat</label>
                                        <input type="text" name="tempat" value={formData.tempat || ''} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Surat Tugas (Nomor)</label>
                                        <input type="text" name="suratTugas" value={formData.suratTugas || ''} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500 border-t border-slate-200 mt-4">
                            <p>Pilih tugas dari daftar di sebelah kiri untuk melihat atau mengedit data pendukung.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportingDataPage;