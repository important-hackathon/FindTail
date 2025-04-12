import Image from "next/image";

interface ImagePreviewProps {
  image: string;
  handleDeleteImage: () => void;
}

const ImagePreview = ({ image, handleDeleteImage }: ImagePreviewProps) => {
  return (
    <div className="relative w-75 h-50">
      <Image
        src={image}
        width={300}
        height={200}
        alt="Preview"
        className="h-48 object-cover rounded-md"
      />

      <button
        onClick={handleDeleteImage}
        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-red-600 hover:bg-red-50 cursor-pointer"
        aria-label="Remove from favorites"
      >
        ❌
      </button>
    </div>
  );
};

export default ImagePreview;
