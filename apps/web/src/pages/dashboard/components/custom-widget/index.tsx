import { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { Modal } from '@milesight/shared/src/components';
import ConfigPlugin from '@/plugin/config-plugin';

interface CustomWidgetProps {
    onCancel: () => void;
}

export default ({ onCancel }: CustomWidgetProps) => {
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
                console.error('json不合法');
            }
        }
    };

    return (
        <Modal onCancel={handleClose} onOk={() => {}} title="添加自定义组件">
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
                    生成组件
                </Button>

                {!!config && (
                    <ConfigPlugin onClose={handleCloseConfig} config={config} onOk={() => {}} />
                )}
            </div>
        </Modal>
    );
};
