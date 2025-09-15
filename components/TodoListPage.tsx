import React, { useRef, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
  HeadingLevel, AlignmentType, WidthType
} from 'docx';
import { calculateSisaWaktu } from '../utils/dateUtils';

import Sidebar from './Sidebar';
import TaskList from './TaskList';
import { useTasks } from '../hooks/useTasks';
import FilterControls from './FilterControls';
import { Status, Priority, Task } from '../types';
import TaskModal from './TaskModal';

const TodoListPage: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    currentDate,
    setCurrentDate,
    saveTasks
  } = useTasks();
  
  const [selectedStatus, setSelectedStatus] = useState<Status | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const statusMatch = selectedStatus === 'All' || task.status === selectedStatus;
      const priorityMatch = selectedPriority === 'All' || task.priority === selectedPriority;
      const searchMatch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [tasks, selectedStatus, selectedPriority, searchTerm]);

  const printContentRef = useRef<HTMLDivElement>(null);

  const handleSaveNewTask = (taskData: Omit<Task, 'id' | 'completed' | 'updatedAt'>) => {
    addTask(taskData);
  };

  const handlePrint = async () => {
    const contentToPrint = printContentRef.current;
    if (!contentToPrint) return;

    // 1. Create a container for the print content, styled for rendering
    const printContainer = document.createElement('div');
    document.body.appendChild(printContainer);
    
    // Style the container to be off-screen and sized for A4 landscape to ensure consistent rendering
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '1123px'; // A4 landscape width at 96 DPI
    printContainer.style.backgroundColor = 'white';
    printContainer.style.padding = '40px';
    printContainer.style.fontFamily = 'sans-serif';

    const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
    const year = currentDate.getFullYear();
    const printDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // 2. Structure the print content with Title, Cloned Table, and a properly formatted Signature
    printContainer.innerHTML = `
      <style>
        body { font-family: 'sans-serif'; color: #333; }
        .print-title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 24px; color: #1e293b; }
        .print-signature-container { display: flex; justify-content: flex-end; margin-top: 80px; padding-right: 40px; }
        .print-signature-block { text-align: center; width: 250px; color: #334155; }
        .print-signature-name { margin-top: 70px; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 4px; }
        .print-signature-title { margin-top: 5px; font-size: 14px; }
      </style>
      <div class="print-title">Laporan Kegiatan - ${monthName} ${year}</div>
      <div id="cloned-content"></div>
      <div class="print-signature-container">
        <div class="print-signature-block">
          <div>Majalengka, ${printDate}</div>
          <div style="margin-top: 16px;">Mengetahui,</div>
          <div class="print-signature-title">Kepala Sekolah</div>
          <div class="print-signature-name">Komarudin, S.Pd.I</div>
        </div>
      </div>
    `;
    
    // Clone the target content to avoid affecting the live view
    const clonedContent = contentToPrint.cloneNode(true) as HTMLElement;
    printContainer.querySelector('#cloned-content')?.appendChild(clonedContent);
    
    // 3. Render the prepared container using html2canvas for high fidelity
    const canvas = await html2canvas(printContainer, {
      scale: 3, // Increase scale for higher resolution output
      useCORS: true,
      logging: false,
      windowWidth: printContainer.scrollWidth,
      windowHeight: printContainer.scrollHeight,
    });
    
    // Clean up the temporary container from the DOM
    document.body.removeChild(printContainer);

    // 4. Create PDF and add the rendered image, ensuring it fits perfectly
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps= pdf.getImageProperties(imgData);
    const ratio = imgProps.width / imgProps.height;
    
    let finalWidth = pdfWidth;
    let finalHeight = pdfWidth / ratio;
    
    // Adjust dimensions to fit within the page while maintaining aspect ratio
    if (finalHeight > pdfHeight) {
      finalHeight = pdfHeight;
      finalWidth = pdfHeight * ratio;
    }
    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    // 5. Save the generated PDF
    pdf.save(`Laporan_Kegiatan_${monthName}_${year}.pdf`);
  };

  const handleExportDocx = () => {
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
    const year = currentDate.getFullYear();
    const printDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const header = new TableRow({
        tableHeader: true,
        children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "NO", bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TUGAS", bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PRIORITAS", bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "STATUS", bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PELAKSANAAN", bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DEADLINE", bold: true })], alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "SISA WAKTU", bold: true })], alignment: AlignmentType.CENTER })] }),
        ],
    });

    const dataRows = filteredTasks.map((task, index) => {
      const sisaWaktu = calculateSisaWaktu(task.deadline);
      return new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph(task.name)] }),
            new TableCell({ children: [new Paragraph(task.priority)] }),
            new TableCell({ children: [new Paragraph(task.status)] }),
            new TableCell({ children: [new Paragraph(task.pelaksanaanStart)] }),
            new TableCell({ children: [new Paragraph(task.deadline)] }),
            new TableCell({ children: [new Paragraph({ text: String(sisaWaktu), alignment: AlignmentType.CENTER })] }),
        ],
      });
    });

    const table = new Table({
        rows: [header, ...dataRows],
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: `Laporan Kegiatan - ${monthName} ${year}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),
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
              new TextRun({ text: "Komarudin, S.Pd.I", bold: true, underline: {} })
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
        a.download = `Laporan_Kegiatan_${monthName}_${year}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
  };

  const completedTasks = filteredTasks.filter(task => task.completed).length;
  const totalTasks = filteredTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={handleSaveNewTask}
        />
        <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">TO DO LIST Adifathi</h1>
                <p className="text-sm sm:text-base font-semibold text-slate-600">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </div>
             <div className="flex items-center gap-3">
                <button
                    onClick={handleExportDocx}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 active:opacity-100 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span className="hidden sm:inline">Export DOCX</span>
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-[#06064F] text-white px-4 py-2 rounded-lg hover:opacity-90 active:opacity-100 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    <span className="hidden sm:inline">Cetak Laporan</span>
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
                <Sidebar 
                    tasks={filteredTasks} 
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                />
            </div>
            <div className="lg:col-span-9">
                <FilterControls
                    tasks={tasks}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    selectedPriority={selectedPriority}
                    onPriorityChange={setSelectedPriority}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onResetFilter={() => {
                        setSelectedStatus('All');
                        setSelectedPriority('All');
                        setSearchTerm('');
                    }}
                />
                <div className="my-4">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-600 w-12 text-right">{progressPercentage}%</span>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div
                                className="bg-orange-400 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="print-container" ref={printContentRef}>
                    <TaskList
                        tasks={filteredTasks}
                        onAddTask={() => setIsTaskModalOpen(true)}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                        onToggleTask={toggleTaskCompletion}
                        onSaveTasks={saveTasks}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default TodoListPage;