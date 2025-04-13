"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import RememberMe from "./RememberMe";
import AuthButton from "./AuthButton";
import TextInput from "./TextInput";

interface LoginFormProps {
  isRegistered?: boolean;
}

export default function LoginForm({ isRegistered = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const handleChangeRememberMe = (e: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { user, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto px-8 py-4 sm:p-8 rounded-lg ">
      {isRegistered && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Реєстрація пройшла успішно! Будь ласка увійдітьв ваш акаунт.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          type="email"
          value={email}
          label="Електронна пошта"
          handleChange={setEmail}
        />

        <TextInput
          type="password"
          value={password}
          label="Пароль"
          handleChange={setPassword}
        />

        <div className="flex items-center justify-center mt-10">
          <RememberMe
            rememberMe={rememberMe}
            handleChangeRememberMe={handleChangeRememberMe}
          />
        </div>

        <div className="flex justify-center">
          <AuthButton
            loading={loading}
            buttonText="Увійти"
            buttonLoadingText="Вхід..."
          />
        </div>
      </form>

      <div className="mt-8">
        <p className="text-[#432907] underline flex gap-2 justify-center flex-col items-center  sm:flex-row">
          <Link href="#">Забули пароль?</Link>
          <Link href="/auth/register">Ще немає акаунту?</Link>
        </p>
      </div>
    </div>
  );
}