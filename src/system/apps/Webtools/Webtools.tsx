import { useEffect, useRef } from 'react';
import Eruda from 'eruda';

const Webtools = () => {
    const erudaContainerRef = useRef(null);

    useEffect(() => {
        if (erudaContainerRef.current) {
            Eruda.init({
                container: erudaContainerRef.current,
                autoScale: true,
                useShadowDom: false,
            });

            Eruda.position({x: 0, y: 0});

            Eruda.show();
        }

        return () => Eruda.destroy();
    }, []);

    return <div ref={erudaContainerRef} className='overflow-hidden h-full w-full'></div>;
}

export default Webtools;