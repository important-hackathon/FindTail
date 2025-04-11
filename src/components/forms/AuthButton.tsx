"use client";

interface AuthButtonProps {
  loading: boolean;
  buttonLoadingText: string;
  buttonText: string;
}

const AuthButton = ({
  loading,
  buttonLoadingText,
  buttonText,
}: AuthButtonProps) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="bg-[#88A7D5] text-[#F7EFE3] font-bold rounded-full px-14 py-2.5 cursor-pointer"
    >
      {loading ? buttonLoadingText : buttonText}
    </button>
  );
};

export default AuthButton;
