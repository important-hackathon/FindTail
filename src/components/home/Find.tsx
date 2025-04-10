import Image from 'next/image';
import Dropdown from '@/components/ui/Dropdown';

export default function Find() {
    return (
        <section className="relative bg-[#E4EAF1] overflow-hidden">
            <Image
                src="/assets/images/line-wave-2.svg"
                alt="decorative path"
                width={900}
                height={600}
                className="absolute -top-8 left-0 z-0"
            />

            <div className="max-w-7xl mx-auto px-4 py-24 relative z-10 flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 relative">
                    <div className="absolute top-0 left-0 w-full h-full z-0">
                        <Image
                            src="/assets/images/find-pet-shape.svg"
                            alt="shape"
                            width={700}
                            height={700}
                            className="w-full h-auto"
                        />
                    </div>
                    <Image
                        src="/assets/images/find-pet-catdog.svg"
                        alt="dog and cat"
                        width={700}
                        height={700}
                        className="relative z-10"
                    />
                </div>

                <div className="lg:w-1/2 text-center lg:text-left text-[#432907]">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">Знайди собі друга!</h2>
                    <p className="text-base sm:text-lg mb-6">
                        Після початку повномасштабної війни тисячі тварин залишились без домівок. Ми створили платформу, щоб дати кожній тварині шанс на нове життя.
                    </p>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                            <Dropdown label="Вид тварини" items={['Кіт', 'Собака', 'Інше']} />
                            <Dropdown label="Вік" items={['До 1 року', '1-3 роки', '3+ років']} />
                            <Dropdown label="Стан здоров’я" items={['Здоровий', 'Потребує лікування']} />
                            <Dropdown label="Локація" items={['Львів']} />
                        </div>
                        <p className="text-sm text-[#432907]/80">Або скористайтеся пошуком :)</p>
                        <div className="flex flex-col sm:flex-row gap-2 max-w-full mx-auto lg:mx-0">
                            <input
                                type="text"
                                placeholder="Введіть тут ..."
                                className="flex-1 px-4 py-2 rounded-full bg-[#FDF5EB] placeholder-[#A1A1A1] focus:outline-none"
                            />
                            <button className="px-8 py-2 rounded-full bg-[#A9BFF2] text-white font-semibold hover:bg-[#93a9d5] transition">
                                знайти
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
