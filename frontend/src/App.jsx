import { Routes, Route } from 'react-router-dom';
import Cabecalho from './components/Cabecalho';
import Inicio from './pages/Inicio';  
import EmConstrucao from './pages/EmConstrucao';
import Eventos from './pages/Eventos';
import DetalhesEvento from './pages/DetalhesEvento';
import Calendario from './pages/Calendario';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';


// Rotas do MVP. As páginas provisórias serão trocadas a cada versão.
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
          <Route path="/painel" element={<EmConstrucao titulo="Painel do organizador" versao="v0.3.0" />} />
          <Route path="/admin" element={<EmConstrucao titulo="Moderação" versao="v0.4.0" />} />
          <Route path="*" element={<EmConstrucao titulo="Página não encontrada" versao="—" />} />
          <Route path="/calendario" element={<Calendario />} />
        </Routes>
      </main>
      <footer className="rodape">Itape + · FATEC Itapetininga · 2026</footer>
    </>
  );
}
