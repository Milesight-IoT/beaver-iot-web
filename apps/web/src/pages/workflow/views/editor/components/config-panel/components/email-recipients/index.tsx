import React from 'react';
import { TextField } from '@mui/material';
import { useControllableValue, useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';

export interface EmailRecipientsProps {
    value?: string[];
    onChange: (value: string[]) => void;
}

/**
 * email recipients component
 */
const EmailRecipients: React.FC<EmailRecipientsProps> = props => {
    const { value, onChange } = props;

    const { getIntlText } = useI18n();

    const [state, setState] = useControllableValue({
        value: value || '',
        onChange,
    });

    const transformValue = useMemoizedFn((value: string[]) => {
        if (!value) return '';

        if (Array.isArray(value)) {
            return value.join(';');
        }

        return value;
    });

    const handleChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
        setState((e?.target?.value || '').split(';'));
    });

    return (
        <TextField
            required
            fullWidth
            autoComplete="off"
            label={getIntlText('workflow.email.label_content_recipients')}
            helperText={getIntlText('workflow.email.label_content_recipients_tip')}
            value={transformValue(state)}
            onChange={handleChange}
        />
    );
};

export default EmailRecipients;
