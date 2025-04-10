import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative bg-[#FDF5EB] overflow-hidden">
            {/*<Image*/}
            {/*    src="/assets/images/vector.svg"*/}
            {/*    alt="decorative path"*/}
            {/*    width={250}*/}
            {/*    height={250}*/}
            {/*    className="absolute top-4 left-4 sm:left-10 z-0"*/}
            {/*/>*/}

            <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 flex flex-col-reverse lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 text-center lg:text-left">
                    <Image
                        src="/assets/images/findtail-main-page.png"
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

                <div className="lg:w-1/2 relative">
                    <Image
                        src="/assets/images/vector.svg"
                        alt="shape"
                        width={700}
                        height={700}
                        className="absolute top-0 left-0 w-full h-auto z-0"
                    />
                    <Image
                        src="/assets/images/dog-cat-main-page.svg"
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
