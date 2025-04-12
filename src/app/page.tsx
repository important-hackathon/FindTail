import Hero from '@/components/home/Hero';
import Find from '@/components/home/Find';
import Announce from '@/components/home/Announce';
import Donate from '@/components/home/Donate';
import Image from 'next/image';
import Footer from "@/components/layout/footer/Footer";

export default function HomePage() {
    return (
        <div className="relative">
            <Hero />
            <Find />
            <Announce />
            <Donate />
            <Footer />

            <div className="absolute inset-0 z-10 pointer-events-none select-none">
                <Image
                    src="/assets/images/line-wave.svg"
                    alt="line wave 1"
                    width={900}
                    height={300}
                    className="absolute left-0 top-0"
                />
                <Image
                    src="/assets/images/line-wave-2.svg"
                    alt="line wave 2"
                    width={800}
                    height={300}
                    className="absolute right-0 top-[45%]"
                />
                <Image
                    src="/assets/images/line-wave-3.svg"
                    alt="line wave 3"
                    width={700}
                    height={300}
                    className="absolute left-0 bottom-0"
                />
            </div>
        </div>
    );
}
