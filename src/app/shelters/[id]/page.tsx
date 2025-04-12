"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import AnimalListItem from "@/components/animals/AnimalListItem";
import ShelterInfo from "@/components/shelters/ShelterInfo";
import ContactForm from "@/components/shelters/ContactForm";

export default function ShelterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isVolunteer } = useAuth();

  const [shelter, setShelter] = useState<any>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    message: "",
    showForm: false,
  });
  const [sending, setSending] = useState<boolean>(false);
  const [messageSent, setMessageSent] = useState<boolean>(false);

  useEffect(() => {
    fetchShelterDetails();
  }, [id]);

  const fetchShelterDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get shelter details
      const { data: shelterData, error: shelterError } = await supabase
        .from("profiles")
        .select(
          `
          *,
          shelter_details(*)
        `
        )
        .eq("id", id)
        .eq("user_type", "shelter")
        .single();

      if (shelterError) throw shelterError;

      setShelter(shelterData);

      // Get animals from this shelter
      const { data: animalsData, error: animalsError } = await supabase
        .from("animals")
        .select(
          `
          *,
          images:animal_images(*)
        `
        )
        .eq("shelter_id", id)
        .eq("is_adopted", false)
        .order("created_at", { ascending: false });

      if (animalsError) throw animalsError;

      setAnimals(animalsData || []);
    } catch (err: any) {
      console.error("Error fetching shelter details:", err);
      setError("Failed to load shelter details");
    } finally {
      setLoading(false);
    }
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      setSending(true);
      // Insert message into the database
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: shelter.id,
        content: contactForm.message,
      });

      if (error) throw error;

      setMessageSent(true);
      setContactForm({
        message: "",
        showForm: false,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Завантаження...</p>
      </div>
    );
  }

  if (error || !shelter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error || "Shelter not found"}
        </div>
        <Link
          href="/shelters"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Повернутися до Притулків
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-6">
        <Link href="/shelters" className="text-blue-600 hover:text-blue-800">
          Повернутися до Притулків
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {shelter.shelter_details.shelter_name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShelterInfo shelter={shelter} />

            <div>
              <h2 className="text-lg font-semibold mb-2">Про нас</h2>
              <p className="text-gray-600">
                {shelter.shelter_details.description || "Не надано опису."}
              </p>

              {isVolunteer && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      setContactForm({ ...contactForm, showForm: true })
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                  >
                    Зв'язатися з притулком
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Доступні тварини</h2>

      {animals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Жодна тварина недоступна.
          </h3>
          <p className="text-gray-600 mb-4">
            На даний момент у цьому притулку немає жодної тварини, зазначеної
            для усиновлення.{" "}
          </p>
          <p className="text-gray-600">
            Будь ласка, перевірте пізніше або зв’яжіться з притулком для
            отримання додаткової інформації.{" "}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.map((animal) => (
            <AnimalListItem key={animal.id} animal={animal} />
          ))}
        </div>
      )}

      {/* Contact Form Modal */}
      {contactForm.showForm && (
        <ContactForm
          messageSent={messageSent}
          messageValue={contactForm.message}
          shelter={shelter}
          sending={sending}
          handleContactFormSubmit={handleContactFormSubmit}
          setContactForm={setContactForm}
        />
      )}
    </div>
  );
}
