import { useEventListener } from 'ahooks';

/**
 * CSS variable name of custom viewport height
 */
const customViewportCorrectionVariable = 'vh';

const setViewportProperty = (doc: HTMLElement) => {
    let prevClientHeight: number;
    const customVar = `--${customViewportCorrectionVariable || 'vh'}`;

    function handleResize() {
        const { clientHeight } = doc;
        if (clientHeight === prevClientHeight) return;
        requestAnimationFrame(function updateViewportHeight() {
            document.documentElement.style.setProperty(customVar, `${clientHeight * 0.01}px`);
            prevClientHeight = clientHeight;
        });
    }
    handleResize();
    return handleResize;
};

/**
 * Polyfill for actual viewport height calculation
 *
 * Cooperate with [postcss-viewport-height-correction](https://github.com/Faisal-Manzer/postcss-viewport-height-correction) to solve the popular problem that 100vh doesn’t fit the mobile browser screen.
 */
const useViewHeightPolyfill = () => {
    useEventListener('resize', setViewportProperty(document.documentElement));
};

export default useViewHeightPolyfill;
