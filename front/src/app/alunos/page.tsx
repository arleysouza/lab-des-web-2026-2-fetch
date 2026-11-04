import Link from "next/link";
import { getStudents } from "@/services/students";

// Server Component assíncrono: consulta primeiro, renderiza depois.
export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <>
      <p className="eyebrow">Secretaria acadêmica</p>
      <Link className="button" href="/alunos/novo">
        Cadastrar estudante
      </Link>
      <div className="page-heading">
        <h1>Estudantes</h1>
        <p>Consulte os estudantes e acesse os dados de cada registro.</p>
      </div>
      <section className="panel" aria-label="Lista de estudantes">
        {students.length === 0 ? (
          <div className="state">
            <h2>Nenhum estudante cadastrado</h2>
            <p>
              Os estudantes aparecerão aqui assim que forem cadastrados na API.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Registro acadêmico</th>
                  <th scope="col">Nome do estudante</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.ra}>
                    <td className="ra">
                      <Link href={`/alunos/${student.ra}`}>{student.ra}</Link>
                    </td>
                    <td>{student.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
