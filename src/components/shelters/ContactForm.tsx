"use client";

import React, { Dispatch, FormEvent, SetStateAction } from "react";

interface ContactFormProps {
  shelter: any;
  setContactForm: Dispatch<
    SetStateAction<{ message: string; showForm: boolean }>
  >;
  messageSent: boolean;
  messageValue: string;
  sending: boolean;
  handleContactFormSubmit: (e: FormEvent) => void;
}

const ContactForm = ({
  shelter,
  setContactForm,
  messageValue,
  sending,
  messageSent,
  handleContactFormSubmit,
}: ContactFormProps) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto  bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Контакт {shelter.shelter_details.shelter_name}
            </h3>
            <button
              onClick={() =>
                setContactForm((prev) => ({ ...prev, showForm: false }))
              }
              className="text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              &times;
            </button>
          </div>

          {messageSent ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              Ваше повідомлення відправлено! Притулок зв'яжеться з вами
              найближчим часом.{" "}
            </div>
          ) : (
            <form onSubmit={handleContactFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Повідомлення до Притулку{" "}
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageValue}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ваше повідомлення до притулку..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setContactForm((prev) => ({
                      ...prev,
                      showForm: false,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {sending ? "Надсилання..." : "Надіслати повідомлення"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
