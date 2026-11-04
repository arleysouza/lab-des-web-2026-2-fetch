"use client";

export default function StudentsError() {
  return (
    <section className="panel state" role="alert">
      <p className="eyebrow">Falha na consulta</p>
      <h1>Não foi possível carregar os dados</h1>
      <p>Verifique se a API está disponível e tente novamente.</p>
      {/* Uma nova navegação ao servidor repete o fetch sem cache. */}
      <button
        className="button"
        onClick={() => {
          window.location.reload();
        }}
      >
        Tentar novamente
      </button>
    </section>
  );
}
