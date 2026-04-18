import { redirect } from "next/navigation";

export default async function TeamIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/teams/${id}/overview`);
}
