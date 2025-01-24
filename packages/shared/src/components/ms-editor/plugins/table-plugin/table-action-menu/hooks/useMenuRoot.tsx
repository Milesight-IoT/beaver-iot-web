import { useEffect } from 'react';
import { useClickAway, useMemoizedFn } from 'ahooks';
import { getDOMCellFromTarget } from '@lexical/table';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface IProps {
    anchorElem: HTMLElement;
    menuRootRef: React.MutableRefObject<HTMLElement | null>;
    setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const useMenuRoot = ({ anchorElem, menuRootRef, setIsMenuOpen }: IProps) => {
    const [editor] = useLexicalComposerContext();

    /** Set the location of the click */
    const setupMenuRootStyle = useMemoizedFn(({ x, y }: { x: number; y: number }) => {
        const menuRoot = menuRootRef.current;
        if (!menuRoot) return;

        const { y: editorElemY, left: editorElemLeft } = anchorElem.getBoundingClientRect();

        menuRoot.style.width = `${1}px`;
        menuRoot.style.height = `${1}px`;
        menuRoot.style.transform = `translate(${x - editorElemLeft}px, ${y - editorElemY - 4}px)`;
        menuRoot.style.opacity = '1';
    });
    /** Right button */
    const handleContextMenu = useMemoizedFn(e => {
        setIsMenuOpen(false);
        const { target } = e;
        // Determine whether the table is being clicked
        const cell = getDOMCellFromTarget(target as HTMLElement);
        if (!cell) return;

        const menuRoot = menuRootRef.current;
        if (!menuRoot) return;

        e.preventDefault();
        e.stopPropagation();

        // Set click position
        setupMenuRootStyle(e);

        setTimeout(() => {
            // Open menu
            setIsMenuOpen(true);
        }, 0);
    });
    useEffect(() => {
        const root = editor.getRootElement();
        if (!root) return;

        root.addEventListener('contextmenu', handleContextMenu);
        return () => {
            root.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [editor]);

    // Click outside the target element to close dropdown
    useClickAway(() => {
        setIsMenuOpen(false);
    }, [menuRootRef]);
};
