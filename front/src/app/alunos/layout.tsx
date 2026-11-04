// As consultas dependem da API em tempo de requisição, não durante o build.
export const dynamic = "force-dynamic";

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
