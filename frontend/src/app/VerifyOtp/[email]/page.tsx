import VerifyOtp from "@/component/VerifyOtp";

export default function Page({ params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email);

  if (!email) return <p>Invalid request</p>;

  return <VerifyOtp email={email} />;
}