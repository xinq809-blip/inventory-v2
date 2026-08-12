import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X, Building2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { Distributor } from '../types';

const DEFAULT_DISTRIBUTORS: Distributor[] = [
  { id: 'd0', name: '大区经理', region: '京津冀', phone: '', address: '', lat: 39.90, lng: 116.40, role: 'main' },
  { id: 'd1', name: '林竹甡', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd2', name: '于浩', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd3', name: '赵宏阳', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd4', name: '杜霞', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd5', name: '刘彤', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd6', name: '王朔', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd7', name: '李念', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd8', name: '主猛', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd9', name: '杨小光', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
  { id: 'd10', name: '乔欣', region: '京津冀', phone: '', address: '', lat: 0, lng: 0, role: 'sub' },
];

function genId() { return 'd' + Date.now().toString(36); }

export default function DistributorsPage() {
  const { dispatch } = useApp();
  const [items, setItems] = useState<Distributor[]>(DEFAULT_DISTRIBUTORS);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', region: '', phone: '', address: '', lat: 0, lng: 0 });
  const nav = useNavigate();

  // Load from Supabase
  useEffect(() => {
    supabase.from('distributors').select('*').then(r => {
      if (r.data && r.data.length > 0) {
        const data = r.data.map((row: any) => row.data);
        setItems(data);
        dispatch({ type: 'SET_DISTRIBUTORS', payload: data });
      }
    });
  }, []);

  // Save to Supabase
  const flush = (data: Distributor[]) => {
    setItems(data);
    dispatch({ type: 'SET_DISTRIBUTORS', payload: data });
    // Sync to Supabase
    supabase.from('distributors').delete().neq('id', '__none__').then(() => {
      const rows = data.map(d => ({ id: d.id, data: d }));
      if (rows.length > 0) supabase.from('distributors').upsert(rows, { onConflict: 'id' }).then(() => {});
    });
  };

  const resetForm = () => setForm({ name: '', region: '', phone: '', address: '', lat: 0, lng: 0 });

  const startAdd = () => { resetForm(); setAdding(true); setEditing(null); };
  const startEdit = (d: Distributor) => { setForm(d); setEditing(d.id); setAdding(false); };
  const cancel = () => { setAdding(false); setEditing(null); resetForm(); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      flush(items.map(d => d.id === editing ? { ...form, id: editing } : d));
    } else {
      flush([...items, { ...form, id: genId() }]);
    }
    cancel();
  };

  const del = (id: string) => { if (confirm('确定删除该负责人？')) flush(items.filter(d => d.id !== id)); };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">人员管理</h1>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} 个负责人 · 管理区域负责人</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-1.5 px-4 py-2 bg-starbucks-500 text-white rounded-xl text-sm font-medium hover:bg-starbucks-600 shadow-sm">
          <Plus size={15} />新增负责人
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3">名称</th><th className="px-5 py-3">区域</th><th className="px-5 py-3 hidden sm:table-cell">电话</th><th className="px-5 py-3 hidden lg:table-cell">地址</th><th className="px-5 py-3 text-center w-28">操作</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-300" />
                      <span className="font-medium text-gray-800">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{d.region || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{d.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell max-w-[150px] truncate">{d.address || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => nav(`/distributor/${d.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-starbucks-600 hover:bg-starbucks-50" title="详情">
                        <ChevronRight size={15} />
                      </button>
                      <button onClick={() => startEdit(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="编辑">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => del(d.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" title="删除">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(adding || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={cancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">{editing ? '编辑负责人' : '新增负责人'}</h3>
              <button onClick={cancel} className="p-1 rounded-full hover:bg-gray-200"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">名称 *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="负责人名称" autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">区域</label>
                  <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="如 华东" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">电话</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="手机号" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">地址</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="详细地址" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-400" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">登录PIN码 <span className="text-gray-300">(默认1234)</span></label>
                <input value={(form as any).pin || ''} onChange={e => setForm({ ...form, pin: e.target.value } as any)} placeholder="4-6位数字" maxLength={6} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">纬度 (lat)</label>
                  <input type="number" step="0.0001" value={form.lat || ''} onChange={e => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })} placeholder="39.93" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">经度 (lng)</label>
                  <input type="number" step="0.0001" value={form.lng || ''} onChange={e => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })} placeholder="119.60" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-gray-400" />
                </div>
              </div>
              <button type="button" onClick={async () => {
                const addr = `${form.region || '秦皇岛'} ${form.address || ''} ${form.name}`.trim();
                if (!addr) return;
                try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`);
                  const data = await res.json();
                  if (data[0]) setForm({ ...form, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
                } catch {}
              }} className="text-[10px] text-starbucks-600 hover:underline">📍 根据地址自动定位</button>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={cancel} className="px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl">取消</button>
                <button onClick={save} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 shadow-sm">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
