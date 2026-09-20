function Button({ variant = 'primario', bloqueio, className = '', ...props }) {
  const classes = ['btn', `btn-${variant}`, bloqueio ? 'btn-bloqueio' : '', className]
    .filter(Boolean)
    .join(' ')

  return <button className={classes} {...props} />
}

export default Button