import { Routes, Route } from 'react-router-dom';
import Cabecalho from './components/Cabecalho';
import Inicio from './pages/Inicio';
import Eventos from './pages/Eventos';
import DetalhesEvento from './pages/DetalhesEvento';
import EmConstrucao from './pages/EmConstrucao';

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
          <Route path="/cadastro" element={<EmConstrucao titulo="Criar conta de organizador" versao="v0.3.0" />} />
          <Route path="/login" element={<EmConstrucao titulo="Entrar" versao="v0.3.0" />} />
          <Route path="/painel" element={<EmConstrucao titulo="Painel do organizador" versao="v0.3.0" />} />
          <Route path="/admin" element={<EmConstrucao titulo="Moderação" versao="v0.4.0" />} />
          <Route path="*" element={<EmConstrucao titulo="Página não encontrada" versao="—" />} />
        </Routes>
      </main>
      <footer className="rodape">Itape + · FATEC Itapetininga · 2026</footer>
    </>
  );
}
