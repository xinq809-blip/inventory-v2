import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Pencil, X, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import type { Distributor } from '../types';

function genId() { return 'd' + Date.now().toString(36); }

export default function PersonDistributorsPage() {
  const { pid } = useParams<{ pid: string }>();
  const { state: { distributors }, dispatch } = useApp();
  const person = distributors.find(d => d.id === pid);

  const [items, setItems] = useState<Distributor[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', region: '', phone: '', address: '' });

  // Load
  useEffect(() => {
    supabase.from('distributors').select('*').then(r => {
      if (r.data?.length) {
        const all = r.data.map((row: any) => row.data);
        setItems(all.filter((d: Distributor) => d.parentId === pid));
      }
    });
  }, [pid]);

  const save = () => {
    if (!form.name.trim()) return;
    const newItem: Distributor = {
      ...form, id: editing || genId(), lat: 0, lng: 0, role: 'dist', parentId: pid
    };
    const updated = editing
      ? items.map(d => d.id === editing ? newItem : d)
      : [...items, newItem];
    setItems(updated);
    // Sync
    supabase.from('distributors').delete().neq('id', '__none__').then(() => {
      const all = [...distributors.filter(d => d.parentId !== pid), ...updated];
      supabase.from('distributors').insert(all.map(d => ({ id: d.id, data: d }))).then(() => {
        dispatch({ type: 'SET_DISTRIBUTORS', payload: all });
      });
    });
    cancel();
  };

  const del = async (id: string) => {
    if (!confirm('确定删除？')) return;
    const updated = items.filter(d => d.id !== id);
    setItems(updated);
    await supabase.from('distributors').delete().eq('id', id);
    dispatch({ type: 'SET_DISTRIBUTORS', payload: distributors.filter(d => d.id !== id) });
  };

  const cancel = () => { setAdding(false); setEditing(null); setForm({ name: '', region: '', phone: '', address: '' }); };
  const startEdit = (d: Distributor) => { setForm(d); setEditing(d.id); setAdding(false); };

  if (!person) return <div className="p-8 text-center text-gray-400">未找到人员</div>;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{person.name} · 经销商管理</h1>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} 个经销商</p>
        </div>
        <button onClick={() => { cancel(); setAdding(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-starbucks-500 text-white rounded-xl text-sm font-medium hover:bg-starbucks-600">
          <Plus size={15} />新增经销商
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <Building2 size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">暂无经销商</p>
          <p className="text-xs text-gray-300 mt-1">点击右上角添加</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs text-gray-500"><th className="px-5 py-3">名称</th><th className="px-5 py-3">区域</th><th className="px-5 py-3">电话</th><th className="px-5 py-3 w-20 text-center">操作</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/30">
                  <td className="px-5 py-3 font-medium text-gray-800">{d.name}</td>
                  <td className="px-5 py-3 text-gray-500">{d.region || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{d.phone || '—'}</td>
                  <td className="px-5 py-3"><div className="flex justify-center gap-1">
                    <button onClick={() => startEdit(d)} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil size={14} /></button>
                    <button onClick={() => del(d.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(adding || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={cancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between">
              <h3 className="text-sm font-semibold text-gray-800">{editing ? '编辑' : '新增'}经销商</h3>
              <button onClick={cancel} className="p-1 rounded-full hover:bg-gray-200"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="经销商名称 *" autoFocus className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="区域" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="电话" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="地址" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={cancel} className="px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl">取消</button>
                <button onClick={save} className="px-6 py-2.5 bg-starbucks-500 text-white rounded-xl text-sm font-medium hover:bg-starbucks-600">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
