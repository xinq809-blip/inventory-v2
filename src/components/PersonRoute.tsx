import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import LoginGate from './LoginGate';

export default function PersonRoute() {
  const { pid } = useParams<{ pid: string }>();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(`v2_unlock_${pid}`) === '1');

  if (!unlocked) {
    return <LoginGate pid={pid!} onUnlock={() => setUnlocked(true)} />;
  }
  return <Outlet />;
}
