import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import { BudgetItem } from '../types';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

interface BudgetPieChartProps {
    budgetItems: BudgetItem[];
}

const BudgetPieChart: React.FC<BudgetPieChartProps> = ({ budgetItems }) => {
    
    const { chartData, totalBudget } = useMemo(() => {
        const totals = budgetItems.reduce((acc, item) => {
            acc.kegiatan += item.anggaranKegiatan;
            acc.transport += item.anggaranTransport;
            acc.panitia += item.anggaranPanitia;
            return acc;
        }, { kegiatan: 0, transport: 0, panitia: 0 });
        
        const data = [totals.kegiatan, totals.transport, totals.panitia];
        const total = data.reduce((a, b) => a + b, 0);

        return {
            chartData: {
                labels: ['Anggaran Kegiatan', 'Anggaran Transport', 'Anggaran Pelaksana'],
                datasets: [
                    {
                        label: 'Jumlah Anggaran',
                        data: data,
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)', // Blue
                            'rgba(255, 159, 64, 0.8)', // Orange
                            'rgba(75, 192, 192, 0.8)',  // Teal
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(75, 192, 192, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            totalBudget: total
        };
    }, [budgetItems]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: (context: any) => {
                    const value = context.dataset.data[context.dataIndex];
                    return value > 0;
                },
                formatter: (value: number, context: any) => {
                    const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                    return percentage;
                },
                color: '#fff',
                font: {
                    weight: 'bold' as 'bold',
                    size: 12,
                },
            },
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 12,
                    font: {
                        size: 10,
                    },
                    generateLabels: (chart: any) => {
                        const originalLabels = Legend.defaults.labels.generateLabels(chart);
                        const data = chart.data.datasets[0].data;
                        originalLabels.forEach((label, i) => {
                            if (data[i] > 0) {
                                label.text = `${chart.data.labels[i]}: ${formatCurrency(data[i])}`;
                            } else {
                                label.hidden = true;
                            }
                        });
                        return originalLabels.filter(l => !l.hidden);
                    }
                }
            },
            title: {
                display: true,
                text: 'Distribusi Rencana Anggaran',
                font: {
                    size: 14,
                    weight: 'bold' as 'bold',
                },
                color: '#1e293b',
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                        return `${label}: ${formatCurrency(value)} (${percentage})`;
                    }
                }
            }
        },
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            {totalBudget > 0 ? (
                <div className="h-[450px]">
                     <Pie options={options} data={chartData} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
                    <h4 className="font-bold text-sm text-slate-800 mb-2">Distribusi Anggaran</h4>
                    <p className="text-xs text-slate-500">Belum ada data anggaran untuk ditampilkan. Silakan input anggaran pada tabel di samping.</p>
                </div>
            )}
        </div>
    );
};

export default BudgetPieChart;