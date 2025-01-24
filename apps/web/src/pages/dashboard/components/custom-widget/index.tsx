import { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { Modal } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';
import ConfigPlugin from '@/plugin/config-plugin';

interface CustomWidgetProps {
    onCancel: () => void;
}

export default ({ onCancel }: CustomWidgetProps) => {
    const { getIntlText } = useI18n();
    const [config, setConfig] = useState();
    const [json, setJson] = useState('');

    const handleClose = () => {
        onCancel();
    };

    const handleCloseConfig = () => {
        setConfig(undefined);
    };

    const handleCreatePlugin = () => {
        if (json) {
            try {
                const configJson = JSON.parse(json);
                setConfig(configJson);
            } catch (error) {
                console.error('json invalid');
            }
        }
    };

    return (
        <Modal
            onCancel={handleClose}
            onOk={() => {}}
            title={getIntlText('dashboard.add_custom_components')}
        >
            <div className="dashboard-content">
                <TextField
                    id="outlined-multiline-static"
                    label="Multiline"
                    multiline
                    rows={10}
                    value={json}
                    onChange={e => setJson(e.target.value)}
                    fullWidth
                />
                <Button sx={{ marginTop: '20px' }} variant="outlined" onClick={handleCreatePlugin}>
                    {getIntlText('dashboard.generate_component')}
                </Button>

                {!!config && (
                    <ConfigPlugin onClose={handleCloseConfig} config={config} onOk={() => {}} />
                )}
            </div>
        </Modal>
    );
};
