import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAvailableWeeks, getProductById, getCurrentWeekStart, getProductGroupLabel } from '../data/mockData';
import { TrendingUp, Package, DollarSign, Truck, Calendar } from 'lucide-react';

const FOCUS_IDS = ['p11', 'p20'];

export default function Overview() {
  const { pid } = useParams<{ pid: string }>();
  const { state } = useApp();
  const { products, distributors, snapshots, restocks } = state;
  const person = distributors.find(d => d.id === pid);

  const weeks = useMemo(() => getAvailableWeeks(snapshots), [snapshots]);
  const activeDate = weeks.length > 0 ? weeks[weeks.length - 1] : getCurrentWeekStart();
  const prevDate = weeks.length > 1 ? weeks[weeks.length - 2] : null;

  const mainId = pid || '';
  const allIds = useMemo(() => {
    if (!pid) return [];
    const children = distributors.filter(d => d.parentId === pid).map(d => d.id);
    return [pid, ...children];
  }, [pid, distributors]);

  const mainRestocks = useMemo(() =>
    (restocks || []).filter(r => allIds.includes(r.distributorId)).sort((a, b) => a.date.localeCompare(b.date))
  , [restocks, allIds]);

  const curStock = snapshots.filter(s => s.weekStart === activeDate && allIds.includes(s.distributorId)).reduce((a, s) => a + s.quantity, 0);
  const prevStock = prevDate ? snapshots.filter(s => s.weekStart === prevDate && allIds.includes(s.distributorId)).reduce((a, s) => a + s.quantity, 0) : 0;
  const totalRestock = mainRestocks.reduce((s, r) => s + r.quantity, 0);
  const totalSales = Math.max(0, prevStock + totalRestock - curStock);
  const stockValue = snapshots.filter(s => s.weekStart === activeDate && allIds.includes(s.distributorId)).reduce((a, s) => {
    const p = products.find(x => x.id === s.productId);
    return a + s.quantity * (p?.unitPrice || 0);
  }, 0);

  const restockByDate = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const r of mainRestocks) {
      const label = getProductGroupLabel(r.productId) || '其他';
      if (!map[r.date]) map[r.date] = {};
      map[r.date][label] = (map[r.date][label] || 0) + r.quantity;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [mainRestocks]);

  const restockTotalByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of mainRestocks) map[r.date] = (map[r.date] || 0) + r.quantity;
    return map;
  }, [mainRestocks]);

  const focusData = useMemo(() => FOCUS_IDS.map(pid => {
    const p = getProductById(pid);
    const stock = snapshots.filter(s => s.weekStart === activeDate && s.distributorId === mainId && s.productId === pid).reduce((a, s) => a + s.quantity, 0);
    const restock = (restocks || []).filter(r => r.distributorId === mainId && r.productId === pid).reduce((a, r) => a + r.quantity, 0);
    return { name: p?.name || pid, stock, restock, sales: Math.max(0, restock - stock) };
  }), [mainId, activeDate, snapshots, restocks]);

  const mainSnaps = useMemo(() =>
    [...new Set(snapshots.filter(s => s.distributorId === mainId).map(s => s.weekStart))].sort()
  , [snapshots, mainId]);

  if (!person) return <div className="p-8 text-center text-gray-400">请先选择人员</div>;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{person.name} · 总看板</h1>
        <p className="text-xs text-gray-400 mt-0.5">{mainRestocks.length} 次进货 · {mainSnaps.length} 次盘点</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '累计进货', v: totalRestock, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '现有库存', v: curStock, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: '累计出货', v: totalSales, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '库存价值', v: '¥' + (stockValue / 10000).toFixed(1) + '万', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-500">{c.label}</span><div className={`p-1.5 rounded-lg ${c.bg}`}><c.icon size={15} className={c.color} /></div></div>
            <div className="text-2xl font-bold text-gray-800">{typeof c.v === 'number' ? c.v.toLocaleString() + ' 件' : c.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">进货明细</h3>
          {restockByDate.length === 0 ? <p className="text-xs text-gray-400 text-center py-6">暂无进货</p> : (
            <div className="space-y-2">
              {restockByDate.map(([date, groups]) => (
                <div key={date} className="bg-blue-50/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5"><Calendar size={12} className="text-blue-400" /><span className="text-xs font-bold text-gray-700">{date}</span><span className="text-xs text-blue-500 ml-auto font-bold">{restockTotalByDate[date]?.toLocaleString() || 0} 件</span></div>
                  <div className="flex flex-wrap gap-1">{Object.entries(groups).map(([label, qty]) => <span key={label} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{label} +{qty.toLocaleString()}</span>)}</div>
                </div>
              ))}
              <div className="flex justify-between p-2 bg-blue-100 rounded-xl text-xs font-bold text-blue-700">合计<span>{totalRestock.toLocaleString()} 件</span></div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">库存盘点</h3>
          {mainSnaps.length === 0 ? <p className="text-xs text-gray-400 text-center py-6">暂无盘点</p> : (
            <div className="space-y-2">
              {mainSnaps.map(date => {
                const qty = snapshots.filter(s => s.weekStart === date && s.distributorId === mainId).reduce((a, s) => a + s.quantity, 0);
                return (
                  <div key={date} className={`flex justify-between p-2.5 rounded-xl text-xs ${date === activeDate ? 'bg-violet-100 font-bold' : 'bg-violet-50/50'}`}>
                    <span className="text-gray-700">{date}</span><span className="text-violet-700 font-bold">{qty.toLocaleString()} 件</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {focusData.map(f => (
          <div key={f.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <h4 className="text-sm font-bold text-gray-800 mb-3">{f.name}</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-3"><p className="text-lg font-bold text-blue-600">{f.restock.toLocaleString()}</p><p className="text-[10px] text-blue-400">进货</p></div>
              <div className="bg-violet-50 rounded-xl p-3"><p className="text-lg font-bold text-violet-600">{f.stock.toLocaleString()}</p><p className="text-[10px] text-violet-400">库存</p></div>
              <div className="bg-emerald-50 rounded-xl p-3"><p className="text-lg font-bold text-emerald-600">{f.sales.toLocaleString()}</p><p className="text-[10px] text-emerald-400">出货</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
