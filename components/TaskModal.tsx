import React, { useState, useEffect } from 'react';
import { Task, Priority, Status, Kepanitiaan } from '../types';

type TaskFormData = Omit<Task, 'id' | 'completed' | 'updatedAt'>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: TaskFormData) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave }) => {
    const today = new Date().toISOString().split('T')[0];
    
    const initialFormState: TaskFormData = {
        name: '',
        priority: Priority.Medium,
        status: Status.Pending,
        createdAt: today, // Perencanaan start
        perencanaanEnd: today,
        pelaksanaanStart: today,
        deadline: today, // Pelaksanaan end
        pelaporanStart: today,
        pelaporanEnd: today,
        penanggungJawab: '',
        kepanitiaan: { ketua: '', sekretaris: '', bendahara: '', koordinator: '', lainnya: '' },
        tempat: '',
        suratTugas: '',
    };
    
    const [formData, setFormData] = useState<TaskFormData>(initialFormState);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            alert('Nama tugas tidak boleh kosong.');
            return;
        }
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    const inputClasses = "mt-1 block w-full rounded-lg border border-slate-300 bg-white p-3 text-base text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all";
    const labelClasses = "block text-sm font-medium text-slate-700";
    const sectionTitleClasses = "text-base font-semibold text-slate-800 border-b border-slate-300 pb-2 mb-4";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-slate-50 rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Tambah Tugas Baru</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors rounded-full p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-3">
                    {/* General Info */}
                    <div>
                        <label htmlFor="name" className={labelClasses}>Nama Tugas</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className={inputClasses} autoFocus />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="priority" className={labelClasses}>Prioritas</label>
                            <select id="priority" name="priority" value={formData.priority} onChange={handleInputChange} className={inputClasses}>
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className={labelClasses}>Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleInputChange} className={inputClasses}>
                                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Jadwal */}
                    <div className="pt-4">
                        <h3 className={sectionTitleClasses}>Jadwal</h3>
                        <div className="p-4 bg-slate-100 rounded-lg mt-2 space-y-4">
                            <div>
                                <h4 className="font-medium text-slate-600 mb-2">Perencanaan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Mulai</label>
                                        <input type="date" name="createdAt" value={formData.createdAt} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Selesai</label>
                                        <input type="date" name="perencanaanEnd" value={formData.perencanaanEnd} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-600 mb-2 pt-2">Pelaksanaan</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Mulai</label>
                                        <input type="date" name="pelaksanaanStart" value={formData.pelaksanaanStart} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Deadline</label>
                                        <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-600 mb-2 pt-2">Pelaporan</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Mulai</label>
                                        <input type="date" name="pelaporanStart" value={formData.pelaporanStart} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Berakhir</label>
                                        <input type="date" name="pelaporanEnd" value={formData.pelaporanEnd} onChange={handleInputChange} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detail Pelaksana */}
                    <div className="pt-4">
                        <h3 className={sectionTitleClasses}>Detail Pelaksana</h3>
                        <div>
                            <label htmlFor="penanggungJawab" className={labelClasses}>Penanggung Jawab</label>
                            <input id="penanggungJawab" name="penanggungJawab" type="text" value={formData.penanggungJawab} onChange={handleInputChange} className={inputClasses} />
                        </div>
                        <div className="p-4 bg-slate-100 rounded-lg mt-4 space-y-4">
                            <h4 className="font-medium text-slate-600">Kepanitiaan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Ketua</label>
                                    <input type="text" name="ketua" value={formData.kepanitiaan.ketua} onChange={handleKepanitiaanChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Sekretaris</label>
                                    <input type="text" name="sekretaris" value={formData.kepanitiaan.sekretaris} onChange={handleKepanitiaanChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Bendahara</label>
                                    <input type="text" name="bendahara" value={formData.kepanitiaan.bendahara} onChange={handleKepanitiaanChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Koordinator</label>
                                    <input type="text" name="koordinator" value={formData.kepanitiaan.koordinator} onChange={handleKepanitiaanChange} className={inputClasses} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Lainnya</label>
                                    <input type="text" name="lainnya" value={formData.kepanitiaan.lainnya} onChange={handleKepanitiaanChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Informasi Lainnya */}
                    <div className="pt-4">
                        <h3 className={sectionTitleClasses}>Informasi Lainnya</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Tempat</label>
                                <input type="text" name="tempat" value={formData.tempat} onChange={handleInputChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Surat Tugas (Nomor)</label>
                                <input type="text" name="suratTugas" value={formData.suratTugas} onChange={handleInputChange} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                </div>
                <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
                    <button onClick={onClose} type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">Batal</button>
                    <button onClick={handleSubmit} type="button" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#06064F] rounded-lg hover:opacity-90 transition-opacity">Simpan Tugas</button>
                </div>
            </div>
        </div>
    );
};
export default TaskModal;
