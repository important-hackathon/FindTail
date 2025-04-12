interface SignOutButtonProps {
  buttonText: string;
  signOut: () => Promise<void>;
}

const SignOutButton = ({ buttonText, signOut }: SignOutButtonProps) => {
  return (
    <button
      onClick={signOut}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
    >
      {buttonText}
    </button>
  );
};

export default SignOutButton;
