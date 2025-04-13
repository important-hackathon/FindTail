'use client';

import Image from 'next/image';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { useState } from 'react';

interface GalleryProps {
    images: { image_url: string }[];
}

export default function Gallery({ images }: GalleryProps) {
    const [current, setCurrent] = useState(0);
    const [sliderRef] = useKeenSlider<HTMLDivElement>({
        slideChanged(slider) {
            setCurrent(slider.track.details.rel);
        },
        loop: true,
    });

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-[420px] bg-gray-200 flex items-center justify-center rounded-xl">
                <span className="text-gray-500">No Image Available</span>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="w-full h-[420px] relative rounded-sm overflow-hidden">
                <Image
                    src={images[0].image_url}
                    alt="Animal"
                    fill
                    className="object-fill "
                />
            </div>
        );
    }

    return (
        <div>
            <div ref={sliderRef} className="keen-slider rounded-xl overflow-hidden h-[420px]">
                {images.map((img, idx) => (
                    <div className="keen-slider__slide relative" key={idx}>
                        <Image
                            src={img.image_url}
                            alt={`Image ${idx + 1}`}
                            fill
                            className="object-cover rounded-xl"
                        />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mt-3 justify-center">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                            idx === current ? 'border-blue-500' : 'border-transparent'
                        }`}
                    >
                        <Image
                            src={img.image_url}
                            alt={`thumb-${idx}`}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
