import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estudantes | Gestão acadêmica",
  description: "Consulta de estudantes — exemplo da Aula 3 de Next.js.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <header className="site-header">
          <div className="header-inner">
            <Link className="brand" href="/alunos"><span className="brand-mark" aria-hidden="true">A</span> Gestão acadêmica</Link>
            <nav aria-label="Navegação principal"><Link href="/alunos">Estudantes</Link></nav>
          </div>
        </header>
        <main id="conteudo" className="container">{children}</main>
        <footer className="container footer">Laboratório de Desenvolvimento Web · Aula 3</footer>
      </body>
    </html>
  );
}
