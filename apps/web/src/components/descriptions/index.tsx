import { useMemo, Fragment } from 'react';
import {
    Table,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress,
    TableCellProps,
} from '@mui/material';
import cls from 'classnames';
import { useTheme } from '@milesight/shared/src/hooks';
import Tooltip from '../tooltip';
import './style.less';

export interface Props {
    /**
     * Descriptive list data
     */
    data?: {
        /** Data key */
        key: ApiKey;
        /** Data label */
        label: React.ReactNode;
        /** Data content */
        content: React.ReactNode;
        /**
         * Whether to enable ellipsis for label & content
         */
        autoEllipsis?: boolean;
        /**
         * TableCell props of label
         */
        labelCellProps?: Partial<TableCellProps>;
        /**
         * TableCell props of content
         */
        contentCellProps?: Partial<TableCellProps>;
    }[];

    /**
     * Loading or not
     */
    loading?: boolean;

    /**
     * Number of rendered data pairs per row, default is 2
     *
     * __ Note __ : The current style only supports 2 columns, to modify, please adjust the style yourself
     */
    columns?: number;
}

/**
 * Description list component
 */
const Descriptions: React.FC<Props> = ({ data, loading, columns = 2 }) => {
    const { matchTablet } = useTheme();
    const list = useMemo(() => {
        return data?.reduce(
            (acc, item) => {
                const lastIndex = acc.length - 1 < 0 ? 0 : acc.length - 1;
                const index = acc[lastIndex]?.length >= columns ? lastIndex + 1 : lastIndex;

                if (!acc[index]) acc[index] = [];
                acc[index].push(item);

                return acc;
            },
            [] as NonNullable<Props['data']>[],
        );
    }, [data, columns]);

    return (
        <div className={cls('ms-descriptions-root', { loading, mobile: matchTablet })}>
            <Table className="ms-descriptions">
                <TableBody>
                    {list?.map((items, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={index}>
                            {items.map(item => (
                                <Fragment key={item.key}>
                                    <TableCell
                                        {...item.labelCellProps}
                                        className="ms-descriptions-label"
                                    >
                                        {/* {item.label} */}
                                        {item.autoEllipsis ? (
                                            <Tooltip autoEllipsis title={item.label} />
                                        ) : (
                                            item.label
                                        )}
                                    </TableCell>
                                    <TableCell
                                        {...item.contentCellProps}
                                        className="ms-descriptions-content"
                                    >
                                        {/* {item.content} */}
                                        {item.autoEllipsis ? (
                                            <Tooltip autoEllipsis title={item.content} />
                                        ) : (
                                            item.content
                                        )}
                                    </TableCell>
                                </Fragment>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {loading && <CircularProgress className="ms-descriptions-loading" size={30} />}
        </div>
    );
};

export default Descriptions;
