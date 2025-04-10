import Image from 'next/image';
import Link from 'next/link';

export default function Announce() {
    return (
        <section className="relative bg-[#FDF5EB] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-24 relative z-10 flex flex-col-reverse lg:flex-row items-center gap-16">
                <div className="lg:w-3/4 text-center lg:text-left text-[#432907]">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
                        Врятуй життя — передай до притулку
                    </h2>
                    <p className="text-base sm:text-lg mb-6">
                        Ти знайшов загублену або безпритульну тварину? Не залишай її на самоті. <br />
                        Заповни просту форму — і ми допоможемо знайти для неї безпечне місце в одному з перевірених притулків.
                    </p>

                    <Link
                        href="/announcement/create"
                        className="inline-block px-6 py-2 rounded-full bg-[#A9BFF2] text-white font-bold text-sm hover:bg-[#93a9d5] transition"
                    >
                        СТВОРИТИ ОГОЛОШЕННЯ
                    </Link>
                </div>

                <div className="lg:w-1/2">
                    <Image
                        src="/assets/images/announce-pet-photo.svg"
                        alt="woman with dog"
                        width={600}
                        height={600}
                        className="rounded-[40%_60%_60%_40%/60%_40%_60%_40%]"
                    />
                </div>
            </div>

            <Image
                src="/assets/images/line-wave-3.svg"
                alt="decorative path"
                width={900}
                height={300}
                className="absolute top-0 right-0 z-0"
            />
        </section>
    );
}
