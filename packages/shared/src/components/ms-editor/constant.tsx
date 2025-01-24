/* eslint-disable no-bitwise */
/** theme css prefix */
export const THEME_PREFIX = 'ms-editor-theme';

export const NAMESPACE = 'ms-lexical-editor';

export const enum MODE {
    /** Read only */
    READONLY = 1 << 0,
    /** EDITOR */
    EDITABLE = 1 << 1,
    /** It can be read and written */
    ALL = MODE.EDITABLE + MODE.READONLY,
}
