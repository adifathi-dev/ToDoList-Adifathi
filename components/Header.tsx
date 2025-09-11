import React from 'react';

interface HeaderProps {
    onPrint: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPrint }) => {
    return (
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center print:hidden sticky top-0 z-10">
            <div className="flex items-center gap-3">
                 <svg className="w-6 h-6 text-[#06064F]" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                 </svg>
                <h1 className="text-lg font-bold text-slate-800">Manajemen Jadwal Kegiatan</h1>
            </div>
            <button
                onClick={onPrint}
                className="bg-[#06064F] text-white px-4 py-2 rounded-lg hover:opacity-90 active:opacity-100 transition-opacity flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-sm"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Cetak Laporan
            </button>
        </header>
    );
};

export default Header;