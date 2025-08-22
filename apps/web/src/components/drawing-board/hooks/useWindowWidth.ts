import { useEffect, useState } from 'react';

export default function useWindowWidth() {
    // ---------- Check if the screen is too small  ----------
    const [isTooSmallScreen, setIsTooSmallScreen] = useState(false);

    useEffect(() => {
        const getWindowWidth = () => {
            const windowWidth =
                document.body.clientWidth ||
                document.documentElement.clientWidth ||
                window.innerWidth;

            const isTooSmall = windowWidth <= 720;
            setIsTooSmallScreen(isTooSmall);
        };
        getWindowWidth();

        window.addEventListener('resize', getWindowWidth);
        return () => {
            window.removeEventListener('resize', getWindowWidth);
        };
    }, []);

    return {
        /** Check if the screen is too small than 720px */
        isTooSmallScreen,
    };
}
