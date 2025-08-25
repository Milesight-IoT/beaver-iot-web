import { useEffect, useState } from 'react';

export default function useWindowWidth(callback?: () => void) {
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

            if (isTooSmall) {
                callback?.();
            }
        };
        getWindowWidth();

        window.addEventListener('resize', getWindowWidth);
        return () => {
            window.removeEventListener('resize', getWindowWidth);
        };
    }, [callback]);

    return {
        /** Check if the screen is too small than 720px */
        isTooSmallScreen,
    };
}
