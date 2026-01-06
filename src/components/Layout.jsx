import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar />
      <main className="ml-64 min-h-screen transition-all duration-300">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
