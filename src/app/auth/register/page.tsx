// src/app/auth/register/page.tsx
import { Suspense } from "react";
import RegisterPageContent from "@/components/auth/RegisterPageContent";
import { Montserrat_Alternates } from "next/font/google";

const montserrat = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className={`${montserrat.className} min-h-screen bg-[#F7EFE3] flex flex-col justify-center py-24 sm:px-6 lg:px-8`}>Loading...</div>}>
      <RegisterPageContent fontClass={montserrat.className} />
    </Suspense>
  );
}