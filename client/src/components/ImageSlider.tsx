import { useState, useEffect, useCallback } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import type { CarouselApi } from '@/components/ui/carousel';

interface SlideImage {
  id: number;
  url: string;
  title: string;
  description?: string;
}

interface ImageSliderProps {
  images: SlideImage[];
  autoRotateInterval?: number; // in milliseconds
  className?: string;
}

export function ImageSlider({ 
  images, 
  autoRotateInterval = 4000,
  className = ""
}: ImageSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize carousel state
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Auto-rotation logic
  useEffect(() => {
    if (!api || autoRotateInterval <= 0 || isHovered) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0); // Go back to first slide
      }
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [api, autoRotateInterval, isHovered]);

  const goToSlide = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  }, [api]);

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-600">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold mb-2">BKPSDM Pangkep</h3>
          <p className="text-sm">Slider gambar akan tampil di sini</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel 
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id}>
              <div className="carousel-container relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-xl">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                
                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-sm md:text-base text-gray-200 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="carousel-nav-btn absolute top-1/2 left-4 -translate-y-1/2 z-10 h-12 w-12 bg-white/90 hover:bg-white shadow-lg border-white/20 transition-all duration-200"
          onClick={() => api?.scrollPrev()}
          disabled={!api}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous slide</span>
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="carousel-nav-btn absolute top-1/2 right-4 -translate-y-1/2 z-10 h-12 w-12 bg-white/90 hover:bg-white shadow-lg border-white/20 transition-all duration-200"
          onClick={() => api?.scrollNext()}
          disabled={!api}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next slide</span>
        </Button>
      </Carousel>
      
      {/* Dot Indicators */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`carousel-dot w-3 h-3 rounded-full transition-all duration-300 ${
                index === current - 1
                  ? 'bg-white scale-125 shadow-lg active'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Slide counter and pause indicator */}
      {count > 1 && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
          <div className="bg-black/50 text-white text-sm px-3 py-1 rounded-full">
            {current} / {count}
          </div>
          {isHovered && (
            <div className="bg-black/50 text-white p-2 rounded-full">
              <Pause className="h-3 w-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}