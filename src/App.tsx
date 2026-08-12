import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import PersonRoute from './components/PersonRoute';
import Summary from './pages/Summary';
import Overview from './pages/Overview';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import Ranking from './pages/Ranking';
import Distributors from './pages/Distributors';
import PersonDistributors from './pages/PersonDistributors';
import Products from './pages/Products';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/summary" element={<Summary />} />
            <Route path="/person/:pid" element={<PersonRoute />}>
              <Route path="overview" element={<Overview />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="entry" element={<DataEntry />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="distributors" element={<PersonDistributors />} />
            </Route>
            <Route path="/distributors" element={<Distributors />} />
            <Route path="/products" element={<Products />} />
            <Route path="*" element={<Summary />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
