import { notFound } from "next/navigation";
import { getStudent } from "@/services/students";
import { isValidRa } from "@/lib/validation";
import { StudentForm } from "@/components/student-form";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ ra: string }>;
}) {
  const { ra } = await params;
  if (!isValidRa(ra)) notFound();
  const student = await getStudent(Number(ra));
  if (!student) notFound();
  return (
    <>
      <p className="eyebrow">Dados cadastrais</p>
      <h1>Editar estudante</h1>
      <p>Atualize o nome do estudante e salve as alterações.</p>
      <StudentForm student={student} />
    </>
  );
}
