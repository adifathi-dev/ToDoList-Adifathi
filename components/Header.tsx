import React from 'react';
import { Page } from '../App';

interface NavigationProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
    label: string;
    page: Page;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    Icon: React.ElementType;
}> = ({ label, page, currentPage, onNavigate, Icon }) => (
    <button
        onClick={() => onNavigate(page)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentPage === page
                ? 'bg-[#06064F] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
        }`}
        aria-current={currentPage === page ? 'page' : undefined}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);

const Header: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
    return (
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 p-4 sticky top-0 z-20">
            <nav className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-[#06064F]" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <h1 className="text-lg font-bold text-slate-800 hidden sm:block">Manajemen Kegiatan</h1>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-xl">
                    <NavItem label="To-Do List" page="todolist" currentPage={currentPage} onNavigate={onNavigate} Icon={({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>} />
                    <NavItem label="Anggaran" page="budget" currentPage={currentPage} onNavigate={onNavigate} Icon={({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>} />
                    <NavItem label="Biaya" page="expenses" currentPage={currentPage} onNavigate={onNavigate} Icon={({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} />
                    <NavItem label="Dashboard" page="dashboard" currentPage={currentPage} onNavigate={onNavigate} Icon={({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>} />
                </div>
            </nav>
        </header>
    );
};

export default Header;
