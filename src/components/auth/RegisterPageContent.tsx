'use client';

import RegisterForm from "@/components/forms/RegisterForm";
import Image from "next/image";

interface RegisterPageContentProps {
  fontClass: string;
}

export default function RegisterPageContent({ fontClass }: RegisterPageContentProps) {
  return (
    <div
      className={`${fontClass} min-h-screen bg-[#F7EFE3] flex flex-col justify-center py-24 sm:px-6 lg:px-8 relative overflow-hidden`}
    >
      <Image
        className="absolute bottom-0 right-30 xl:left:50 hidden lg:block "
        src="/assets/images/register-dog.png"
        alt="dog"
        width={400}
        height={200}
      />

      <Image
        className="absolute z-0 hidden md:block"
        src="/assets/images/auth-line.png"
        alt="white line"
        width={900}
        height={700}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative">
        <Image
          className="absolute -left-5 -top-12 hidden sm:block"
          src="/assets/images/pet-ears.png"
          alt="pet ears"
          width={80}
          height={80}
        />

        <Image
          className="absolute right-10 top-[-70px] "
          src="/assets/images/login-animals.png"
          alt="animals"
          width={250}
          height={70}
        />
        <h1 className="text-center text-xl sm:text-2xl font-extrabold font-montserratAlt text-[#432907]">
          Створи свій акаунт волонтера
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <RegisterForm />
      </div>
    </div>
  );
}