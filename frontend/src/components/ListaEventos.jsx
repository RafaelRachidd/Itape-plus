import CartaoEvento from './CartaoEvento';

// Lista com os três estados de tela: carregando, erro e vazio (RNF08).
export default function ListaEventos({ eventos, carregando, erro, vazio = 'Nenhum evento encontrado' }) {
  if (carregando) return <p className="aviso" role="status">Carregando eventos...</p>;
  if (erro) return <p className="aviso aviso-erro" role="alert">{erro}</p>;
  if (eventos.length === 0) return <p className="aviso" role="status">{vazio}</p>;

  return (
    <div className="grade-eventos">
      {eventos.map((evento) => (
        <CartaoEvento key={evento.id} evento={evento} />
      ))}
    </div>
  );
}
