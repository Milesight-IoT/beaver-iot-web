import { ReactNode, ReactPortal, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    container?: Element | (() => Element | null) | null;

    children: ReactNode;
}

/**
 * PrependPortal component
 *
 * @param container - The container element to prepend the portal to
 * @param children - The children elements to render in the portal
 * @returns A ReactPortal element
 */
const PrependPortal = ({ container, children }: Props): ReactPortal => {
    const portalContainer = document.createElement('div');

    useEffect(() => {
        const root = typeof container === 'function' ? container() : container;

        if (root) root.prepend(portalContainer);

        return () => {
            if (root && portalContainer.parentNode === root) {
                root.removeChild(portalContainer);
            }
        };
    }, [container, portalContainer]);

    return createPortal(children, portalContainer);
};

export default PrependPortal;
