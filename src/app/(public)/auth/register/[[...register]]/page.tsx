import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "新規登録",
};

export default function RegisterPage() {
  return <SignUp />;
}
