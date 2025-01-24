import { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import ConfigPlugin from '@/plugin/config-plugin';
import components from '@/plugin/plugins/components';

const PLUGINDIR = '../../plugin';

export default () => {
    const { getIntlText } = useI18n();
    const [config, setConfig] = useState();
    const [json, setJson] = useState('');

    const handleClick = async (comName: string) => {
        const jsonPath = `${PLUGINDIR}/plugins/${comName}/config.json`;
        const jsonData = await import(jsonPath);
        setConfig(jsonData.default);
    };

    const handleClose = () => {
        setConfig(undefined);
    };

    const handleCreatPlugin = () => {
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
        <div className="ms-page-demo">
            {components?.map((comName: any) => {
                return <div onClick={() => handleClick(comName)}>{comName}</div>;
            })}
            <TextField
                id="outlined-multiline-static"
                label="Multiline"
                multiline
                rows={10}
                value={json}
                onChange={(e: any) => setJson(e.target.value)}
                fullWidth
            />
            <Button sx={{ marginTop: '20px' }} variant="outlined" onClick={handleCreatPlugin}>
                {getIntlText('dashboard.generate_component')}
            </Button>
            {!!config && <ConfigPlugin onClose={handleClose} config={config} />}
        </div>
    );
};
