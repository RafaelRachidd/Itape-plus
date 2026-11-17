import { Routes, Route } from 'react-router-dom';
import Cabecalho from './components/Cabecalho';
import RotaProtegida from './components/RotaProtegida';
import Inicio from './pages/Inicio';
import Eventos from './pages/Eventos';
import DetalhesEvento from './pages/DetalhesEvento';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Painel from './pages/Painel';
import FormEvento from './pages/FormEvento';
import Perfil from './pages/Perfil';
import Moderacao from './pages/Moderacao';
import EmConstrucao from './pages/EmConstrucao';

// Rotas do MVP. /painel exige organizador e /admin exige administrador (RNF03).
export default function App() {
  return (
    <>
      <Cabecalho />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<DetalhesEvento />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/painel" element={<RotaProtegida perfil="organizador"><Painel /></RotaProtegida>} />
          <Route path="/painel/eventos/novo" element={<RotaProtegida perfil="organizador"><FormEvento /></RotaProtegida>} />
          <Route path="/painel/eventos/:id/editar" element={<RotaProtegida perfil="organizador"><FormEvento /></RotaProtegida>} />
          <Route path="/painel/perfil" element={<RotaProtegida perfil="organizador"><Perfil /></RotaProtegida>} />
          <Route path="/admin" element={<RotaProtegida perfil="admin"><Moderacao /></RotaProtegida>} />
          <Route path="*" element={<EmConstrucao titulo="Página não encontrada" versao="—" />} />
        </Routes>
      </main>
      <footer className="rodape">Itape + · FATEC Itapetininga · 2026</footer>
    </>
  );
}
