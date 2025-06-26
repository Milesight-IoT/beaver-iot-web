import { useMemo } from 'react';
import { DataGridProps } from '@mui/x-data-grid';
import { isObject } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';

/** The number of options per page is displayed by default */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

/** Default paging model */
export const DEFAULT_PAGINATION_MODEL = { page: 0, pageSize: DEFAULT_PAGE_SIZE_OPTIONS[0] };

/**
 * Table hooks
 */
const useTablePro = (props: Partial<DataGridProps>) => {
    const { getIntlText } = useI18n();

    /**
     * generate has search column
     */
    const pageSizeOptions = useMemo(() => {
        if (isObject(props.pageSizeOptions?.[0])) {
            return props.pageSizeOptions;
        }
        return DEFAULT_PAGE_SIZE_OPTIONS.map((size: number) => ({
            value: size,
            label: `${size} / ${getIntlText('common.label.page')}`,
        }));
    }, [getIntlText, props.pageSizeOptions]);

    return {
        pageSizeOptions,
    };
};

export default useTablePro;
