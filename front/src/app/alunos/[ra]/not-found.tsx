import Link from "next/link";

export default function StudentNotFound() {
  return (
    <section className="panel state">
      <p className="eyebrow">Registro não encontrado</p>
      <h1>Estudante não encontrado</h1>
      <p>
        O RA informado é inválido ou não pertence a um estudante cadastrado.
      </p>
      <Link className="button" href="/alunos">
        Voltar para estudantes
      </Link>
    </section>
  );
}
