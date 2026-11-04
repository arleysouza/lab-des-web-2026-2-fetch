import Link from "next/link";
import { StudentForm } from "@/components/student-form";

export default function NewStudentPage() {
  return (
    <>
      <Link className="back-link" href="/alunos">
        ← Voltar para estudantes
      </Link>
      <p className="eyebrow">Novo registro</p>
      <h1>Cadastrar estudante</h1>
      <p>Informe o RA e o nome completo do estudante.</p>
      <StudentForm />
    </>
  );
}
