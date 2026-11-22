import { Routes, Route } from 'react-router-dom';
import Cabecalho from './components/Cabecalho';
import RotaProtegida from './components/RotaProtegida';
import Inicio from './pages/Inicio';
import EmConstrucao from './pages/EmConstrucao';
import Eventos from './pages/Eventos';
import DetalhesEvento from './pages/DetalhesEvento';
import Calendario from './pages/Calendario';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Painel from './pages/Painel';
import FormEvento from './pages/FormEvento';
import Moderacao from './pages/Moderacao';

// Rotas do site. Painel e moderação exigem login e o perfil certo.
export default function App() {
  return (
    <>
      <Cabecalho />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<DetalhesEvento />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/painel" element={<RotaProtegida perfil="organizador"><Painel /></RotaProtegida>} />
          <Route path="/painel/novo" element={<RotaProtegida perfil="organizador"><FormEvento /></RotaProtegida>} />
          <Route path="/painel/eventos/:id/editar" element={<RotaProtegida perfil="organizador"><FormEvento /></RotaProtegida>} />
          <Route path="/admin" element={<RotaProtegida perfil="administrador"><Moderacao /></RotaProtegida>} />
          <Route path="*" element={<EmConstrucao />} />
        </Routes>
      </main>
      <footer className="rodape">Itape + · FATEC Itapetininga · 2026</footer>
    </>
  );
}
