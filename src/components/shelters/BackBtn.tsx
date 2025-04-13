import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackBtnProps {
  href: string;
  text: string;
}

const BackBtn = ({ href, text }: BackBtnProps) => {
  return (
    <Link
      href={href}
      className="bg-[#D7DDE7] text-[#432907] py-2 px-4 rounded-full flex font-semibold gap-1 opacity-60"
    >
      <ArrowLeft color="#432907" />
      {text}
    </Link>
  );
};

export default BackBtn;
