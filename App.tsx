import React, { useState } from 'react';
import Header from './components/Header';
import TodoListPage from './components/TodoListPage';
import BudgetPlanPage from './components/BudgetPlanPage';
import ExpenseReportPage from './components/ExpenseReportPage';
import DashboardPage from './components/DashboardPage';

export type Page = 'todolist' | 'budget' | 'expenses' | 'dashboard';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('todolist');

    const renderPage = () => {
        switch (currentPage) {
            case 'todolist':
                return <TodoListPage />;
            case 'budget':
                return <BudgetPlanPage />;
            case 'expenses':
                return <ExpenseReportPage />;
            case 'dashboard':
                return <DashboardPage />;
            default:
                return <TodoListPage />;
        }
    };

    return (
        <div className="min-h-screen font-sans text-sm text-slate-800">
            <Header currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
};

export default App;
