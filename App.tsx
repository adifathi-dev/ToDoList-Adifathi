import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import { useTasks } from './hooks/useTasks';

const App: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    currentDate,
    setCurrentDate
  } = useTasks();
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    const contentToPrint = printRef.current;
    if (!contentToPrint) return;

    // 1. Create a container for the print content
    const printContainer = document.createElement('div');
    document.body.appendChild(printContainer);

    // Style the container to be off-screen and sized for A4 landscape
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '1240px';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.padding = '20px';
    printContainer.style.fontFamily = 'sans-serif';

    const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });
    const year = currentDate.getFullYear();

    // 2. Add content to the container (Title, Cloned Table, Signature)
    printContainer.innerHTML = `
      <style>
        .print-title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; color: #1e293b; }
        .print-signature-container { display: flex; justify-content: flex-end; margin-top: 80px; padding-right: 20px; }
        .print-signature-block { text-align: center; width: 200px; color: #334155; }
        .print-signature-name { margin-top: 60px; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; }
        .print-signature-title { margin-top: 4px; font-size: 14px; }
      </style>
      <div class="print-title">Laporan Kegiatan - ${monthName} ${year}</div>
      <div id="cloned-content"></div>
      <div class="print-signature-container">
        <div class="print-signature-block">
          <div>Mengetahui,</div>
          <div class="print-signature-name">Komarudin, S.Pd.I</div>
          <div class="print-signature-title">Kepala Sekolah</div>
        </div>
      </div>
    `;
    
    const clonedContent = contentToPrint.cloneNode(true) as HTMLElement;
    const innerCard = clonedContent.querySelector('.print-container') as HTMLElement;
    if (innerCard) {
        innerCard.style.boxShadow = 'none';
        innerCard.style.border = '1px solid #e2e8f0';
    }
    printContainer.querySelector('#cloned-content')?.appendChild(clonedContent);
    

    // 3. Render the container using html2canvas
    const canvas = await html2canvas(printContainer, {
      scale: 3,
      useCORS: true,
      logging: false,
    });
    
    document.body.removeChild(printContainer);

    // 4. Create PDF and add the image
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
    
    if (finalHeight > pdfHeight) {
      finalHeight = pdfHeight;
      finalWidth = pdfHeight * ratio;
    }
    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    // 5. Save the PDF
    pdf.save(`Laporan_Kegiatan_${monthName}_${year}.pdf`);
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen font-sans text-sm text-slate-800">
      <Header onPrint={handlePrint} />
      <main className="p-4 sm:p-6">
        <div ref={printRef}>
            <div className="max-w-7xl mx-auto">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm print-container">
                    <div className="flex justify-between items-center mb-4 sm:mb-6 print:mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">TO DO LIST Adifathi</h1>
                        <p className="text-sm sm:text-base font-semibold text-slate-600">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-3">
                            <Sidebar 
                                tasks={tasks} 
                                currentDate={currentDate}
                                setCurrentDate={setCurrentDate}
                            />
                        </div>
                        <div className="lg:col-span-9">
                            <div className="mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-600 w-12 text-right">{progressPercentage}%</span>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div
                                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <TaskList
                                tasks={tasks}
                                onAddTask={addTask}
                                onUpdateTask={updateTask}
                                onDeleteTask={deleteTask}
                                onToggleTask={toggleTaskCompletion}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
