// Campo de formulário com rótulo, dica e mensagem de erro ligada ao campo (acessível).
export default function Campo({ id, rotulo, erro, dica, children, className = '' }) {
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;

  return (
    <div className={`campo ${erro ? 'campo-com-erro' : ''} ${className}`}>
      <label htmlFor={id}>{rotulo}</label>
      {children({ id, 'aria-invalid': erro ? true : undefined, 'aria-describedby': [idDica, idErro].filter(Boolean).join(' ') || undefined })}
      {dica && <small id={idDica} className="campo-dica">{dica}</small>}
      {erro && <small id={idErro} className="campo-erro" role="alert">{erro}</small>}
    </div>
  );
}
