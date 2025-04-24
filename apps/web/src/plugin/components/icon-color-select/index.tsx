import React, { useMemo, useState } from 'react';
import { Box, MenuItem, Button } from '@mui/material';
import { Sketch, type ColorResult } from '@uiw/react-color';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import Select from '../select';
import './style.less';

const IconColorSelect = (props: any) => {
    const { getIntlText } = useI18n();
    const { red, deepOrange, yellow, purple, grey, green, blue, black, white } = useTheme();

    const { value, onChange, ...rest } = props;
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleColorChange = (color: ColorResult) => {
        onChange(color.hexa);
    };

    // Default panel color
    const presetColors = useMemo(
        () => [
            red['600'],
            deepOrange['600'],
            yellow['600'],
            green['600'],
            purple['600'],
            blue['600'],
            black,
            grey['600'],
            white,
        ],
        [black, blue, deepOrange, green, grey, purple, red, white, yellow],
    );
    return (
        <Select
            {...rest}
            className="icon-color-select"
            onOpen={handleOpen}
            onClose={handleClose}
            open={open}
            value={value}
            renderValue={() => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                        className="icon-color-select-value"
                        sx={{
                            backgroundColor: value,
                        }}
                    />
                    {rest.value}
                </Box>
            )}
            MenuProps={{
                MenuListProps: {
                    sx: {
                        padding: 0,
                    },
                },
            }}
            renderOptions={() => {
                return (
                    <MenuItem disableRipple onClick={handleOpen} className="icon-color-select-menu">
                        <div
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                            }}
                        >
                            <Sketch
                                color={value}
                                onChange={handleColorChange}
                                presetColors={presetColors}
                                width={235}
                                style={{ backgroundColor: 'var(--main-background)' }}
                            />
                            <div className="icon-color-select-submit">
                                <Button
                                    className="icon-color-select-button"
                                    onClick={handleClose}
                                    fullWidth
                                    disableRipple
                                >
                                    {getIntlText('common.button.confirm')}
                                </Button>
                            </div>
                        </div>
                    </MenuItem>
                );
            }}
        />
    );
};

export default IconColorSelect;
