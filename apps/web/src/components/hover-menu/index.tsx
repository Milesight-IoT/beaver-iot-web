import * as React from 'react';
import { Menu, type MenuProps } from '@mui/material';

/**
 * fix: Window Platform Error: Uncaught TypeError: Cannot read properties of undefined (reading 'useLayoutEffect')
 * @docs https://github.com/jcoreio/material-ui-popup-state/blob/master/src/HoverMenu.tsx
 */
const HoverMenu = React.forwardRef((props: MenuProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const paperSlotProps = React.useMemo(() => {
        const wrapped = props.slotProps?.paper;
        if (wrapped instanceof Function) {
            return (ownerProps: Parameters<typeof wrapped>[0]) => {
                const base = wrapped(ownerProps);
                return {
                    ...base,
                    style: {
                        pointerEvents: 'auto',
                        ...base?.style,
                    },
                } as const;
            };
        }
        return {
            ...wrapped,
            style: { pointerEvents: 'auto', ...wrapped?.style },
        } as const;
    }, [props.slotProps?.paper]);

    return (
        <Menu
            {...props}
            ref={ref}
            style={{ pointerEvents: 'none', ...props.style }}
            PaperProps={{
                ...props.PaperProps,
                style: {
                    pointerEvents: 'auto',
                    ...props.PaperProps?.style,
                },
            }}
            slotProps={{
                ...props.slotProps,
                paper: paperSlotProps,
            }}
        />
    );
});

export default React.memo(HoverMenu);
