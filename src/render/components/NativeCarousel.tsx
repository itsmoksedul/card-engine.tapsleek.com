import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface NativeCarouselProps {
  cls: (part: string) => string;
  items: React.ReactNode[];
  /** Passed down to the track to layout items if needed */
  layout?: string;
}

export function NativeCarousel({ cls, items, layout }: NativeCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    // Calculate which item is most visible
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const scrollTo = (index: number) => {
    if (!trackRef.current) return;
    const item = trackRef.current.children[index] as HTMLElement;
    if (item) {
      trackRef.current.scrollTo({
        left: item.offsetLeft - trackRef.current.offsetLeft,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const next = () => scrollTo(Math.min(activeIndex + 1, items.length - 1));
  const prev = () => scrollTo(Math.max(activeIndex - 1, 0));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <div className={cls('carouselRoot')} data-layout={layout}>
      {/* Left Arrow */}
      {items.length > 1 && (
        <button
          type="button"
          className={cls('carouselArrowPrev')}
          onClick={prev}
          disabled={activeIndex === 0}
          aria-label="Previous"
        >
          <span className={cls('carouselArrowIcon')} data-dir="left" />
        </button>
      )}

      {/* The Track */}
      <div 
        className={cls('carouselTrack')} 
        ref={trackRef} 
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {items.map((item, i) => (
          <div key={i} style={{ scrollSnapAlign: 'start', flex: '0 0 100%', minWidth: 0 }}>
            {item}
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {items.length > 1 && (
        <button
          type="button"
          className={cls('carouselArrowNext')}
          onClick={next}
          disabled={activeIndex === items.length - 1}
          aria-label="Next"
        >
          <span className={cls('carouselArrowIcon')} data-dir="right" />
        </button>
      )}

      {/* Pagination Dots */}
      {items.length > 1 && (
        <div className={cls('carouselDots')} aria-label="Carousel pagination">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === activeIndex ? cls('carouselDotActive') : cls('carouselDot')}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-pressed={i === activeIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
