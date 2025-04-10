import Image from 'next/image';
import Link from 'next/link';

export default function Donate() {
    return (
        <section className="relative bg-[#E4EAF1] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-24 relative z-10 flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 relative">
                    <div className="absolute top-0 left-0 w-full h-full z-0">
                        <Image
                            src="/assets/images/donate-shape.svg"
                            alt="shape"
                            width={700}
                            height={700}
                            className="w-full h-auto"
                        />
                    </div>
                    <Image
                        src="/assets/images/donate-dog.svg"
                        alt="sitting dog"
                        width={700}
                        height={700}
                        className="relative z-10"
                    />
                </div>

                <div className="lg:w-1/2 text-center lg:text-left text-[#432907]">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
                        Донат для хвостатих
                    </h2>
                    <p className="text-base sm:text-lg mb-6">
                        Якщо немає можливості взяти тваринку до себе —<br />
                        завжди можна підтримати нас матеріально, щоб кожна тваринка була сита та задоволена.
                    </p>

                    <Link
                        href="/donate"
                        className="inline-block px-6 py-2 rounded-full bg-[#A9BFF2] text-white font-bold text-sm hover:bg-[#93a9d5] transition"
                    >
                        ДОНАТ
                    </Link>
                </div>
            </div>

            <Image
                src="/assets/images/line-wave-4.svg"
                alt="decorative path"
                width={1000}
                height={300}
                className="absolute bottom-0 left-0 z-0"
            />
        </section>
    );
}
