/** Table util func */
import { OPERATION_COLUMN_KEY_PREFIX } from './constants';

/**
 * Determine whether to operate column
 * @param key {ColumnType.field}
 * @returns boolean
 */
export const isOperationColumn = (key: string) => {
    const regex = new RegExp(`^\\${OPERATION_COLUMN_KEY_PREFIX}.+`);
    return regex.test(key);
};
