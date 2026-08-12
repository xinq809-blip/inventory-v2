import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getAvailableWeeks, getCurrentWeekStart } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, DollarSign } from 'lucide-react';

export default function Summary() {
  const { state } = useApp();
  const { products, distributors, snapshots, restocks } = state;

  const weeks = useMemo(() => getAvailableWeeks(snapshots), [snapshots]);
  const activeDate = weeks.length > 0 ? weeks[weeks.length - 1] : getCurrentWeekStart();
  const persons = distributors.filter(d => d.role === 'sub');

  // Per person totals
  const personData = useMemo(() => persons.map(d => {
    const stock = snapshots.filter(s => s.weekStart === activeDate && s.distributorId === d.id).reduce((a, s) => a + s.quantity, 0);
    const restock = (restocks || []).filter(r => r.distributorId === d.id).reduce((a, r) => a + r.quantity, 0);
    return { name: d.name, stock, restock, sales: Math.max(0, restock - stock) };
  }).sort((a, b) => b.sales - a.sales), [persons, activeDate, snapshots, restocks]);

  const totalRestock = personData.reduce((s, d) => s + d.restock, 0);
  const totalStock = personData.reduce((s, d) => s + d.stock, 0);
  const totalSales = personData.reduce((s, d) => s + d.sales, 0);
  const totalValue = snapshots.filter(s => s.weekStart === activeDate).reduce((a, s) => {
    const p = products.find(x => x.id === s.productId);
    return a + s.quantity * (p?.unitPrice || 0);
  }, 0);

  // Focus products per person
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">京津冀大区 · 汇总</h1>
        <p className="text-xs text-gray-400 mt-0.5">{persons.length} 人 · 最新盘点 {activeDate}</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '总进货', v: totalRestock, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '总库存', v: totalStock, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: '总出货', v: totalSales, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '库存价值', v: '¥' + (totalValue / 10000).toFixed(1) + '万', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-500">{c.label}</span><div className={`p-1.5 rounded-lg ${c.bg}`}><c.icon size={15} className={c.color} /></div></div>
            <div className="text-2xl font-bold text-gray-800">{typeof c.v === 'number' ? c.v.toLocaleString() + ' 件' : c.v}</div>
          </div>
        ))}
      </div>

      {/* Person comparison chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">各负责人出货对比</h3>
        {personData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(200, personData.length * 36)}>
            <BarChart data={personData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis type="number" tick={{ fontSize: 10 }} /><YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} /><Tooltip formatter={(v: any) => Number(v).toLocaleString() + ' 件'} /><Bar dataKey="sales" name="出货" fill="#00704A" radius={[0, 4, 4, 0]} /></BarChart>
          </ResponsiveContainer>
        ) : <div className="h-[200px] flex items-center justify-center text-gray-400">暂无数据</div>}
      </div>

      {/* 450 + 椰椰 per person */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50"><h3 className="text-sm font-bold text-gray-800">重点产品 · 各负责人明细</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 bg-gray-50/30 text-gray-500"><th className="text-left px-5 py-2.5">负责人</th><th className="text-right px-2 py-2.5" colSpan={3}>P450 黑咖啡</th><th className="text-right px-2 py-2.5" colSpan={3}>椰椰拿铁</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {focusByPerson.map(d => (
                <tr key={d.name} className="hover:bg-gray-50/30">
                  <td className="px-5 py-3 font-medium text-gray-700">{d.name}</td>
                  <td className="px-2 py-3 text-right text-gray-500">{d.p450.restock > 0 ? d.p450.restock.toLocaleString() : '—'}</td>
                  <td className="px-2 py-3 text-right text-gray-500">{d.p450.stock > 0 ? d.p450.stock.toLocaleString() : '—'}</td>
                  <td className={`px-2 py-3 text-right font-bold ${d.p450.sales > 0 ? 'text-gray-800' : 'text-gray-300'}`}>{d.p450.sales > 0 ? d.p450.sales.toLocaleString() : '—'}</td>
                  <td className="px-2 py-3 text-right text-gray-500">{d.coconut.restock > 0 ? d.coconut.restock.toLocaleString() : '—'}</td>
                  <td className="px-2 py-3 text-right text-gray-500">{d.coconut.stock > 0 ? d.coconut.stock.toLocaleString() : '—'}</td>
                  <td className={`px-2 py-3 text-right font-bold ${d.coconut.sales > 0 ? 'text-gray-800' : 'text-gray-300'}`}>{d.coconut.sales > 0 ? d.coconut.sales.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
