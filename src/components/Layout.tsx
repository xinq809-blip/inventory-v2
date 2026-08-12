import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PencilLine, Package, Menu, X, Store, Users, TrendingUp, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/overview', icon: BarChart3, label: '总看板' },
  { to: '/', icon: LayoutDashboard, label: '看板', end: true },
  { to: '/entry', icon: PencilLine, label: '录入' },
  { to: '/ranking', icon: TrendingUp, label: '排名' },
  { to: '/distributors', icon: Users, label: '经销商' },
  { to: '/products', icon: Package, label: '产品' },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const linkClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-starbucks-50 text-starbucks-600' : 'text-gray-600 hover:bg-gray-100'}`;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-0.5">
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onClick} className={({ isActive }) => linkClass(isActive)}>
          <Icon size={18} /><span>{label}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex w-48 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-100">
          <Store className="w-6 h-6 text-starbucks-500" />
          <span className="font-bold text-sm text-gray-800">进销存 2.0</span>
        </div>
        <nav className="flex-1 py-3 px-3 overflow-y-auto"><NavLinks /></nav>
      </aside>
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <span className="font-bold text-sm">进销存 2.0</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-20">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-14 left-0 right-0 bg-white border-b shadow-lg p-3"><NavLinks onClick={() => setMenuOpen(false)} /></div>
        </div>
      )}
      <main className="flex-1 overflow-auto pt-14 md:pt-0 pb-16 md:pb-0"><Outlet /></main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t flex items-center justify-around py-1 safe-bottom">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium ${isActive ? 'text-starbucks-600' : 'text-gray-400'}`}><Icon size={16} /><span>{label}</span></NavLink>
        ))}
      </nav>
    </div>
  );
}
