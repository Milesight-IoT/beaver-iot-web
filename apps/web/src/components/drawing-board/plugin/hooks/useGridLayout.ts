import { useMemo } from 'react';
import { type Layout } from 'react-grid-layout';

/**
 * Return grid layout information based on grid data
 * eg: w*h
 */
export function useGridLayout(position?: Partial<Layout>) {
    /** Width grid */
    const wGrid = useMemo(() => {
        return position?.w;
    }, [position]);

    /** Height grid */
    const hGrid = useMemo(() => {
        return position?.h;
    }, [position]);

    /**
     * 3X3
     */
    const threeByThree = useMemo(() => {
        return position?.w === 3 && position?.h === 3;
    }, [position]);

    /**
     * 2X2
     */
    const twoByTwo = useMemo(() => {
        return position?.w === 2 && position?.h === 2;
    }, [position]);

    /**
     * 1X2
     */
    const oneByTwo = useMemo(() => {
        return position?.w === 1 && position?.h === 2;
    }, [position]);

    /**
     * 2X1
     */
    const twoByOne = useMemo(() => {
        return position?.w === 2 && position?.h === 1;
    }, [position]);

    /**
     * 1X1
     */
    const oneByOne = useMemo(() => {
        return position?.w === 1 && position?.h === 1;
    }, [position]);

    return {
        /** Width grid */
        wGrid,
        /** Height grid */
        hGrid,
        /**
         * w*h
         * 3X3 Grid Layout
         */
        threeByThree,
        /**
         * w*h
         * 2X2 Grid Layout
         */
        twoByTwo,
        /**
         * w*h
         * 2X1 Grid Layout
         */
        twoByOne,
        /**
         * w*h
         * 1X2 Grid Layout
         */
        oneByTwo,
        /**
         * w*h
         * 1X1 Grid Layout
         */
        oneByOne,
    };
}
