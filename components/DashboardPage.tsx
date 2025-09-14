import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
  HeadingLevel, AlignmentType, WidthType, ImageRun
} from 'docx';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import type { Chart as ChartJSType } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Task, BudgetItem, ExpenseItem, Status, Priority } from '../types';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DetailItem {
    id: string;
    taskName: string;
    status: Status;
    priority: Priority;
    anggaranKegiatan: number;
    anggaranTransport: number;
    anggaranPanitia: number;
    biayaKegiatan: number;
    biayaTransport: number;
    biayaPanitia: number;
}

interface SummaryRow {
    month: string;
    taskCount: number;
    totalAnggaran: number;
    totalBiaya: number;
    selisih: number;
    keterangan: string;
    details: DetailItem[];
}

const statusBgColors: { [key in Status]: string } = {
    [Status.Selesai]: 'bg-teal-100 text-teal-800',
    [Status.InProgress]: 'bg-orange-100 text-orange-800',
    [Status.NeedApproval]: 'bg-blue-100 text-blue-800',
    [Status.Pending]: 'bg-purple-100 text-purple-800',
};

const DashboardPage: React.FC = () => {
    const [summaryData, setSummaryData] = useState<SummaryRow[]>([]);
    const [year, setYear] = useState(new Date(2025, 8, 1).getFullYear());
    const [activeTab, setActiveTab] = useState<'report' | 'chart'>('report');
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const chartRef = useRef<ChartJSType<'bar', (number | null)[], unknown> | null>(null);
    
    // Filters for Report Tab
    const [selectedMonth, setSelectedMonth] = useState<string>('All');
    const [selectedStatus, setSelectedStatus] = useState<Status | 'All'>('All');
    const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');

    // Filters for Chart Tab
    const [chartFilterMonth, setChartFilterMonth] = useState<string>('All');
    const [chartFilterStatus, setChartFilterStatus] = useState<Status | 'All'>('All');
    const [chartFilterPriority, setChartFilterPriority] = useState<Priority | 'All'>('All');

    useEffect(() => {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const data = months.map(month => {
            const date = new Date(year, month, 1);
            const taskKey = `tasks_${year}_${month}`;
            const budgetKey = `budget_${year}_${month}`;
            const expenseKey = `expenses_${year}_${month}`;

            const tasks: Task[] = JSON.parse(localStorage.getItem(taskKey) || '[]');
            const budgetItems: BudgetItem[] = JSON.parse(localStorage.getItem(budgetKey) || '[]');
            const expenseItems: ExpenseItem[] = JSON.parse(localStorage.getItem(expenseKey) || '[]');

            const totalAnggaran = budgetItems.reduce((sum, item) => sum + item.anggaranKegiatan + item.anggaranTransport + item.anggaranPanitia, 0);
            const totalBiaya = expenseItems.reduce((sum, item) => sum + item.biayaKegiatan + item.biayaTransport + item.biayaPanitia, 0);
            const selisih = totalAnggaran - totalBiaya;

            let keterangan;
            if (selisih > 0) {
                keterangan = 'Sisa Anggaran';
            } else if (selisih < 0) {
                keterangan = 'Defisit Anggaran';
            } else {
                keterangan = 'Anggaran Sesuai';
            }

            const budgetMap = new Map(budgetItems.map(i => [i.id, i]));
            const expenseMap = new Map(expenseItems.map(i => [i.id, i]));

            const details = tasks.map(task => {
                const budget = budgetMap.get(task.id) || { anggaranKegiatan: 0, anggaranTransport: 0, anggaranPanitia: 0 };
                const expense = expenseMap.get(task.id) || { biayaKegiatan: 0, biayaTransport: 0, biayaPanitia: 0 };
                return {
                    id: task.id,
                    taskName: task.name,
                    status: task.status,
                    priority: task.priority,
                    anggaranKegiatan: budget.anggaranKegiatan,
                    anggaranTransport: budget.anggaranTransport,
                    anggaranPanitia: budget.anggaranPanitia,
                    biayaKegiatan: expense.biayaKegiatan,
                    biayaTransport: expense.biayaTransport,
                    biayaPanitia: expense.biayaPanitia,
                };
            });


            return {
                month: date.toLocaleString('id-ID', { month: 'long' }),
                taskCount: tasks.length,
                totalAnggaran,
                totalBiaya,
                selisih,
                keterangan,
                details,
            };
        });

        setSummaryData(data);

    }, [year]);

    const filteredReportData = useMemo(() => {
        if (selectedMonth === 'All') {
            return summaryData;
        }
        return summaryData.filter(data => data.month === selectedMonth);
    }, [summaryData, selectedMonth]);

    const chartSummaryData = useMemo(() => {
        if (!summaryData) return [];
        
        const monthFilteredData = chartFilterMonth === 'All'
            ? summaryData
            : summaryData.filter(monthData => monthData.month === chartFilterMonth);

        return monthFilteredData.map(monthData => {
            const filteredDetails = monthData.details.filter(detail => {
                const statusMatch = chartFilterStatus === 'All' || detail.status === chartFilterStatus;
                const priorityMatch = chartFilterPriority === 'All' || detail.priority === chartFilterPriority;
                return statusMatch && priorityMatch;
            });

            const totalAnggaran = filteredDetails.reduce((sum, item) => sum + item.anggaranKegiatan + item.anggaranTransport + item.anggaranPanitia, 0);
            const totalBiaya = filteredDetails.reduce((sum, item) => sum + item.biayaKegiatan + item.biayaTransport + item.biayaPanitia, 0);

            return {
                ...monthData,
                totalAnggaran,
                totalBiaya,
                details: filteredDetails,
            };
        });
    }, [summaryData, chartFilterMonth, chartFilterStatus, chartFilterPriority]);


    const totals = useMemo(() => {
        return filteredReportData.reduce((acc, month) => {
            acc.taskCount += month.taskCount;
            acc.totalAnggaran += month.totalAnggaran;
            acc.totalBiaya += month.totalBiaya;
            acc.selisih += month.selisih;
            return acc;
        }, { taskCount: 0, totalAnggaran: 0, totalBiaya: 0, selisih: 0 });
    }, [filteredReportData]);
    
    const handleYearChange = (offset: number) => {
        setYear(prev => prev + offset);
    };
    
    const handleRowClick = (month: string) => {
        setExpandedMonth(prev => (prev === month ? null : month));
    };

    const getExportTitle = () => {
        if (activeTab === 'report') {
            const monthPart = selectedMonth === 'All' ? 'Tahunan' : selectedMonth;
            return `Laporan - ${monthPart} ${year}`;
        } else { // chart tab
            const monthPart = chartFilterMonth === 'All' ? `Tahunan ${year}` : `${chartFilterMonth} ${year}`;
            return `Analisis Grafik Perbandingan - ${monthPart}`;
        }
    };

    const getExportFilename = (extension: 'xlsx' | 'docx') => {
        if (activeTab === 'report') {
            const monthPart = selectedMonth === 'All' ? 'Tahunan' : selectedMonth;
            return `Laporan_${monthPart}_${year}.${extension}`;
        } else { // chart tab
            const monthPart = chartFilterMonth === 'All' ? 'Tahunan' : chartFilterMonth.replace(/\s/g, '_');
            return `Analisis_Grafik_${monthPart}_${year}.${extension}`;
        }
    };
    
    const handleExportXLSX = async () => {
        const printDate = new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const title = getExportTitle();
        const signatureBlock = [
            [], [],
            ["", "", "", "", `Majalengka, ${printDate}`], [],
            ["", "", "", "", "Mengetahui,"],
            ["", "", "", "", "Kepala Sekolah"], [], [], [],
            ["", "", "", "", "KOMARUDIN, S.Pd.I"],
        ];

        let sheetData: (string | number)[][] = [];
        let colWidths: { wch: number }[] = [];

        if (activeTab === 'report') {
            const headers = ["Bulan", "Jumlah Tugas", "Total Anggaran", "Total Biaya", "Selisih", "Keterangan"];
            const data = filteredReportData.map(item => [item.month, item.taskCount, item.totalAnggaran, item.totalBiaya, item.selisih, item.keterangan]);
            const totalRow = [`TOTAL ${selectedMonth !== 'All' ? selectedMonth.toUpperCase() : year}`, totals.taskCount, totals.totalAnggaran, totals.totalBiaya, totals.selisih, ""];
            
            sheetData = [[title], [], headers, ...data, totalRow, ...signatureBlock];
            colWidths = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
        } else {
            const description = generateChartDescription() || "Tidak ada data untuk dianalisis.";
            const descriptionRows = description.split('\n').map(line => [line]);
            sheetData = [[title], [], ...descriptionRows, ...signatureBlock];
            colWidths = [{ wch: 120 }];
        }

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet["!cols"] = colWidths;
        
        // Apply currency format for report tab
        if (activeTab === 'report') {
            for (let i = 4; i <= filteredReportData.length + 4; i++) {
                for (let j = 2; j <= 4; j++) {
                    const cell_address = XLSX.utils.encode_cell({c:j, r:i-1});
                    if(worksheet[cell_address]) {
                        worksheet[cell_address].t = 'n';
                        worksheet[cell_address].z = '"Rp"#,##0';
                    }
                }
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan`);
        XLSX.writeFile(workbook, getExportFilename('xlsx'));
    };

    const handleExportDOCX = async () => {
        const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const title = getExportTitle();
        
        const signatureParagraphs = [
            new Paragraph({ text: "", spacing: { after: 800 } }),
            new Paragraph({ text: `Majalengka, ${printDate}`, alignment: AlignmentType.RIGHT }),
            new Paragraph({ text: "", spacing: { after: 200 } }),
            new Paragraph({ text: "Mengetahui,", alignment: AlignmentType.RIGHT }),
            new Paragraph({ text: "Kepala Sekolah", alignment: AlignmentType.RIGHT }),
            new Paragraph({ text: "", spacing: { after: 1200 } }),
            new Paragraph({ children: [new TextRun({ text: "KOMARUDIN, S.Pd.I", bold: true, underline: {} })], alignment: AlignmentType.RIGHT }),
        ];

        const docChildren: (Paragraph | Table)[] = [
            new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
        ];

        if (activeTab === 'report') {
            const createHeaderCell = (text: string) => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })], alignment: AlignmentType.CENTER })],
                shading: { fill: "06064F" },
            });
            const header = new TableRow({
                tableHeader: true,
                children: [ createHeaderCell("Bulan"), createHeaderCell("Jumlah Tugas"), createHeaderCell("Total Anggaran"), createHeaderCell("Total Biaya"), createHeaderCell("Selisih"), createHeaderCell("Keterangan"), ],
            });
            const dataRows = filteredReportData.map(item => new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(item.month)] }),
                    new TableCell({ children: [new Paragraph({ text: String(item.taskCount), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.totalAnggaran), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.totalBiaya), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.selisih), alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph(item.keterangan)] }),
                ],
            }));
            const totalRow = new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `TOTAL ${selectedMonth !== 'All' ? selectedMonth.toUpperCase() : year}`, bold: true })]})] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(totals.taskCount), bold: true })], alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(totals.totalAnggaran), bold: true })], alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(totals.totalBiaya), bold: true })], alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(totals.selisih), bold: true })], alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph('')] }),
                ],
            });
            const table = new Table({ rows: [header, ...dataRows, totalRow], width: { size: 100, type: WidthType.PERCENTAGE } });
            docChildren.push(table);
        } else {
            // Chart Tab Export
            const chartImageBase64 = chartRef.current?.toBase64Image();
            if (chartImageBase64) {
                try {
                    const imageBlob = await (await fetch(chartImageBase64)).blob();
                    // FIX: The `ImageRun` constructor options for a buffer requires a `type` property to resolve ambiguity in the discriminated union type `IImageOptions`.
                    const imageRun = new ImageRun({
                        type: "buffer",
                        data: await imageBlob.arrayBuffer(),
                        transformation: { width: 600, height: 350 },
                    });
                    docChildren.push(new Paragraph({ children: [imageRun], alignment: AlignmentType.CENTER }));
                } catch (e) {
                    console.error("Could not fetch or process chart image", e);
                    docChildren.push(new Paragraph("Gambar grafik tidak dapat dimuat."));
                }
            } else {
                 docChildren.push(new Paragraph("Tidak ada grafik untuk ditampilkan."));
            }
            
            docChildren.push(new Paragraph({ text: "", spacing: { after: 400 } }));
            const description = generateChartDescription() || "Tidak ada data untuk dianalisis.";
            description.split('\n').forEach(line => {
                docChildren.push(new Paragraph(line));
            });
        }

        docChildren.push(...signatureParagraphs);

        const doc = new Document({ sections: [{ children: docChildren }] });
        
        Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = getExportFilename('docx');
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    };

    const summaryChartData = {
      labels: chartSummaryData.map(d => d.month),
      datasets: [
        {
          label: 'Total Anggaran',
          data: chartSummaryData.map(d => d.totalAnggaran),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Biaya',
          data: chartSummaryData.map(d => d.totalBiaya),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    const summaryChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        onClick: (event: any, elements: any[]) => {
            if (elements.length > 0) {
                const elementIndex = elements[0].index;
                const monthName = chartSummaryData[elementIndex].month;
                handleRowClick(monthName);
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Perbandingan Anggaran dan Biaya Tahun ${year}`,
                font: {
                    size: 16,
                    weight: 'bold',
                },
                color: '#1e293b',
                padding: { bottom: 20 }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value: any) {
                        return new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(value);
                    }
                }
            }
        }
    };
    
    const detailedTaskChart = useMemo(() => {
        if (chartFilterMonth === 'All' || !chartSummaryData.length) {
            return null;
        }
    
        const monthData = chartSummaryData.find(d => d.month === chartFilterMonth);
        const filteredDetails = monthData?.details || [];
    
        if (filteredDetails.length === 0) {
            return { data: { labels: [], datasets: [] }, options: {} };
        }
    
        const wrapText = (text: string, maxChars: number): string[] => {
            const words = text.split(' ');
            let lines: string[] = [];
            let currentLine = '';
            for (const word of words) {
                if ((currentLine + ' ' + word).length > maxChars) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = currentLine ? `${currentLine} ${word}` : word;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        };

        const labels = filteredDetails.map(d => {
            const totalAnggaran = d.anggaranKegiatan + d.anggaranTransport + d.anggaranPanitia;
            const totalBiaya = d.biayaKegiatan + d.biayaTransport + d.biayaPanitia;
            const selisih = totalAnggaran - totalBiaya;
            let keterangan = selisih > 0 ? 'Sisa' : selisih < 0 ? 'Defisit' : 'Sesuai';
            
            const taskNameLines = wrapText(d.taskName, 25);
            return [
                ...taskNameLines,
                `Selisih: ${formatCurrency(selisih)}`,
                `(${keterangan})`
            ];
        });

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Anggaran Kegiatan',
                    data: filteredDetails.map(d => d.anggaranKegiatan),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    stack: 'Anggaran',
                },
                {
                    label: 'Anggaran Transport',
                    data: filteredDetails.map(d => d.anggaranTransport),
                    backgroundColor: 'rgba(255, 159, 64, 0.7)',
                    stack: 'Anggaran',
                },
                {
                    label: 'Anggaran Pelaksana',
                    data: filteredDetails.map(d => d.anggaranPanitia),
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    stack: 'Anggaran',
                },
                 {
                    label: 'Biaya Kegiatan',
                    data: filteredDetails.map(d => d.biayaKegiatan),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    stack: 'Biaya',
                },
                {
                    label: 'Biaya Transport',
                    data: filteredDetails.map(d => d.biayaTransport),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    stack: 'Biaya',
                },
                {
                    label: 'Biaya Pelaksana',
                    data: filteredDetails.map(d => d.biayaPanitia),
                    backgroundColor: 'rgba(255, 205, 86, 0.7)',
                    stack: 'Biaya',
                },
            ],
        };
        
        const options: ChartOptions<'bar'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' as const },
                title: {
                    display: true,
                    text: `Rincian per Tugas - ${chartFilterMonth} ${year}`,
                    font: { size: 16, weight: 'bold' },
                    color: '#1e293b',
                    padding: { bottom: 20 },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
                    },
                },
            },
            scales: {
                x: { 
                    stacked: true,
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                 },
                y: { 
                    stacked: true,
                    ticks: {
                        callback: (value) => new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(Number(value)),
                    },
                },
            },
        };
        
        return { data, options };
    }, [chartSummaryData, year, chartFilterMonth]);

    const generateChartDescription = () => {
        if (activeTab !== 'chart') return null;

        const analyzeTaskPerformance = (task: DetailItem): string => {
            const totalAnggaran = task.anggaranKegiatan + task.anggaranTransport + task.anggaranPanitia;
            const totalBiaya = task.biayaKegiatan + task.biayaTransport + task.biayaPanitia;
            const selisih = totalAnggaran - totalBiaya;
    
            // Handle zero budget or expense cases first
            if (totalAnggaran === 0) {
                return `\n\n• Tugas "${task.taskName}": Belum memiliki alokasi anggaran. Saran: Segera susun rencana anggaran untuk tugas ini agar memiliki acuan biaya yang jelas dan terukur.`;
            }
    
            if (totalBiaya === 0) {
                let suggestion = "";
                switch(task.status) {
                    case Status.Selesai:
                        suggestion = "Tugas telah selesai namun biaya belum dilaporkan. Segera lengkapi laporan realisasi biaya untuk evaluasi akhir.";
                        break;
                    case Status.InProgress:
                        suggestion = "Tugas sedang berjalan. Lakukan pembaruan laporan biaya secara berkala seiring adanya pengeluaran.";
                        break;
                    default:
                        suggestion = "Laporan realisasi biaya belum dibuat. Segera catat dan laporkan biaya setelah ada pengeluaran pertama.";
                        break;
                }
                return `\n\n• Tugas "${task.taskName}": Realisasi biaya masih Rp 0 dari anggaran ${formatCurrency(totalAnggaran)}. Saran: ${suggestion}`;
            }
    
            // Standard performance analysis
            let performanceStatus: string;
            let commentary: string;
            let suggestion: string;
    
            if (selisih > 0) {
                performanceStatus = "hemat biaya";
                commentary = "Kinerja biaya untuk tugas ini sangat baik, berhasil menghemat anggaran.";
                suggestion = "Pertahankan efisiensi ini. Strategi penghematan yang diterapkan bisa menjadi contoh untuk tugas-tugas lainnya.";
            } else if (selisih === 0) {
                performanceStatus = "sesuai anggaran";
                commentary = "Realisasi biaya sudah tepat sesuai dengan perencanaan.";
                suggestion = "Penyusunan dan kontrol anggaran sudah baik. Terus pantau realisasi agar tetap sesuai rencana.";
            } else {
                performanceStatus = "melebihi anggaran (defisit)";
                commentary = "Perlu perhatian lebih pada manajemen biaya untuk tugas ini karena terjadi pembengkakan.";
                suggestion = `Lakukan evaluasi pada rincian biaya yang membengkak untuk menemukan potensi efisiensi pada perencanaan tugas serupa di masa depan.`;
            }
    
            // Add status-based suggestions
            switch (task.status) {
                case Status.Selesai:
                    suggestion += " Hasil evaluasi tugas ini dapat menjadi pelajaran berharga untuk perencanaan proyek selanjutnya.";
                    break;
                case Status.InProgress:
                    suggestion += " Pantau sisa anggaran dengan cermat untuk memastikan tidak ada pembengkakan biaya lebih lanjut hingga tugas selesai.";
                    break;
                case Status.NeedApproval:
                    suggestion += " Jika ada perubahan anggaran yang diperlukan akibat defisit, segera proses persetujuan agar tidak menghambat kelancaran tugas.";
                    break;
                case Status.Pending:
                    suggestion += " Pastikan anggaran yang ada masih relevan dengan kondisi saat ini sebelum memulai tugas.";
                    break;
            }
    
            let breakdownAnalysis = [];
            if (task.anggaranKegiatan - task.biayaKegiatan < 0) breakdownAnalysis.push(`biaya Kegiatan (defisit ${formatCurrency(Math.abs(task.anggaranKegiatan - task.biayaKegiatan))})`);
            if (task.anggaranTransport - task.biayaTransport < 0) breakdownAnalysis.push(`biaya Transport (defisit ${formatCurrency(Math.abs(task.anggaranTransport - task.biayaTransport))})`);
            if (task.anggaranPanitia - task.biayaPanitia < 0) breakdownAnalysis.push(`biaya Pelaksana (defisit ${formatCurrency(Math.abs(task.anggaranPanitia - task.biayaPanitia))})`);
            
            let narrative = `\n\n• Tugas "${task.taskName}": Realisasi biaya ${performanceStatus} dengan selisih ${formatCurrency(selisih)}. ${commentary}`;
    
            if (breakdownAnalysis.length > 0) {
                narrative += ` Defisit terutama terjadi pada ${breakdownAnalysis.join(', ')}.`;
            }
    
            narrative += ` Saran: ${suggestion}`;
            return narrative;
        };

        if (chartFilterMonth === 'All') {
            const totalAnggaran = chartSummaryData.reduce((sum, item) => sum + item.totalAnggaran, 0);
            const totalBiaya = chartSummaryData.reduce((sum, item) => sum + item.totalBiaya, 0);
            const selisih = totalAnggaran - totalBiaya;

            if (totalAnggaran === 0 && totalBiaya === 0) {
                return `Tidak ada data anggaran atau biaya untuk tahun ${year} berdasarkan filter yang dipilih.`;
            }
            
            const monthWithHighestBudget = chartSummaryData.reduce((max, month) => month.totalAnggaran > max.totalAnggaran ? month : max, { month: '-', totalAnggaran: 0 });
            const monthWithHighestExpense = chartSummaryData.reduce((max, month) => month.totalBiaya > max.totalBiaya ? month : max, { month: '-', totalBiaya: 0 });

            let narrative = `Untuk tahun ${year}, total anggaran yang direncanakan adalah ${formatCurrency(totalAnggaran)} dengan realisasi biaya sebesar ${formatCurrency(totalBiaya)}. Hal ini menghasilkan ${selisih >= 0 ? 'sisa anggaran' : 'defisit'} sebesar ${formatCurrency(Math.abs(selisih))}.`;
            if(monthWithHighestBudget.totalAnggaran > 0) {
                 narrative += ` Bulan dengan alokasi anggaran tertinggi adalah ${monthWithHighestBudget.month} (${formatCurrency(monthWithHighestBudget.totalAnggaran)}).`;
            }
            if(monthWithHighestExpense.totalBiaya > 0) {
                narrative += ` Realisasi biaya tertinggi terjadi pada bulan ${monthWithHighestExpense.month} (${formatCurrency(monthWithHighestExpense.totalBiaya)}).`;
            }
            
            if (selisih < 0) {
                narrative += "\n\nKesimpulan Tahunan: Secara keseluruhan, disarankan untuk melakukan evaluasi anggaran tahunan, terutama pada bulan-bulan dengan defisit tertinggi, untuk meningkatkan kontrol biaya di masa mendatang."
            } else {
                narrative += "\n\nKesimpulan Tahunan: Kinerja anggaran tahunan secara umum sudah baik. Pertahankan kontrol dan efisiensi yang sudah berjalan."
            }
            return narrative;

        } else { // Detailed monthly view
            const monthData = chartSummaryData.find(d => d.month === chartFilterMonth);
            const filteredDetails = monthData?.details || [];

            if (filteredDetails.length === 0) {
                return `Tidak ada tugas yang sesuai dengan filter pada bulan ${chartFilterMonth}.`;
            }

            const totalAnggaran = filteredDetails.reduce((sum, item) => sum + item.anggaranKegiatan + item.anggaranTransport + item.anggaranPanitia, 0);
            const totalBiaya = filteredDetails.reduce((sum, item) => sum + item.biayaKegiatan + item.biayaTransport + item.biayaPanitia, 0);
            const selisih = totalAnggaran - totalBiaya;

            let narrative = `Pada bulan ${chartFilterMonth}, analisis untuk ${filteredDetails.length} tugas yang ditampilkan menunjukkan total anggaran ${formatCurrency(totalAnggaran)} dan total biaya ${formatCurrency(totalBiaya)}, menghasilkan ${selisih >= 0 ? 'sisa anggaran' : 'defisit'} sebesar ${formatCurrency(Math.abs(selisih))}.`;
            
            narrative += "\n\nAnalisis Rincian per Tugas:";
        
            filteredDetails.forEach(task => {
                narrative += analyzeTaskPerformance(task);
            });

            narrative += "\n\nKesimpulan Bulanan: ";
            if (selisih < 0) {
                narrative += `Kinerja keuangan bulan ${chartFilterMonth} mengalami defisit. Perlu dilakukan evaluasi mendalam pada tugas-tugas yang melebihi anggaran untuk mencegah hal serupa terjadi di masa depan.`;
            } else {
                narrative += `Bulan ${chartFilterMonth} menunjukkan kinerja keuangan yang baik dengan adanya sisa anggaran. Strategi efisiensi yang berhasil dapat diterapkan sebagai contoh untuk perencanaan bulan berikutnya.`;
            }
            
            return narrative;
        }
    };


    const renderDetailsContent = (details: DetailItem[], statusFilter: Status | 'All', priorityFilter: Priority | 'All') => {
        const filteredDetails = details.filter(detail => {
            const statusMatch = statusFilter === 'All' || detail.status === statusFilter;
            const priorityMatch = priorityFilter === 'All' || detail.priority === priorityFilter;
            return statusMatch && priorityMatch;
        });

        return (
            <div className="p-2">
                {filteredDetails.length > 0 ? (
                    <div className="space-y-3">
                        {filteredDetails.map(detail => {
                            const totalAnggaran = detail.anggaranKegiatan + detail.anggaranTransport + detail.anggaranPanitia;
                            const totalBiaya = detail.biayaKegiatan + detail.biayaTransport + detail.biayaPanitia;
                            const selisih = totalAnggaran - totalBiaya;
                            
                            let keterangan, keteranganColor;
                            if (selisih > 0) {
                                keterangan = 'Sisa Anggaran';
                                keteranganColor = 'text-green-700';
                            } else if (selisih < 0) {
                                keterangan = 'Defisit Anggaran';
                                keteranganColor = 'text-red-700';
                            } else {
                                keterangan = 'Anggaran Sesuai';
                                keteranganColor = 'text-slate-600';
                            }

                            return (
                                <div key={detail.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                    <div className={`px-3 py-2 font-bold text-sm ${statusBgColors[detail.status]}`}>
                                        {detail.taskName} <span className="font-normal">({detail.status})</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    <th className="p-2 text-left font-semibold text-slate-600 uppercase">JENIS</th>
                                                    <th className="p-2 text-right font-semibold text-slate-600 uppercase">Anggaran</th>
                                                    <th className="p-2 text-right font-semibold text-slate-600 uppercase">Biaya</th>
                                                    <th className="p-2 text-right font-semibold text-slate-600 uppercase">Selisih</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                    <tr>
                                                    <td className="p-2 pl-4 text-slate-600">Kegiatan</td>
                                                    <td className="p-2 text-right text-blue-600">{formatCurrency(detail.anggaranKegiatan)}</td>
                                                    <td className="p-2 text-right text-green-600">{formatCurrency(detail.biayaKegiatan)}</td>
                                                    <td className={`p-2 text-right font-medium ${detail.anggaranKegiatan - detail.biayaKegiatan >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatCurrency(detail.anggaranKegiatan - detail.biayaKegiatan)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 pl-4 text-slate-600">Transport</td>
                                                    <td className="p-2 text-right text-blue-600">{formatCurrency(detail.anggaranTransport)}</td>
                                                    <td className="p-2 text-right text-green-600">{formatCurrency(detail.biayaTransport)}</td>
                                                    <td className={`p-2 text-right font-medium ${detail.anggaranTransport - detail.biayaTransport >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatCurrency(detail.anggaranTransport - detail.biayaTransport)}</td>
                                                </tr>
                                                    <tr>
                                                    <td className="p-2 pl-4 text-slate-600">Pelaksana</td>
                                                    <td className="p-2 text-right text-blue-600">{formatCurrency(detail.anggaranPanitia)}</td>
                                                    <td className="p-2 text-right text-green-600">{formatCurrency(detail.biayaPanitia)}</td>
                                                    <td className={`p-2 text-right font-medium ${detail.anggaranPanitia - detail.biayaPanitia >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatCurrency(detail.anggaranPanitia - detail.biayaPanitia)}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot className="bg-slate-100 font-bold">
                                                <tr>
                                                    <td className="p-2 pl-4 text-slate-800">TOTAL</td>
                                                    <td className="p-2 text-right text-blue-700">{formatCurrency(totalAnggaran)}</td>
                                                    <td className="p-2 text-right text-green-700">{formatCurrency(totalBiaya)}</td>
                                                    <td className={`p-2 text-right ${selisih >= 0 ? 'text-green-800' : 'text-red-700'}`}>{formatCurrency(selisih)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2 pl-4 text-slate-800 uppercase" colSpan={3}>Keterangan</td>
                                                    <td className={`p-2 text-right ${keteranganColor}`}>{keterangan}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-4">Tidak ada rincian tugas yang sesuai dengan filter.</p>
                )}
            </div>
        );
    };

    const expandedData = summaryData.find(d => d.month === expandedMonth);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard Laporan {year}</h1>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                         <button onClick={handleExportXLSX} className="bg-green-700 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span className="hidden sm:inline">XLSX</span>
                        </button>
                        <button onClick={handleExportDOCX} className="bg-blue-700 text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span className="hidden sm:inline">DOCX</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <button onClick={() => handleYearChange(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <span className="font-bold text-sm text-slate-800">{year}</span>
                        <button onClick={() => handleYearChange(1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mb-6 border-b border-slate-200">
                <nav className="-mb-px flex gap-4" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'report'
                                ? 'border-[#06064F] text-[#06064F]'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Laporan
                    </button>
                    <button
                        onClick={() => setActiveTab('chart')}
                        className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'chart'
                                ? 'border-[#06064F] text-[#06064F]'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Grafik Perbandingan
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'report' && (
                    <>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                             <div className="flex-1">
                                <label htmlFor="month-filter-dashboard" className="block text-xs font-medium text-slate-600 mb-1">Filter Laporan by Bulan</label>
                                <select
                                    id="month-filter-dashboard"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                >
                                    <option value="All">Semua Bulan</option>
                                    {summaryData.map(data => (
                                        <option key={data.month} value={data.month}>{data.month}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="status-filter-dashboard" className="block text-xs font-medium text-slate-600 mb-1">Filter Rincian by Status</label>
                                <select
                                    id="status-filter-dashboard"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value as Status | 'All')}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                >
                                    <option value="All">All Statuses</option>
                                    {Object.values(Status).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="priority-filter-dashboard" className="block text-xs font-medium text-slate-600 mb-1">Filter Rincian by Priority</label>
                                <select
                                    id="priority-filter-dashboard"
                                    value={selectedPriority}
                                    onChange={(e) => setSelectedPriority(e.target.value as Priority | 'All')}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                >
                                    <option value="All">All Priorities</option>
                                    {Object.values(Priority).map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex sm:items-end pt-2 sm:pt-0">
                                <button
                                    onClick={() => {
                                        setSelectedMonth('All');
                                        setSelectedStatus('All');
                                        setSelectedPriority('All');
                                    }}
                                    className="w-full sm:w-auto bg-[#06064F] text-white px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 active:opacity-100 transition-opacity"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-[#06064F] text-white">
                                    <tr>
                                        <th className="p-3 text-left font-semibold text-xs uppercase">Bulan</th>
                                        <th className="p-3 text-center font-semibold text-xs uppercase">Jumlah Tugas</th>
                                        <th className="p-3 text-right font-semibold text-xs uppercase">Total Anggaran</th>
                                        <th className="p-3 text-right font-semibold text-xs uppercase">Total Biaya</th>
                                        <th className="p-3 text-right font-semibold text-xs uppercase">Selisih</th>
                                        <th className="p-3 text-left font-semibold text-xs uppercase">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredReportData.map(data => (
                                        <React.Fragment key={data.month}>
                                            <tr onClick={() => handleRowClick(data.month)} className="hover:bg-slate-50 cursor-pointer">
                                                <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                                                    <svg
                                                        className={`w-4 h-4 text-slate-500 transition-transform ${expandedMonth === data.month ? 'rotate-90' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                    {data.month}
                                                </td>
                                                <td className="p-3 text-center font-medium text-slate-600">{data.taskCount}</td>
                                                <td className="p-3 text-right font-medium text-blue-600">{formatCurrency(data.totalAnggaran)}</td>
                                                <td className="p-3 text-right font-medium text-green-600">{formatCurrency(data.totalBiaya)}</td>
                                                <td className={`p-3 text-right font-bold ${data.selisih >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                    {formatCurrency(data.selisih)}
                                                </td>
                                                <td className={`p-3 font-medium ${
                                                    data.selisih > 0 ? 'text-green-600' :
                                                    data.selisih < 0 ? 'text-red-600' : 'text-slate-600'
                                                }`}>
                                                    {data.keterangan}
                                                </td>
                                            </tr>
                                            {expandedMonth === data.month && (
                                                <tr>
                                                    <td colSpan={6} className="p-2 bg-slate-50">
                                                        {renderDetailsContent(data.details, selectedStatus, selectedPriority)}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-100">
                                    <tr className="font-extrabold text-slate-900">
                                        <td className="p-4">TOTAL {selectedMonth !== 'All' ? selectedMonth.toUpperCase() : year}</td>
                                        <td className="p-4 text-center">{totals.taskCount}</td>
                                        <td className="p-4 text-right text-blue-700">{formatCurrency(totals.totalAnggaran)}</td>
                                        <td className="p-4 text-right text-green-700">{formatCurrency(totals.totalBiaya)}</td>
                                        <td className={`p-4 text-right ${totals.selisih >= 0 ? 'text-green-800' : 'text-red-700'}`}>
                                            {formatCurrency(totals.selisih)}
                                        </td>
                                        <td className="p-4"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                )}
                
                {activeTab === 'chart' && (
                     <div className="mt-2">
                         <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex-1">
                                <label htmlFor="month-filter-chart" className="block text-xs font-medium text-slate-600 mb-1">Filter Grafik by Bulan</label>
                                <select
                                    id="month-filter-chart"
                                    value={chartFilterMonth}
                                    onChange={(e) => setChartFilterMonth(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                >
                                    <option value="All">Semua Bulan</option>
                                    {summaryData.map(data => (
                                        <option key={data.month} value={data.month}>{data.month}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="status-filter-chart" className="block text-xs font-medium text-slate-600 mb-1">Filter Data by Status</label>
                                <select
                                    id="status-filter-chart"
                                    value={chartFilterStatus}
                                    onChange={(e) => setChartFilterStatus(e.target.value as Status | 'All')}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                >
                                    <option value="All">All Statuses</option>
                                    {Object.values(Status).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="priority-filter-chart" className="block text-xs font-medium text-slate-600 mb-1">Filter Data by Priority</label>
                                <select
                                    id="priority-filter-chart"
                                    value={chartFilterPriority}
                                    onChange={(e) => setChartFilterPriority(e.target.value as Priority | 'All')}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                >
                                    <option value="All">All Priorities</option>
                                    {Object.values(Priority).map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex sm:items-end pt-2 sm:pt-0">
                                <button
                                    onClick={() => {
                                        setChartFilterMonth('All');
                                        setChartFilterStatus('All');
                                        setChartFilterPriority('All');
                                    }}
                                    className="w-full sm:w-auto bg-[#06064F] text-white px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 active:opacity-100 transition-opacity"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        
                        {chartFilterMonth !== 'All' ? (
                            detailedTaskChart && detailedTaskChart.data.labels.length > 0 ? (
                                <div className="mt-4" style={{ height: `${Math.max(400, detailedTaskChart.data.labels.length * 100)}px`, position: 'relative' }}>
                                    <Bar ref={chartRef} options={detailedTaskChart.options} data={detailedTaskChart.data} />
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 py-8">
                                    Tidak ada data tugas yang sesuai dengan filter untuk ditampilkan dalam grafik.
                                </div>
                            )
                        ) : (
                            <>
                                <Bar ref={chartRef} options={summaryChartOptions} data={summaryChartData} />
                                {expandedData && (
                                    <div className="mt-4 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                        {renderDetailsContent(expandedData.details, chartFilterStatus, chartFilterPriority)}
                                    </div>
                                )}
                            </>
                        )}
                        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <h3 className="text-md font-bold text-slate-800 mb-2 flex items-center gap-2">
                                 <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Keterangan Grafik
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {generateChartDescription()}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
