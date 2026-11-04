// O Next.js cria uma fronteira de Suspense para este segmento.
export default function Loading() {
  return (
    <div className="panel state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <h2>Carregando estudantes…</h2>
      <p>Aguarde enquanto buscamos os dados.</p>
    </div>
  );
}
