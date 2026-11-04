"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as studentsService from "@/services/students";
import { isValidRa } from "@/lib/validation";

// Cada ação retorna uma mensagem de erro ou redireciona após o sucesso.
export async function createStudent(ra: string, name: string): Promise<string> {
  name = name.trim();
  if (!isValidRa(ra)) return "Informe um RA inteiro entre 1 e 2147483647.";
  if (name.length < 3 || name.length > 100)
    return "O nome deve ter entre 3 e 100 caracteres.";

  try {
    const response = await studentsService.createStudent(Number(ra), name);

    if (response.status === 409) return "Já existe um estudante com este RA.";
    if (!response.ok)
      return "Não foi possível cadastrar o estudante. Confira os dados.";
  } catch {
    return "Não foi possível confirmar o cadastro. Consulte a lista antes de tentar novamente.";
  }

  revalidatePath("/alunos", "layout");
  // redirect interrompe a função, por isso fica fora do try/catch.
  redirect(`/alunos/${Number(ra)}`);
}

export async function updateStudent(ra: number, name: string): Promise<string> {
  name = name.trim();
  if (!isValidRa(String(ra))) return "RA inválido.";
  if (name.length < 3 || name.length > 100)
    return "O nome deve ter entre 3 e 100 caracteres.";

  try {
    const response = await studentsService.updateStudent(ra, name);

    if (response.status === 404)
      return "Estudante não encontrado. Volte para a lista.";
    if (!response.ok)
      return "Não foi possível atualizar o estudante. Confira os dados.";
  } catch {
    return "Não foi possível confirmar a atualização. Consulte os dados antes de tentar novamente.";
  }

  revalidatePath("/alunos", "layout");
  redirect(`/alunos/${ra}`);
}

export async function deleteStudent(ra: number): Promise<string> {
  if (!isValidRa(String(ra))) return "RA inválido.";

  try {
    const response = await studentsService.deleteStudent(ra);

    if (response.status === 409)
      return "Este estudante possui matrículas e não pode ser removido.";
    if (response.status === 404)
      return "O estudante já foi removido. Volte para a lista.";
    if (!response.ok)
      return "Não foi possível remover o estudante. Tente novamente.";
  } catch {
    return "Não foi possível confirmar a exclusão. Consulte a lista antes de tentar novamente.";
  }

  revalidatePath("/alunos", "layout");
  redirect("/alunos");
}
