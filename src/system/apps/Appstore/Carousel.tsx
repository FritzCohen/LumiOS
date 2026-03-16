import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { useEffect, useRef, useState, useMemo } from "react";
import { Game } from "./appstoreTypes";

interface CarouselProps {
  games: Game[];
  setSelectedGame: (game: Game) => void;
}

const Carousel: React.FC<CarouselProps> = ({ games, setSelectedGame }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // ResizeObserver throttled
  useEffect(() => {
    if (!containerRef.current) return;
    let frame: number | null = null;

    const observer = new ResizeObserver((entries) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setWidth(entries[0].contentRect.width);
      });
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Only recalc options when breakpoints are crossed
  const options = useMemo(() => {
    let padding = { left: "8rem", right: "8rem" };
    if (width < 350) padding = { left: "0.5rem", right: "0.5rem" };
    else if (width < 500) padding = { left: "1rem", right: "1rem" };
    else if (width < 768) padding = { left: "2rem", right: "2rem" };
    else if (width < 1024) padding = { left: "4rem", right: "4rem" };

    return {
      type: "loop",
      perPage: 1,
      perMove: 1,
      gap: "0.5rem",
      focus: "center",
      cover: true,
      arrows: false,
      pagination: true,
      height: "250px",
      padding,
    };
  }, [width]);

  return (
    <div ref={containerRef} className="w-full py-8 mx-auto max-w-7xl">
      {width > 0 && (
        <Splide
          aria-label="Game Carousel"
          options={options}
          className="carousel-wrapper"
        >
          {games.map((game, index) => (
            <SplideSlide key={index}>
              <div className="relative group overflow-hidden rounded-xl h-full" onClick={() => setSelectedGame(game)}>
                <img
                  src={game.image}
                  alt={game.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur group-hover:brightness-75"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:from-black/70 group-hover:via-black/40 transition-opacity duration-300 flex flex-col w-full gap-1 justify-end items-start p-4">
                  <h3 className="text-white text-lg font-medium line-clamp-1">
                    {game.name}
                  </h3>
                  <p className="text-xs text-white font-medium line-clamp-2 min-w-0">
                    {game.description}
                  </p>
                </div>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      )}

      <style>
        {`
          .carousel-wrapper .splide__pagination {
            bottom: -2rem;
          }
        `}
      </style>
    </div>
  );
};

export default Carousel;