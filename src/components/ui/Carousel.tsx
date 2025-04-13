import { Swiper } from "swiper/react";
import "swiper/css";
import { ReactNode, useRef } from "react";

interface CarouselProps {
  children: ReactNode;
  className?: string;
  leftButton?: ReactNode;
  rightButton?: ReactNode;
}

const Carousel = ({
  children,
  className,
  leftButton,
  rightButton,
}: CarouselProps) => {
  const swiperRef = useRef<any>(null);

  const goToPrev = () => {
    if (swiperRef.current) swiperRef.current.swiper.slidePrev();
  };

  const goToNext = () => {
    if (swiperRef.current) swiperRef.current.swiper.slideNext();
  };

  return (
    <>
      <Swiper
        ref={swiperRef}
        className={className || "w-full h-full"}
        slidesPerView={1}
        loop={true}
        navigation={true}
      >
        {children}
      </Swiper>
      {leftButton && <div onClick={goToPrev}>{leftButton}</div>}
      {rightButton && <div onClick={goToNext}>{rightButton}</div>}
    </>
  );
};

export default Carousel;
