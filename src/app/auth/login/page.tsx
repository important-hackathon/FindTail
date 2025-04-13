// src/app/auth/login/page.tsx
import { Suspense } from "react";
import LoginPageContent from "@/components/auth/LoginPageContent";
import { Montserrat_Alternates } from "next/font/google";

const montserrat = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={`${montserrat.className} min-h-screen bg-[#F7EFE3] flex flex-col justify-center py-12 sm:px-6 lg:px-8`}>Loading...</div>}>
      <LoginPageContent fontClass={montserrat.className} />
    </Suspense>
  );
}