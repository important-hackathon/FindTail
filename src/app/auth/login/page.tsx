import LoginForm from "@/components/forms/LoginForm";
import { Montserrat_Alternates } from "next/font/google";
import Image from "next/image";

const montserrat = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function LoginPage() {
  return (
    <div
      className={`${montserrat.className} min-h-screen bg-[#F7EFE3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden`}
    >
      <Image
        className="absolute bottom-0 left-35 xl:left:50 hidden lg:block "
        src="/assets/images/login-cat.png"
        alt="cat"
        width={500}
        height={200}
      />

      <Image
        className="absolute z-0 hidden md:block"
        src="/assets/images/auth-line.png"
        alt="white line"
        width={700}
        height={700}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative">
        <Image
          className="absolute left-10 -top-12 hidden sm:block"
          src="/assets/images/pet-ears.png"
          alt="pet ears"
          width={80}
          height={80}
        />

        <Image
          className="absolute right-16 top-[-70px] "
          src="/assets/images/login-animals.png"
          alt="animals"
          width={250}
          height={70}
        />

        <h1 className="text-center text-xl sm:text-2xl font-extrabold font-montserratAlt text-[#432907]">
          Увійдіть у свій аккаунт
        </h1>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}
