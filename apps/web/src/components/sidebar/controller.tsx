import { IconButton } from '@mui/material';
import { useTheme, useStoreShallow } from '@milesight/shared/src/hooks';
import { MenuIcon, MenuOpenIcon } from '@milesight/shared/src/components';
import useSidebarStore from './store';

/**
 * Sidebar open and shrink controller
 */
const Controller = () => {
    const { matchTablet } = useTheme();
    const { open, setOpen, setShrink } = useSidebarStore(
        useStoreShallow(['open', 'setOpen', 'setShrink']),
    );

    if (!matchTablet) return null;
    return (
        <div className="ms-sidebar-controller">
            <IconButton
                className="ms-sidebar-controller-icon"
                sx={{
                    p: 0.5,
                    color: 'text.secondary',
                    '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                        color: 'text.secondary',
                    },
                }}
                onClick={() => {
                    setOpen(!open);
                    setShrink(false);
                }}
            >
                {open ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
        </div>
    );
};

export default Controller;
