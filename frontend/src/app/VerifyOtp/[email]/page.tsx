import VerifyOtp from "@/component/VerifyOtp";

export default async function Page({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail);

  if (!email) return <p>Invalid request</p>;

  return <VerifyOtp email={email} />;
}