'use client';

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

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Файл зображення занадто великий. Максимальний розмір: 5MB.",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({
          type: "error",
          text: "Будь ласка, виберіть файл зображення (JPEG, PNG, тощо).",
        });
        return;
      }
      
      console.log("Image selected:", file.name, "Size:", Math.round(file.size / 1024), "KB", "Type:", file.type);
      
      // Set the image file for upload
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        console.log("Image preview created successfully");
      };
      reader.onerror = () => {
        console.error("Error creating image preview");
        setMessage({
          type: "error",
          text: "Помилка створення попереднього перегляду зображення.",
        });
      };
      
      // Read the file as a data URL for preview only
      reader.readAsDataURL(file);
      
      // Clear any previous error messages
      setMessage(null);
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
      
      console.log("Starting form submission process");

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

      if (reportError) {
        console.error("Error creating report:", reportError);
        throw reportError;
      }
      
      console.log("Report created with ID:", reportData.id);

      // If an image was uploaded, store it
      if (imageFile) {
        try {
          console.log("Processing image upload");
          
          // The consistent bucket name to use
          const BUCKET_NAME = 'found-animal-images';
          
          // Check if bucket exists and create if needed
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
          
          if (!bucketExists) {
            console.log(`Creating bucket '${BUCKET_NAME}'`);
            await supabase.storage.createBucket(BUCKET_NAME, {
              public: true
            });
          } else {
            console.log(`Bucket '${BUCKET_NAME}' already exists`);
          }
          
          // Create a safe filename with timestamp to avoid conflicts
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${reportData.id}_${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;
          
          console.log("Uploading image to path:", filePath);
          
          // Upload the image file directly (not the base64 preview)
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, imageFile, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }
          
          console.log("Image uploaded successfully:", uploadData);
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);
          
          if (!urlData || !urlData.publicUrl) {
            console.error("Failed to get public URL for uploaded image");
            throw new Error("Failed to get public URL for image");
          }
          
          const imageUrl = urlData.publicUrl;
          console.log("Image public URL:", imageUrl);
          
          // Update the report with the image URL
          const { error: updateError } = await supabase
            .from("found_animal_reports")
            .update({
              image_url: imageUrl,
            })
            .eq("id", reportData.id);
            
          if (updateError) {
            console.error("Error updating report with image URL:", updateError);
            throw updateError;
          }
          
          console.log("Report updated with image URL");
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError.message || uploadError);
          // Don't throw the error - we want the form to continue even if image upload fails
          // But we can notify the user about the partial success
          setMessage({
            type: "success",
            text: "Ваше повідомлення надіслано, але виникла проблема із завантаженням зображення.",
          });
          
          // Return early with partial success
          setTimeout(() => {
            router.push("/dashboard/volunteer");
          }, 3000);
          
          return;
        }
      }

      // Create notification for the shelter if one was selected
      if (formData.preferred_shelter) {
        try {
          await supabase.from("notifications").insert({
            user_id: formData.preferred_shelter,
            type: "found_animal_report",
            content: `Нове повідомлення про знайдену тварину - ${formData.species === 'dog' ? 'собаку' : formData.species === 'cat' ? 'кота' : 'тварину'}.`,
            reference_id: reportData.id,
            read: false,
          });
          
          console.log("Notification created for shelter:", formData.preferred_shelter);
        } catch (notifyError) {
          console.error("Error creating notification:", notifyError);
          // Continue with the submission even if notification fails
        }
      }

      // Success handling
      setMessage({
        type: "success",
        text: "Ваше повідомлення успішно надіслано! Дякуємо за допомогу тварині.",
      });
      
      console.log("Form submission completed successfully");

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