"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import SwitchButton from "./SwitchButton";
import TextInput from "./TextInput";
import RegisterTextInput from "./RegisterTextInput";
import RegisterDropDown from "./RegisterDropDown";
import { shelterTypeOptions } from "./dropDownOptions";
import AuthButton from "./AuthButton";
import RememberMe from "./RememberMe";

export default function RegisterForm() {
  const [userType, setUserType] = useState<"volunteer" | "shelter">(
    "volunteer"
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    // Volunteer fields
    fullName: "",
    phoneNumber: "",
    address: "",
    // Shelter fields
    shelterName: "",
    shelterType: "animal_shelter",
    description: "",
    location: "",
    website: "",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeRememberMe = (e: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Паролі не збігаються!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Пароль має містити щонайменше 6 символів");
      return;
    }

    const profileData =
      userType === "volunteer"
        ? {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
          }
        : {
            fullName: formData.shelterName,
            phoneNumber: formData.phoneNumber,
            address: formData.location,
            shelterName: formData.shelterName,
            shelterType: formData.shelterType,
            description: formData.description,
            location: formData.location,
            website: formData.website,
          };

    const { user, error } = await signUp(
      formData.email,
      formData.password,
      userType,
      profileData
    );

    if (error) {
      setError(error.message);
    } else {
      router.push("/auth/login?registered=true");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <SwitchButton
            text="Я волонтер"
            userType="volunteer"
            setUserType={setUserType}
            activeUserType={userType}
          />

          <SwitchButton
            text="Я представник притулку"
            userType="shelter"
            setUserType={setUserType}
            activeUserType={userType}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 ">
        {/* Common Fields */}

        <RegisterTextInput
          type="email"
          name="email"
          label="Електронна адреса"
          value={formData.email}
          handleChange={handleChange}
        />

        <RegisterTextInput
          type="password"
          name="password"
          label="Пароль"
          value={formData.password}
          handleChange={handleChange}
        />

        <RegisterTextInput
          type="password"
          name="confirmPassword"
          label="Підтвердіть пароль"
          value={formData.confirmPassword}
          handleChange={handleChange}
        />

        {/* Volunteer-specific fields */}
        {userType === "volunteer" && (
          <>
            <RegisterTextInput
              type="text"
              name="fullName"
              label="Повне ім'я"
              value={formData.fullName}
              handleChange={handleChange}
            />

            <RegisterTextInput
              type="tel"
              name="phoneNumber"
              label="Номер телефону"
              value={formData.phoneNumber}
              handleChange={handleChange}
            />

            <RegisterTextInput
              type="text"
              name="address"
              label="Адреса"
              value={formData.address}
              handleChange={handleChange}
            />
          </>
        )}

        {/* Shelter-specific fields */}
        {userType === "shelter" && (
          <>
            <RegisterTextInput
              type="text"
              name="shelterName"
              value={formData.shelterName}
              handleChange={handleChange}
              label="Ім'я закладу"
            />

            <RegisterDropDown
              label="Тип закладу"
              name="shelterType"
              value={formData.shelterType}
              handleChange={handleChange}
              options={shelterTypeOptions}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border bg-[#D7DDE7] border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <RegisterTextInput
              type="text"
              name="location"
              label="Розташування"
              value={formData.location}
              handleChange={handleChange}
            />

            <RegisterTextInput
              type="url"
              name="website"
              label="Вебсайт"
              value={formData.website}
              handleChange={handleChange}
            />
          </>
        )}

        <div className="flex justify-center mt-10 mb-5">
          <RememberMe
            rememberMe={rememberMe}
            handleChangeRememberMe={handleChangeRememberMe}
          />
        </div>

        <div className="flex justify-center">
          <AuthButton
            buttonText="Зареєструватися"
            buttonLoadingText="Створення аккаунту..."
            loading={loading}
          />
        </div>
      </form>

      <div className="mt-8">
        <p className="text-[#432907] underline flex gap-2 justify-center flex-col items-center  sm:flex-row">
          <Link href="/auth/login">Вже є акаунт?</Link>
        </p>
      </div>
    </div>
  );
}
