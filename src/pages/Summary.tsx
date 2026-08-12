import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getAvailableWeeks, getCurrentWeekStart } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, Users, Trophy, AlertCircle, Calendar } from 'lucide-react';

const COLORS = ['#00704A','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#10b981','#ec4899','#06b6d4','#f97316','#6366f1','#84cc16'];

export default function Summary() {
  const { state } = useApp();
  const { products, distributors, snapshots, restocks } = state;

  const weeks = useMemo(() => getAvailableWeeks(snapshots), [snapshots]);
  const activeDate = weeks.length > 0 ? weeks[weeks.length - 1] : getCurrentWeekStart();
  const prevDate = weeks.length > 1 ? weeks[weeks.length - 2] : null;
  const persons = distributors.filter(d => d.role === 'sub');

  // Per person data
  const personData = useMemo(() => persons.map(d => {
    const stock = snapshots.filter(s => s.weekStart === activeDate && s.distributorId === d.id).reduce((a, s) => a + s.quantity, 0);
    const prevStock = prevDate ? snapshots.filter(s => s.weekStart === prevDate && s.distributorId === d.id).reduce((a, s) => a + s.quantity, 0) : 0;
    const restock = (restocks || []).filter(r => r.distributorId === d.id).reduce((a, r) => a + r.quantity, 0);
    const sales = Math.max(0, prevStock + restock - stock);
    const hasData = restock > 0 || stock > 0;
    return { name: d.name, stock, restock, sales, prevStock, hasData };
  }).sort((a, b) => b.sales - a.sales), [persons, activeDate, prevDate, snapshots, restocks]);

  const totalRestock = personData.reduce((s, d) => s + d.restock, 0);
  const totalStock = personData.reduce((s, d) => s + d.stock, 0);
  const totalSales = personData.reduce((s, d) => s + d.sales, 0);
  const activeCount = personData.filter(d => d.hasData).length;
  const totalValue = snapshots.filter(s => s.weekStart === activeDate).reduce((a, s) => {
    const p = products.find(x => x.id === s.productId);
    return a + s.quantity * (p?.unitPrice || 0);
  }, 0);

  // Focus products
  const focusByPerson = useMemo(() => persons.map(d => {
    const p450 = (() => {
      const st = snapshots.filter(s => s.weekStart === activeDate && s.distributorId === d.id && s.productId === 'p11').reduce((a, s) => a + s.quantity, 0);
      const rs = (restocks || []).filter(r => r.distributorId === d.id && r.productId === 'p11').reduce((a, r) => a + r.quantity, 0);
      return { stock: st, restock: rs, sales: Math.max(0, rs - st) };
    })();
    const coconut = (() => {
      const st = snapshots.filter(s => s.weekStart === activeDate && s.distributorId === d.id && s.productId === 'p20').reduce((a, s) => a + s.quantity, 0);
      const rs = (restocks || []).filter(r => r.distributorId === d.id && r.productId === 'p20').reduce((a, r) => a + r.quantity, 0);
      return { stock: st, restock: rs, sales: Math.max(0, rs - st) };
    })();
    return { name: d.name, p450, coconut };
  }), [persons, activeDate, snapshots, restocks]);

  // Pie data
  const pieData = personData.filter(d => d.sales > 0).map(d => ({ name: d.name, value: d.sales }));

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">京津冀大区 · 汇总</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            <Calendar size={13} className="inline mr-1" />最新盘点 {activeDate} · {activeCount}/{persons.length} 人已录入
          </p>
        </div>
        {weeks.length < 1 && (
          <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">等待首次数据录入</span>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '总进货', v: totalRestock, unit: '件', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', sub: '累计进货量' },
          { label: '总库存', v: totalStock, unit: '件', icon: Package, color: 'text-violet-600', bg: 'bg-violet-50', sub: activeDate },
          { label: '总出货', v: totalSales, unit: '件', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: '累计出货量' },
          { label: '库存价值', v: '¥' + (totalValue / 10000).toFixed(1) + '万', unit: '', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', sub: '预估价值' },
          { label: '已录入', v: `${activeCount}/${persons.length}`, unit: '人', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50', sub: '数据覆盖率' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{c.label}</span>
              <div className={`p-2 rounded-xl ${c.bg}`}><c.icon size={16} className={c.color} /></div>
            </div>
            <div className="text-2xl font-bold text-gray-800 tracking-tight">{typeof c.v === 'number' ? c.v.toLocaleString() + ' ' + c.unit : c.v}</div>
            <p className="text-[11px] text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">各负责人出货对比</h3>
          {totalSales > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(240, personData.length * 32)}>
              <BarChart data={personData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip formatter={(v: any) => Number(v).toLocaleString() + ' 件'} />
                <Bar dataKey="sales" name="出货" radius={[0, 6, 6, 0]}>
                  {personData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-gray-400">
              <AlertCircle size={28} className="mb-2 text-gray-300" />
              <span className="text-sm">暂无出货数据</span>
              <span className="text-xs mt-1">等待各负责人录入库存和进货</span>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">出货占比</h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ strokeWidth: 1 }}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => Number(v).toLocaleString() + ' 件'} />
                </PieChart>
              </ResponsiveContainer>
              {/* Top 3 */}
              <div className="flex items-center gap-4 mt-2">
                {pieData.slice(0, 3).map((d, i) => (
                  <div key={d.name} className="text-center">
                    {i === 0 ? <Trophy size={14} className="text-amber-500 mx-auto" /> :
                     i === 1 ? <Trophy size={14} className="text-gray-400 mx-auto" /> :
                     <Trophy size={14} className="text-orange-400 mx-auto" />}
                    <p className="text-[10px] text-gray-600 mt-0.5">{d.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">暂无数据</div>
          )}
        </div>
      </div>

      {/* Person detail table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">负责人明细表</h3>
          <span className="text-[11px] text-gray-400">{persons.length} 人</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30 text-gray-500">
                <th className="text-left px-6 py-3 text-xs font-medium">负责人</th>
                <th className="text-right px-3 py-3 text-xs font-medium">累计进货</th>
                <th className="text-right px-3 py-3 text-xs font-medium">现有库存</th>
                <th className="text-right px-3 py-3 text-xs font-medium">累计出货</th>
                <th className="text-right px-3 py-3 text-xs font-medium">出货占比</th>
                <th className="text-right px-3 py-3 text-xs font-medium">P450出货</th>
                <th className="text-right px-3 py-3 text-xs font-medium">椰椰出货</th>
                <th className="text-center px-3 py-3 text-xs font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {personData.map((d, i) => {
                const focus = focusByPerson.find(f => f.name === d.name);
                const share = totalSales > 0 ? Math.round((d.sales / totalSales) * 100) : 0;
                return (
                  <tr key={d.name} className={`hover:bg-gray-50/30 ${i === 0 ? 'bg-amber-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Trophy size={14} className="text-amber-500" />}
                        <span className="font-bold text-gray-800">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right text-gray-600">{d.restock.toLocaleString()}</td>
                    <td className="px-3 py-4 text-right text-gray-600">{d.stock.toLocaleString()}</td>
                    <td className="px-3 py-4 text-right font-bold text-gray-800">{d.sales.toLocaleString()}</td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-starbucks-500 rounded-full" style={{ width: `${share}%` }} /></div>
                        <span className="text-gray-500 text-xs w-8">{share}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right text-gray-500">{focus?.p450.sales?.toLocaleString() || '—'}</td>
                    <td className="px-3 py-4 text-right text-gray-500">{focus?.coconut.sales?.toLocaleString() || '—'}</td>
                    <td className="px-3 py-4 text-center">
                      {d.hasData
                        ? <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">已录入</span>
                        : <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">未录入</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
