import React from 'react';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';

const LISTBOX_PADDING = 8; // px

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
    const outerProps = React.useContext(OuterElementContext);
    return <div ref={ref} {...props} {...outerProps} />;
});

// Adapter for react-window
const ListboxComponent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
    function ListboxComponent(props, ref) {
        const { children, ...other } = props;
        const itemData: React.ReactElement<unknown>[] = [];
        (children as React.ReactElement<unknown>[]).forEach(
            (
                item: React.ReactElement<unknown> & {
                    children?: React.ReactElement<unknown>[];
                },
            ) => {
                itemData.push(item);
            },
        );

        const itemCount = itemData.length;
        const childSize = 48; // 每个子元素的高度

        const useResetCache = (data: any) => {
            const ref = React.useRef<VariableSizeList>(null);
            React.useEffect(() => {
                if (ref.current != null) {
                    ref.current.resetAfterIndex(0, true);
                }
            }, [data]);
            return ref;
        };

        const renderRow = (props: ListChildComponentProps) => {
            const { data, index, style } = props;
            const dataSet = data[index];
            const inlineStyle = {
                ...style,
                top: (style.top as number) + LISTBOX_PADDING,
            };

            const [rowProps, option, state, renderOption] = dataSet;

            const { key, ...optionProps } = rowProps;
            return (
                <Typography key={key} component="li" {...optionProps} noWrap style={inlineStyle}>
                    {renderOption(rowProps, option, state)}
                </Typography>
            );
        };

        const getHeight = () => {
            if (itemCount > 8) {
                return 8 * childSize;
            }
            return itemCount * childSize;
        };

        const gridRef = useResetCache(itemCount);

        return (
            <div ref={ref}>
                <OuterElementContext.Provider value={other}>
                    <VariableSizeList
                        itemData={itemData}
                        height={getHeight() + 2 * LISTBOX_PADDING}
                        width="100%"
                        ref={gridRef}
                        outerElementType={OuterElementType}
                        innerElementType="ul"
                        itemSize={() => childSize}
                        overscanCount={5}
                        itemCount={itemCount}
                    >
                        {renderRow}
                    </VariableSizeList>
                </OuterElementContext.Provider>
            </div>
        );
    },
);

export default ListboxComponent;
