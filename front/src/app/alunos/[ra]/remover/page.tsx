import { notFound } from "next/navigation";
import { getStudent } from "@/services/students";
import { isValidRa } from "@/lib/validation";
import { DeleteStudentForm } from "@/components/delete-student-form";

export default async function RemoveStudentPage({
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
      <p className="eyebrow">Exclusão de registro</p>
      <h1>Remover estudante</h1>
      <DeleteStudentForm student={student} />
    </>
  );
}
