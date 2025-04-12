import Link from "next/link";

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  path: string;
}
const ActionCard = ({
  title,
  description,
  buttonText,
  path,
}: ActionCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col ">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{description}</p>
      <Link
        href={path}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-auto self-start"
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default ActionCard;
