import { PublicIntakeForm } from "@/components/screens/PublicIntakeForm";

export default async function IntakePage({ params }) {
  const { token } = await params;
  return <PublicIntakeForm token={token} />;
}
