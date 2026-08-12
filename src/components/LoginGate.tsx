import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginGate({ pid, onUnlock }: { pid: string; onUnlock: () => void }) {
  const { state: { distributors } } = useApp();
  const person = distributors.find(d => d.id === pid);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Default pin is "1234" if not set
  const storedPin = (person as any)?.pin || '1234';

  const handleSubmit = () => {
    if (pin === storedPin) {
      sessionStorage.setItem(`v2_unlock_${pid}`, '1');
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-starbucks-100 flex items-center justify-center text-2xl font-bold text-starbucks-600">
          {person?.name?.charAt(0) || '?'}
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">{person?.name || ''}</h2>
        <p className="text-sm text-gray-400 mb-6">输入PIN码进入</p>
        <input
          type="password"
          value={pin}
          onChange={e => { setPin(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="PIN码"
          autoFocus
          className="w-full text-center text-2xl tracking-widest border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-starbucks-500 mb-4"
          maxLength={6}
        />
        {error && <p className="text-red-500 text-xs mb-3">PIN码错误</p>}
        <button onClick={handleSubmit}
          className="w-full py-3 bg-starbucks-500 text-white rounded-xl font-medium hover:bg-starbucks-600 transition-colors">
          进入
        </button>
        <p className="text-[10px] text-gray-300 mt-4">默认PIN: 1234（可在人员管理中修改）</p>
      </div>
    </div>
  );
}
