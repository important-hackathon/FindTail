import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative bg-[#FDF5EB] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-20 relative flex flex-col-reverse lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 text-center lg:text-left z-20">
                    <Image
                        src="/assets/images/findtail-hero-logo.png"
                        alt="FindTail Logo"
                        width={250}
                        height={80}
                        className="mx-auto lg:mx-0 mb-6"
                    />

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#432907]">
                        Разом врятуємо життя тварин
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-[#432907]/80 max-w-xl">
                        Наша платформа створена, щоб допомогти безпритульним тваринам, що постраждали від війни знайти новий дім.
                        Приєднуйся до спільноти небайдужих — допомагай, підтримуй, поширюй!
                    </p>
                </div>

                <div className="lg:w-1/2 relative ">
                    <Image
                        src="/assets/images/hero-shape.svg"
                        alt="shape"
                        width={700}
                        height={700}
                        className="absolute top-[-85px] left-0 w-full h-[500px] z-10"
                    />
                    <Image
                        src="/assets/images/hero-catdog.svg"
                        alt="dog and cat"
                        width={700}
                        height={700}
                        className="relative z-10"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
