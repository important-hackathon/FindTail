"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AnimalForm from "@/components/animals/AnimalForm";

export default function AddAnimalPage() {
  const { user, isShelter, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isShelter)) {
      router.push("/auth/login");
    }
  }, [loading, user, isShelter, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 ">
      {/* <h1 className="text-3xl font-bold mb-6">Add New Animal</h1> */}
      <AnimalForm />
    </div>
  );
}
