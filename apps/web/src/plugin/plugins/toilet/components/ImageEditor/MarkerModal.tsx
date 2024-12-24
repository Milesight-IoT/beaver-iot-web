/* eslint-disable check-file/folder-naming-convention */
import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Modal,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
} from '@mui/material';
import { ViewConfigToiletProps } from '../../view/typings';

interface FormData {
    locationId: string;
    deviceId: string;
}

interface MarkerModalProps {
    open: boolean;
    onClose: () => void;
    formData: FormData;
    onChange: (e: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    config?: ViewConfigToiletProps;
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const MarkerModal = ({ open, onClose, formData, onChange, onSubmit, config }: MarkerModalProps) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    设置标记信息
                </Typography>
                <form onSubmit={onSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="位置ID"
                            name="locationId"
                            value={formData.locationId}
                            onChange={onChange}
                            required
                        />
                        <FormControl fullWidth required>
                            <InputLabel id="device-select-label">设备</InputLabel>
                            <Select
                                labelId="device-select-label"
                                id="device-select"
                                name="deviceId"
                                value={formData.deviceId}
                                label="设备"
                                onChange={onChange}
                            >
                                {config?.entity?.map(item => (
                                    <MenuItem
                                        key={item.value}
                                        value={item.value}
                                        sx={{
                                            whiteSpace: 'normal',
                                            '& .description': {
                                                fontSize: '0.8em',
                                                color: 'text.secondary',
                                            },
                                        }}
                                    >
                                        <div>
                                            <div>{item.rawData.deviceName}</div>
                                            <div className="description">{item.description}</div>
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button type="submit" variant="contained">
                            保存
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Modal>
    );
};

export default MarkerModal;
