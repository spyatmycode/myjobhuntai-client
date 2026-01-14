import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resumes', icon: FileText, label: 'Resume Hub' },
  { path: '/applications', icon: Briefcase, label: 'Applications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
        {/* Backdrop for mobile */}
        <div 
            className={`fixed inset-0 bg-black/60 z-40 md:hidden ${isOpen ? 'block' : 'hidden'}`}
            onClick={() => setIsOpen(false)}
        />

        <aside 
          className={`fixed left-0 top-0 h-screen bg-dark-800/80 backdrop-blur-xl border-r border-dark-600 
                      flex flex-col transition-all duration-300 z-50
                      ${isCollapsed ? 'w-20' : 'w-64'}
                      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-dark-600 flex-shrink-0">
            {!isCollapsed && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary 
                              flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-semibold text-lg">JobHuntAI</span>
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-dark-700 transition-colors hidden md:block"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                   ${isActive 
                     ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30' 
                     : 'text-gray-400 hover:text-white hover:bg-dark-700'
                   }
                   ${isCollapsed ? 'justify-center' : ''}
                   animate-slide-in-left`
                }
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-dark-600">
            {!isCollapsed && user && (
              <div className="mb-3 px-3 animate-fade-in">
                <p className="text-sm text-gray-400">Signed in as</p>
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-400 
                         hover:text-accent-danger hover:bg-accent-danger/10 transition-all duration-200
                         ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </aside>
    </>
  );
}
