"user client";
import { Dispatch, SetStateAction } from "react";

interface SwitchButtonProps {
  userType: "volunteer" | "shelter";
  activeUserType: "volunteer" | "shelter";
  setUserType: Dispatch<SetStateAction<"volunteer" | "shelter">>;
  text: string;
}

const SwitchButton = ({
  userType,
  setUserType,
  text,
  activeUserType,
}: SwitchButtonProps) => {
  const isActive = userType === activeUserType;

  return (
    <button
      type="button"
      className={`flex-1 py-2 px-4 rounded-md transition-colors cursor-pointer ${
        isActive ? "bg-[#88A7D5] text-white" : "text-gray-700 hover:bg-gray-200"
      }`}
      onClick={() => setUserType(userType)}
    >
      {text}
    </button>
  );
};

export default SwitchButton;
