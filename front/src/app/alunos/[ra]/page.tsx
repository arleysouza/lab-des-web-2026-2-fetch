import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudent } from "@/services/students";
import { isValidRa } from "@/lib/validation";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ ra: string }>;
}) {
  // No App Router atual, params é uma Promise.
  const { ra } = await params;
  if (!isValidRa(ra)) {
    notFound();
  }

  const student = await getStudent(Number(ra));
  if (!student) notFound();

  return (
    <>
      <Link className="back-link" href="/alunos">
        ← Voltar para estudantes
      </Link>
      <section className="panel details" aria-labelledby="dados-heading">
        <h2 id="dados-heading">Dados do estudante</h2>
        <dl>
          <div>
            <dt>Registro acadêmico (RA)</dt>
            <dd className="ra">{student.ra}</dd>
          </div>
          <div>
            <dt>Nome completo</dt>
            <dd>{student.name}</dd>
          </div>
        </dl>
      </section>
      <div className="form-actions">
        <Link className="button" href={`/alunos/${student.ra}/editar`}>
          Editar estudante
        </Link>
        <Link className="danger-link" href={`/alunos/${student.ra}/remover`}>
          Remover estudante
        </Link>
      </div>
    </>
  );
}
