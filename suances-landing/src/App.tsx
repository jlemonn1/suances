import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Carta } from './pages/Carta';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/carta" element={<Carta mostrarPrecios={false} />} />
        <Route path="/carta/precios" element={<Carta mostrarPrecios={true} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
