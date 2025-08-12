import { useState } from 'react';
import { Box, MenuItem } from '@mui/material';
import * as Icons from '@milesight/shared/src/components/icons';
import Select from '../select';
import IconList from './icon-list';
import './style.less';

const IconSelect = (props: any) => {
    const { value, onChange, ...rest } = props;
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const IconTag = value ? (Icons as any)[value] : null;

    const handleColorChange = (value?: string | number) => {
        onChange(value);
        handleClose();
    };

    const options: OptionsProps[] = Object.keys(Icons).map(key => {
        return {
            label: key,
            value: key,
        };
    });
    return (
        <Select
            {...rest}
            onOpen={handleOpen}
            onClose={handleClose}
            open={open}
            value={value}
            className="icon-select"
            renderValue={() => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {IconTag && <IconTag />}
                    </Box>
                );
            }}
            renderOptions={() => {
                return (
                    <MenuItem onClick={handleOpen} className="icon-select-menu" value={value}>
                        <IconList
                            onChange={handleColorChange}
                            options={options}
                            value={value}
                            isShow={open}
                        />
                    </MenuItem>
                );
            }}
            MenuProps={{
                classes: {
                    paper: 'ms-icon-select-menu-paper',
                },
            }}
        />
    );
};

export default IconSelect;
