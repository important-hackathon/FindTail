"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import Select from "@/components/forms/Select";
import { species } from "@/constants/species";
import { genderOptions } from "@/constants/gender";
import { ageOptions } from "@/constants/age";
import { locationOptions } from "@/constants/location";
import TextArea from "@/components/forms/TextArea";
import TextInputFormData from "@/components/forms/TextInputFormData";
import ImagePreview from "@/components/dashboard/ImagePreview";
import FileInput from "@/components/forms/FileInput";
import Image from "next/image";

export default function ReportFoundPetPage() {
  const { user, isVolunteer, loading } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    species: "dog",
    breed: "",
    gender: "unknown",
    age_estimate: "adult",
    color: "",
    location_found: "",
    date_found: new Date().toISOString().split("T")[0],
    health_notes: "",
    additional_notes: "",
    current_location: "with_me",
    preferred_shelter: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shelterOptions, setShelterOptions] = useState<any[]>([]);

  // Redirect if not a volunteer
  useEffect(() => {
    if (!loading && (!user || !isVolunteer)) {
      router.push("/auth/login");
    }
  }, [loading, user, isVolunteer, router]);

  // Fetch shelter options
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            shelter_details(shelter_name, location)
          `
          )
          .eq("user_type", "shelter");
  
        if (error) throw error;
  
        // Process the data to handle shelter_details correctly
        const validShelters = data?.map(profile => {
          // Check if shelter_details is an array and get the first item
          const shelterDetails = Array.isArray(profile.shelter_details) 
            ? profile.shelter_details[0] 
            : profile.shelter_details;
            
          return {
            id: profile.id,
            name: shelterDetails?.shelter_name || 'Unnamed Shelter',
            location: shelterDetails?.location || 'Unknown Location'
          };
        }).filter(shelter => shelter.name !== 'Unnamed Shelter') || [];
  
        setShelterOptions(validShelters);
      } catch (err) {
        console.error("Error fetching shelters:", err);
      }
    };
  
    fetchShelters();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Файл зображення занадто великий. Максимальний розмір: 5MB.",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setMessage({
          type: "error",
          text: "Будь ласка, виберіть файл зображення (JPEG, PNG, тощо).",
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);

      // First, create a report record
      const { data: reportData, error: reportError } = await supabase
        .from("found_animal_reports")
        .insert({
          reporter_id: user.id,
          species: formData.species,
          breed: formData.breed,
          gender: formData.gender,
          age_estimate: formData.age_estimate,
          color: formData.color,
          location_found: formData.location_found,
          date_found: formData.date_found,
          health_notes: formData.health_notes,
          additional_notes: formData.additional_notes,
          current_location: formData.current_location,
          preferred_shelter_id: formData.preferred_shelter || null,
          status: "pending", // Initial status
        })
        .select("id")
        .single();

      if (reportError) throw reportError;

      // If an image was uploaded, store it
      if (imageFile) {
        const filePath = `found_animals/${reportData.id}/${Date.now()}_${
          imageFile.name
        }`;
        const { error: uploadError } = await supabase.storage
          .from("found-animal-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("found_animal_images")
          .getPublicUrl(filePath);

        // Update the report with the image URL
        await supabase
          .from("found_animal_reports")
          .update({
            image_url: urlData.publicUrl,
          })
          .eq("id", reportData.id);
      }

      // Create notification for the shelter if one was selected
      if (formData.preferred_shelter) {
        await supabase.from("notifications").insert({
          user_id: formData.preferred_shelter,
          type: "found_animal_report",
          content: `Нове повідомлення про знайдену тварину - ${formData.species === 'dog' ? 'собаку' : formData.species === 'cat' ? 'кота' : 'тварину'}.`,
          reference_id: reportData.id,
          read: false,
        });
      }

      setMessage({
        type: "success",
        text: "Ваше повідомлення успішно надіслано! Дякуємо за допомогу тварині.",
      });

      // Reset form
      setFormData({
        species: "dog",
        breed: "",
        gender: "unknown",
        age_estimate: "adult",
        color: "",
        location_found: "",
        date_found: new Date().toISOString().split("T")[0],
        health_notes: "",
        additional_notes: "",
        current_location: "with_me",
        preferred_shelter: "",
      });
      setImageFile(null);
      setImagePreview(null);

      // Redirect after delay
      setTimeout(() => {
        router.push("/dashboard/volunteer");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting report:", err);
      setMessage({
        type: "error",
        text: err.message || "Помилка при відправці повідомлення. Спробуйте ще раз.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FDF5EB] min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-8 relative">
          <div className="absolute -left-5 -top-12 hidden sm:block">
            <Image
              src="/assets/images/pet-ears.png"
              alt="pet ears"
              width={80}
              height={80}
            />
          </div>
          
          <h1 className="text-3xl font-extrabold text-[#432907] mb-2">
            Повідомити про знайдену тварину
          </h1>
          <p className="text-[#432907]/80 mb-6 max-w-2xl mx-auto">
            Дякуємо за допомогу бездомній тварині. Будь ласка, надайте якомога більше інформації.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 mb-6 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  required={true}
                  name="species"
                  label="Тип тварини"
                  value={formData.species}
                  handleChange={handleChange}
                  items={species}
                />
              </div>

              <div>
                <TextInputFormData
                  type="text"
                  name="breed"
                  label="Порода/тип (якщо відомо)"
                  value={formData.breed}
                  handleChange={handleChange}
                  placeholder="Наприклад, лабрадор, змішаний"
                />
              </div>

              <div>
                <Select
                  required={true}
                  name="gender"
                  value={formData.gender}
                  handleChange={handleChange}
                  label="Стать"
                  items={genderOptions}
                />
              </div>

              <div>
                <Select
                  required={true}
                  name="age_estimate"
                  value={formData.age_estimate}
                  handleChange={handleChange}
                  label="Вік тварини"
                  items={ageOptions}
                />
              </div>

              <div>
                <TextInputFormData
                  type="text"
                  name="color"
                  label="Колір/маркування"
                  value={formData.color}
                  handleChange={handleChange}
                  placeholder="Наприклад, чорний з білими плямами"
                />
              </div>

              <div>
                <TextInputFormData
                  required={true}
                  type="date"
                  name="date_found"
                  label="Дата знайдення *"
                  value={formData.date_found}
                  handleChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <TextInputFormData
                  required={true}
                  type="text"
                  name="location_found"
                  label="Де було знайдено *"
                  value={formData.location_found}
                  handleChange={handleChange}
                  placeholder="Вулиця, район, тощо."
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  required={true}
                  name="current_location"
                  value={formData.current_location}
                  handleChange={handleChange}
                  label="Місцезнаходження тварини"
                  items={locationOptions}
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  name="health_notes"
                  value={formData.health_notes}
                  handleChange={handleChange}
                  label="Примітки про стан здоров'я"
                  placeholder="Опишіть будь-які видимі травми, хвороби чи проблеми зі здоров'ям"
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  name="additional_notes"
                  value={formData.additional_notes}
                  handleChange={handleChange}
                  label="Додаткові примітки"
                  placeholder="Будь-які інші деталі, які можуть допомогти (поведінка, нашийник, мікрочіп тощо)"
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  name="preferred_shelter"
                  value={formData.preferred_shelter}
                  handleChange={handleChange}
                  label="Оберіть притулок"
                  items={shelterOptions.map((shelter) => ({
                    value: shelter.id,
                    label: `${shelter.name || 'Притулок'} - ${shelter.location || 'Невідоме розташування'}`,
                  }))}
                >
                  <option value="">Оберіть притулок</option>
                </Select>

                <p className="mt-1 text-sm text-[#432907]/70">
                  Якщо ви віддаєте перевагу певному притулку, щоб допомогти з цією
                  твариною, виберіть його тут.
                </p>
              </div>

              <div className="md:col-span-2">
                <FileInput
                  label="Фото (за наявності)"
                  handleImageChange={handleImageChange}
                />
                <p className="mt-1 text-sm text-[#432907]/70">
                  Фото допоможе притулкам ідентифікувати тварину.{" "}
                </p>

                {imagePreview && (
                  <div className="mt-2">
                    <ImagePreview
                      handleDeleteImage={handleDeleteImage}
                      image={imagePreview}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-[#432907] hover:bg-gray-50 focus:outline-none"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-full bg-[#A9BFF2] text-white font-bold text-sm hover:bg-[#93a9d5] transition disabled:opacity-50"
              >
                {isSubmitting ? "Обробка..." : "Повідомити про тварину"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}