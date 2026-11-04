import "server-only";
import type { Student } from "@/types/student";

function apiUrl(path: string): string {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("Configure API_URL no ambiente do servidor Next.js.");
  }
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export async function getStudents(): Promise<Student[]> {
  // Executado no servidor. Cada consulta busca dados atuais na API.
  const response = await fetch(apiUrl("/api/students"), {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar estudantes (HTTP ${response.status}).`);
  }

  return response.json();
}

// Nas operações de escrita, a action verifica o status e apresenta a mensagem.
export async function createStudent(
  ra: number,
  name: string,
): Promise<Response> {
  return fetch(apiUrl("/api/students"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ra, name }),
    signal: AbortSignal.timeout(10000),
  });
}

export async function updateStudent(
  ra: number,
  name: string,
): Promise<Response> {
  return fetch(apiUrl(`/api/students/${ra}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
    signal: AbortSignal.timeout(10000),
  });
}

export async function deleteStudent(ra: number): Promise<Response> {
  return fetch(apiUrl(`/api/students/${ra}`), {
    method: "DELETE",
    signal: AbortSignal.timeout(10000),
  });
}

export async function getStudent(ra: number): Promise<Student | null> {
  const response = await fetch(apiUrl(`/api/students/${ra}`), {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  // Só 404 significa ausência. Falhas de rede e outros status são erros.
  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Falha ao consultar estudante (HTTP ${response.status}).`);
  }

  return response.json();
}
