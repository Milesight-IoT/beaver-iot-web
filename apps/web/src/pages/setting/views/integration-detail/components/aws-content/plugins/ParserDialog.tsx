import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Tabs, Tab } from '@mui/material';

import { AddIcon, CloseIcon} from '@milesight/shared/src/components';
const ParserDialog = ({ open, onClose, onSubmit, row }) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [tab, setTab] = useState('decode');

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
        // 清空内容
        setInputText('');
        setOutputText('');
    };

    const handleClose = () => {
        // 清空内容
        setInputText('');
        setOutputText('');
        onClose();
    };
    
    const unflatten = (data) => {
        if (Object(data) !== data || Array.isArray(data)) return data;
        const result = {};
        for (const i in data) {
            const keys = i.split('.');
            keys.reduce((r, e, j) => {
                return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 === j ? data[i] : {}) : []);
            }, result);
        }
        return result;
    };
    

    const handleSubmit = async () => {
        const [error, resp] = await onSubmit(inputText, tab);
        if (!error && resp && resp.data) {
            // let str = resp.data.slice(1, -1);
            let str = resp.data;
            // 提取 resp.data 并格式化为 JSON 字符串
            const nestedData = unflatten(str);
            const formattedOutput = JSON.stringify(nestedData, null, '\t');
            let obj = JSON.parse(formattedOutput);
            setOutputText(obj);
        } else {
            setOutputText('');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Parser</DialogTitle>
            <DialogContent>
                <Tabs value={tab} onChange={handleTabChange} aria-label="parser tabs">
                    <Tab label="Decode" value="decode" />
                    <Tab label="Encode" value="encode" />
                </Tabs>
                <Grid container spacing={2} style={{ marginTop: 16 }}>
                    <Grid item xs={6}>
                        <TextField
                            label="Input"
                            multiline
                            fullWidth
                            rows={10}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Output"
                            multiline
                            fullWidth
                            rows={10}
                            value={outputText}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained"
                    sx={{ height: 36, marginRight: 2, textTransform: 'none' }}
                    onClick={handleClose} color="inherit">
                    Close
                </Button>
                <Button variant="contained"
                    sx={{ height: 36, textTransform: 'none' }}
                    onClick={handleSubmit} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParserDialog;
