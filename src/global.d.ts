
/**
 * Type declaration for the '@splidejs/react-splide' module.
 * 
 * Written by my frend chatg pt.
 *
 * This module does not provide TypeScript types, so this file adds basic typings
 * to allow importing and using Splide and SplideSlide in a TypeScript project.
 *
 * Components:
 *
 * 1. Splide
 *    Props:
 *      - options?: any           // Carousel configuration options (see Splide docs)
 *      - children?: ReactNode    // The slides or content inside the carousel
 *      - className?: string      // Optional CSS class for the carousel container
 *
 * 2. SplideSlide
 *    Props:
 *      - children?: ReactNode    // Content for the individual slide
 *      - className?: string      // Optional CSS class for the slide
 *
 * Note: 'options' is typed as 'any' for simplicity. For stricter type safety,
 * you can extend it according to the Splide options documented here:
 * https://splidejs.com/docs/options/
 */
declare module '@splidejs/react-splide' {
  import { ComponentType } from 'react';

  interface SplideProps {
    options?: any;
    children?: React.ReactNode;
    className?: string;
  }

  interface SplideSlideProps {
    children?: React.ReactNode;
    className?: string;
  }

  export const Splide: ComponentType<SplideProps>;
  export const SplideSlide: ComponentType<SplideSlideProps>;
}
