import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main 
        className={`transition-all duration-300 
                    ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}
      >
        <div className="md:hidden flex items-center justify-between p-4 border-b border-dark-600">
            <button onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="font-display font-semibold text-lg">JobHuntAI</div>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
