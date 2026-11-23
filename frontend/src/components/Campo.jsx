// Campo de formulário com rótulo e mensagem de erro ligada ao campo (RNF04, acessibilidade).
export default function Campo({ id, rotulo, opcional, erro, ajuda, largo, children }) {
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  const descricao = [erro ? idErro : null, ajuda ? idAjuda : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={'pn-campo' + (largo ? ' pn-campo-largo' : '')}>
      <label htmlFor={id}>{rotulo} {opcional && <small>(opcional)</small>}</label>
      {children({ id, 'aria-invalid': erro ? 'true' : undefined, 'aria-describedby': descricao })}
      {erro && <p className="pn-campo-erro" id={idErro}>{erro}</p>}
      {ajuda && !erro && <p className="pn-campo-ajuda" id={idAjuda}>{ajuda}</p>}
    </div>
  );
}
