import { getEditorClass } from '../../../helper';
import {
    RESIZER_CELL_CLASS,
    TABLE_CELL,
    TABLE_ADD_BUTTON_CLASS,
    TABLE_ADD_CONTAINER_CLASS,
    TABLE_ADD_ICON_CLASS,
} from '../constants';

/**
 * 判断鼠标是否在表格中
 * @returns `isOutside`: 表示鼠标是否在特定元素外。
 * @returns `tableDOMNode`: 是找到的最近的表格单元格节点。
 */
export const getMouseInfo = (
    event: MouseEvent,
): {
    tableDOMNode: HTMLElement | null;
    isOutside: boolean;
} => {
    const { target } = event;
    const isValidElement =
        target && (target instanceof HTMLElement || target instanceof SVGElement);

    if (isValidElement) {
        const tableDOMNode = target.closest<HTMLElement>(
            `td.${getEditorClass(TABLE_CELL)}, th.${getEditorClass(TABLE_CELL)}`,
        );

        const isOutside = !(
            tableDOMNode ||
            target.closest<HTMLElement>(`.${TABLE_ADD_ICON_CLASS}`) ||
            target.closest<HTMLElement>(`.${TABLE_ADD_ICON_CLASS} > svg`) ||
            target.closest<HTMLElement>(`div.${TABLE_ADD_BUTTON_CLASS}`) ||
            target.closest<HTMLElement>(`div.${TABLE_ADD_CONTAINER_CLASS}`) ||
            target.closest<HTMLElement>(`div.${RESIZER_CELL_CLASS}`)
        );

        return { isOutside, tableDOMNode };
    }
    return { isOutside: true, tableDOMNode: null };
};
