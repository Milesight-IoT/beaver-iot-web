import { useMemo, Fragment } from 'react';
import { Table, TableBody, TableRow, TableCell, CircularProgress } from '@mui/material';
import cls from 'classnames';
import './style.less';

export interface Props {
    /**
     * Descriptive list data
     */
    data?: {
        key: ApiKey;
        label: React.ReactNode;
        content: React.ReactNode;
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
        <div className={cls('ms-descriptions-root', { loading })}>
            <Table className="ms-descriptions">
                <TableBody>
                    {list?.map((items, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <TableRow key={index}>
                            {items.map(item => (
                                <Fragment key={item.key}>
                                    <TableCell className="ms-descriptions-label">
                                        {item.label}
                                    </TableCell>
                                    <TableCell className="ms-descriptions-content">
                                        {item.content}
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
