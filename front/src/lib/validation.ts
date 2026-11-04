// O RA é um inteiro positivo de 32 bits no banco de dados.
export function isValidRa(value: string): boolean {
  const ra = Number(value);
  return (
    /^\d+$/.test(value) && Number.isInteger(ra) && ra > 0 && ra <= 2147483647
  );
}
