"use client";

import Link from "next/link";
import { useState } from "react";
import { createStudent, updateStudent } from "@/app/alunos/actions";
import type { Student } from "@/types/student";

export function StudentForm({ student }: { student?: Student }) {
  const [ra, setRa] = useState(student ? String(student.ra) : "");
  const [name, setName] = useState(student ? student.name : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setError("");
    setSaving(true);

    try {
      let message: string;
      if (student) {
        message = await updateStudent(student.ra, name);
      } else {
        message = await createStudent(ra, name);
      }
      setError(message);
    } catch {
      setError("Não foi possível enviar os dados. Consulte a lista antes de tentar novamente.");
    } finally {
      setSaving(false);
    }
  }

  let buttonText = "Cadastrar estudante";
  let cancelUrl = "/alunos";
  if (student) {
    buttonText = "Salvar alterações";
    cancelUrl = `/alunos/${student.ra}`;
  }
  if (saving) buttonText = "Salvando…";
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="panel student-form"
    >
      <div className="field">
        <label htmlFor="ra">Registro acadêmico (RA)</label>
        <input
          id="ra"
          name="ra"
          type="number"
          min="1"
          max="2147483647"
          step="1"
          required
          readOnly={student !== undefined}
          value={ra}
          onChange={(event) => setRa(event.target.value)}
          aria-describedby={student ? "ra-help" : undefined}
        />
        {student && (
          <small id="ra-help">
            O RA identifica o estudante e não pode ser alterado.
          </small>
        )}
      </div>
      <div className="field">
        <label htmlFor="name">Nome completo</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={3}
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button className="button" type="submit" disabled={saving}>
          {buttonText}
        </button>
        <Link href={cancelUrl}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
