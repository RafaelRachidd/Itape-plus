import { useState } from 'react';

// RF12: mostra a imagem do evento ou, se a URL faltar ou quebrar, uma capa padrão.
export default function ImagemEvento({ url, titulo, className = '' }) {
  const [falhou, setFalhou] = useState(false);
  const valida = typeof url === 'string' && /^https?:\/\//i.test(url) && !falhou;

  if (!valida) {
    return (
      <div className={`imagem-evento-padrao ${className}`} role="img" aria-label={`Capa padrão do evento ${titulo || ''}`}>
        <span aria-hidden="true">✳</span>
      </div>
    );
  }
  return <img className={className} src={url} alt={titulo ? `Imagem do evento ${titulo}` : ''} loading="lazy" onError={() => setFalhou(true)} />;
}
