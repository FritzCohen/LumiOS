import { useEffect, useRef } from "react";
import eruda from "eruda";

const Webtools = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    eruda.init({
      autoScale: true,
      useShadowDom: false,
    });

    eruda.show();
    isInitialized.current = true;

    return () => {
      try {
        eruda.destroy();
      } catch (e) {
        console.error("Failed to cleanup eruda:", e);
      }
    };
  }, []);

  return null; // no custom div needed
};

export default Webtools;
