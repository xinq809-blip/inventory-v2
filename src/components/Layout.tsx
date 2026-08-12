import { useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { LayoutDashboard, PencilLine, Package, Menu, X, TrendingUp, Users, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { state: { distributors } } = useApp();
  const pid = useParams().pid;

  const persons = distributors.filter(d => d.role === 'sub');
  const linkCls = (isActive: boolean) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-starbucks-50 text-starbucks-600 font-medium' : 'text-gray-500 hover:bg-gray-100'}`;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-0.5">
      {/* 京津冀汇总 */}
      <NavLink to="/summary" onClick={onClick} className={({ isActive }) => linkCls(isActive)}>
        <BarChart3 size={17} /><span className="font-bold">京津冀汇总</span>
      </NavLink>

      <div className="my-2 border-t border-gray-100" />

      {/* 每个人员 */}
      {persons.map(p => {
        const isOpen = expanded === p.id || pid === p.id;
        return (
          <div key={p.id}>
            <button onClick={() => setExpanded(isOpen ? null : p.id)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <span className="flex items-center gap-2"><Users size={15} className="text-gray-400" />{p.name}</span>
              {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </button>
            {isOpen && (
              <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                <NavLink to={`/person/${p.id}/overview`} onClick={onClick} className={({ isActive }) => linkCls(isActive)}><BarChart3 size={15} />总看板</NavLink>
                <NavLink to={`/person/${p.id}/dashboard`} onClick={onClick} className={({ isActive }) => linkCls(isActive)}><LayoutDashboard size={15} />看板</NavLink>
                <NavLink to={`/person/${p.id}/entry`} onClick={onClick} className={({ isActive }) => linkCls(isActive)}><PencilLine size={15} />录入</NavLink>
                <NavLink to={`/person/${p.id}/ranking`} onClick={onClick} className={({ isActive }) => linkCls(isActive)}><TrendingUp size={15} />排名</NavLink>
                <NavLink to={`/person/${p.id}/distributors`} onClick={onClick} className={({ isActive }) => linkCls(isActive)}><Users size={15} />经销商</NavLink>
              </div>
            )}
          </div>
        );
      })}

      <div className="my-2 border-t border-gray-100" />
      <NavLink to="/distributors" onClick={onClick} className={({ isActive }) => linkCls(isActive)}><Users size={17} />人员管理</NavLink>
      <NavLink to="/products" onClick={onClick} className={({ isActive }) => linkCls(isActive)}><Package size={17} />产品管理</NavLink>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-100">
          <BarChart3 className="w-6 h-6 text-starbucks-500" />
          <span className="font-bold text-sm text-gray-800">京津冀大区</span>
        </div>
        <nav className="flex-1 py-3 px-3 overflow-y-auto scrollbar-thin"><NavLinks /></nav>
      </aside>

      {/* Mobile */}      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b flex items-center justify-between px-4">
        <span className="font-bold text-sm">京津冀大区</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-20">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-14 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white border-b shadow-lg p-3">
            <NavLinks onClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto pt-14 md:pt-0"><Outlet /></main>
    </div>
  );
}
