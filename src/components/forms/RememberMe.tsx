import { ChangeEvent } from "react";

interface RememberMeProps {
  rememberMe: boolean;
  handleChangeRememberMe: (e: ChangeEvent<HTMLInputElement>) => void;
}

const RememberMe = ({
  rememberMe,
  handleChangeRememberMe,
}: RememberMeProps) => {
  return (
    <div className="flex items-center">
      <input
        id="remember-me"
        name="remember-me"
        type="checkbox"
        checked={rememberMe}
        className="h-4 w-4 accent-[#65558F] cursor-pointer"
        onChange={handleChangeRememberMe}
      />
      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
        Запам'ятати мене
      </label>
    </div>
  );
};

export default RememberMe;
