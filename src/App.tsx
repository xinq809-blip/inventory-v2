import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import DataEntry from './pages/DataEntry';
import Ranking from './pages/Ranking';
import Distributors from './pages/Distributors';
import Products from './pages/Products';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/entry" element={<DataEntry />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/distributors" element={<Distributors />} />
            <Route path="/products" element={<Products />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
