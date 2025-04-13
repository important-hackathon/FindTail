import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF5EB] text-[#432907] p-4">
      <div className="text-center max-w-2xl mx-auto relative">
          
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Сторінку не знайдено
          </h2>
          <p className="text-lg text-[#432907]/80 mb-8">
            На жаль, ми не змогли знайти сторінку, яку ви шукаєте. Можливо, ви перейшли за неправильним посиланням або сторінка була переміщена.
          </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href="/"
            className="px-6 py-3 bg-[#A9BFF2] text-white rounded-full hover:bg-[#93a9d5] transition flex items-center gap-2 shadow-md"
          >
            <ArrowLeft size={18} />
            На головну
          </Link>
          
          <Link 
            href="/animals" 
            className="px-6 py-3 border-2 border-[#A9BFF2] text-[#432907] rounded-full hover:bg-[#A9BFF2]/10 transition shadow-md"
          >
            Знайти друга
          </Link>
        </div>
        
        {/* Optional: Footer message */}
        <p className="mt-12 text-sm text-[#432907]/60">
          Зв'яжіться з нами, якщо вам потрібна допомога
        </p>
      </div>
    </div>
  );
}