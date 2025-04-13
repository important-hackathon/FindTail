"use client";
import { useAuth } from "@/contexts/AuthContext";
import React, { Dispatch, SetStateAction } from "react";

interface ShelterContactInfoProps {
  shelter: any;
  setContactForm: Dispatch<
    SetStateAction<{ message: string; showForm: boolean }>
  >;
  contactForm: { message: string; showForm: boolean };
}

const ShelterContactInfo = ({
  shelter,
  setContactForm,
  contactForm,
}: ShelterContactInfoProps) => {
  const { isVolunteer } = useAuth();

  return (
    <div className="flex flex-col gap-4 sm:flex-row justify-between items-center">
      <div>
        {shelter.phone_number && (
          <p>
            <span className="font-semibold">Контакт:</span>{" "}
            {shelter.phone_number}
          </p>
        )}

        {shelter.email && (
          <p>
            <span className="font-semibold">Email:</span> {shelter.email}
          </p>
        )}

        {isVolunteer && (
          <button
            onClick={() => setContactForm({ ...contactForm, showForm: true })}
            className="text-sm lg:text-base  bg-[#D7DDE7] uppercase py-2 px-8 font-semibold rounded-full cursor-pointer shadow-md"
          >
            Написати
          </button>
        )}
      </div>

      <div className="text-sm lg:text-base flex flex-col gap-4">
        <button className="text-white bg-[#88A7D5] uppercase py-2 px-8 font-semibold rounded-full cursor-pointer shadow-2xl">
          донат
        </button>
        <button className="text-white bg-[#88A7D5] uppercase py-2 px-8 font-semibold rounded-full cursor-pointer shadow-2xl">
          хочу передати!
        </button>
      </div>
    </div>
  );
};

export default ShelterContactInfo;
