import { cookies } from "next/headers";
import HomeClient from "@/component/HomeClient";

export default async function Home() {
  const token = (await cookies()).get("token")?.value;
  const isAuthenticated = Boolean(token);
  console.log("Token:", token);
  return <HomeClient isAuthenticated={isAuthenticated} />;
}
