function Campo({ label, id, prefixo, textarea, select, opcoes = [], className = '', ...props }) {
  let controle
  if (textarea) {
    controle = <textarea id={id} {...props} />
  } else if (select) {
    controle = (
      <select id={id} {...props}>
        {opcoes.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
    )
  } else {
    controle = <input id={id} {...props} />
  }

  return (
    <div className={['campo', className].filter(Boolean).join(' ')}>
      {label && <label htmlFor={id}>{label}</label>}
      {prefixo ? (
        <div className="campo-com-prefixo">
          <span className="campo-prefixo">{prefixo}</span>
          {controle}
        </div>
      ) : (
        controle
      )}
    </div>
  )
}

export default Campo