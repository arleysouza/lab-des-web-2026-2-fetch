"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteStudent } from "@/app/alunos/actions";
import type { Student } from "@/types/student";

export function DeleteStudentForm({ student }: { student: Student }) {
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(false);

  async function handleSubmit() {
    setError("");
    setRemoving(true);

    try {
      const message = await deleteStudent(student.ra);
      setError(message);
    } catch {
      setError("Não foi possível enviar a exclusão. Consulte a lista antes de tentar novamente.");
    } finally {
      setRemoving(false);
    }
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="panel student-form"
    >
      <h2>Remover {student.name}?</h2>
      <p>
        RA {student.ra}. A exclusão é permanente. Estudantes com matrículas não
        podem ser removidos.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" className="button danger" disabled={removing}>
          {removing ? "Removendo…" : "Remover estudante"}
        </button>
        <Link href={`/alunos/${student.ra}`}>Cancelar</Link>
      </div>
    </form>
  );
}
