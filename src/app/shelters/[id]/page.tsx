"use client";

import { SwiperSlide } from "swiper/react";
import "swiper/css";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ShelterInfo from "@/components/shelters/ShelterInfo";
import ContactForm from "@/components/shelters/ContactForm";
import BackBtn from "@/components/shelters/BackBtn";
import Image from "next/image";
import ShelterContactInfo from "@/components/shelters/ShelterContactInfo";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Carousel from "@/components/ui/Carousel";
import Link from "next/link";

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

  const images = animals
    .map((animal) =>
      animal.images.map((image: { image_url: string }) => image.image_url)
    )
    .flat();

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

        <BackBtn href="/shelters" text="Назад" />
      </div>
    );
  }

  return (
    <div className="bg-[#F7EFE3] min-h-screen py-20 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="mb-12 md:mb-6 flex justify-start">
          <BackBtn href="/shelters" text="Назад" />
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 w-full h-full pb-120 md:pb-90 lg:pb-35 border-b-3 border-[#D7DDE7] items-start ">
            {/*Slider*/}
            <div className="col-span-5 md:col-span-2 w-full h-full order-2 md:order-first">
              <div className="max-h-110 lg:max-h-130 h-full relative  shadow-md">
                <Carousel
                  leftButton={
                    <div className="absolute top-1/2 left-5 transform -translate-y-1/2 z-10">
                      <button className="cursor-pointer">
                        <ArrowLeft size={40} color="#fff" />
                      </button>
                    </div>
                  }
                  rightButton={
                    <div className="absolute top-1/2 right-5 transform -translate-y-1/2 z-10">
                      <button className="cursor-pointer">
                        <ArrowRight size={40} color="#fff" />
                      </button>
                    </div>
                  }
                >
                  {images.map((img) => (
                    <SwiperSlide>
                      <Image
                        src={img}
                        alt="Animal image"
                        layout="fill"
                        objectFit="cover"
                      />
                    </SwiperSlide>
                  ))}
                </Carousel>
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {images
                    .reverse()
                    .slice(0, 4)
                    .map((img, index) => (
                      <div key={index}>
                        <img
                          src={img}
                          alt="Animal"
                          className="aspect-square object-cover w-full h-full"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/*Info */}
            <div className="col-span-5 md:col-span-3 order-1 md:order-last relative text-[#432907] ">
              <Image
                className="absolute -top-11 -left-8"
                src="/assets/images/pet-ears.png"
                alt="pet ears"
                width={70}
                height={70}
              />

              <div className="px-2">
                <h1 className="text-3xl font-bold mb-4">
                  {shelter.shelter_details.shelter_name}
                </h1>

                <ShelterInfo shelter={shelter} />

                <p className="border-y-3 py-10 border-[#D7DDE7] mb-10">
                  {shelter.shelter_details.description || "Не надано опису."}
                </p>

                <ShelterContactInfo
                  shelter={shelter}
                  contactForm={contactForm}
                  setContactForm={setContactForm}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-center text-2xl sm:text-3xl text-[#432907] font-bold">
            Недавно переглянуті
          </h2>

          <div className="mt-10">
            {animals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Жодна тварина недоступна.
                </h3>
                <p className="text-gray-600 mb-4">
                  На даний момент у цьому притулку немає жодної тварини,
                  зазначеної для усиновлення.
                </p>
                <p className="text-gray-600">
                  Будь ласка, перевірте пізніше або зв’яжіться з притулком для
                  отримання додаткової інформації.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {animals.map((animal) => (
                  <Link href={`/animals/${animal.id}`}>
                    <div
                      key={animal.id}
                      className="overflow-hidden shadow-2xl rounded-sm cursor-pointer"
                    >
                      <div className="relative h-48 ">
                        {animal.images && animal.images[0] ? (
                          <img
                            src={animal.images[0].image_url}
                            alt={animal.name}
                            className="w-full h-full object-cover "
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[#432907]">No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-sm text-[#432907] py-8">
                        <h3 className="font-bold text-2xl text-center">
                          {animal.name}
                        </h3>
                        <p className="text-center text-xl">{animal.species}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

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
    </div>
  );
}
