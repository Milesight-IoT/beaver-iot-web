import React from 'react';
import { useControllableValue } from 'ahooks';

import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { KeyboardArrowDownIcon, MuiSelect } from '@milesight/shared/src/components';

import { SmtpForm, defaultSmtpValue, type SmtpProps } from './components';

import './style.less';

export enum EMAIL_TYPE {
    SMTP = 'SMTP',
    GMAIL = 'GMAIL',
}

export const EmailTypeOptions = [
    {
        label: 'SMTP',
        value: EMAIL_TYPE.SMTP,
    },
    /** Temporary remove Gmail */
    // {
    //     label: 'Gmail',
    //     value: EMAIL_TYPE.GMAIL,
    // },
];

export interface EmailConfigProps {
    provider?: EMAIL_TYPE;
    gmailConfig?: {
        apiKey: string;
    };
    smtpConfig?: SmtpProps;
}

export type EmailSendSourceProps = {
    value?: EmailConfigProps;
    onChange: (val: EmailConfigProps) => void;
};

/**
 * Email Notify Node
 * The Email Sending Source Component
 */
const EmailSendSource: React.FC<EmailSendSourceProps> = props => {
    const { value, onChange } = props;

    const { getIntlText } = useI18n();

    const [state, setState] = useControllableValue<EmailConfigProps>({
        value: value || {
            provider: EMAIL_TYPE.SMTP,
            smtpConfig: defaultSmtpValue,
        },
        onChange,
    });

    const renderEmailTypeItems = () => {
        const { provider, gmailConfig, smtpConfig } = state || {};

        switch (provider) {
            case EMAIL_TYPE.SMTP:
                return (
                    <SmtpForm
                        value={smtpConfig}
                        onChange={s => {
                            setState({
                                provider: EMAIL_TYPE.SMTP,
                                smtpConfig: s,
                            });
                        }}
                    />
                );
            case EMAIL_TYPE.GMAIL:
                return (
                    <TextField
                        required
                        fullWidth
                        label={getIntlText('workflow.email.label_gmail_config_api_key')}
                        type="text"
                        value={gmailConfig?.apiKey || ''}
                        onChange={e => {
                            setState({
                                provider: EMAIL_TYPE.GMAIL,
                                gmailConfig: {
                                    apiKey: e.target.value,
                                },
                            });
                        }}
                    />
                );
            default:
                null;
        }
    };

    return (
        <div className="ms-workflow-email-config">
            <div className="ms-workflow-email-config__type">
                <MuiSelect
                    formControlProps={{
                        fullWidth: true,
                        required: true,
                    }}
                    notched
                    variant="outlined"
                    label={getIntlText('workflow.label.node_email_type')}
                    options={EmailTypeOptions}
                    IconComponent={KeyboardArrowDownIcon}
                    value={state.provider || ''}
                    onChange={e => {
                        const provider = e.target.value as EMAIL_TYPE;
                        setState({
                            ...(provider === EMAIL_TYPE.GMAIL
                                ? {
                                      gmailConfig: {
                                          apiKey: '',
                                      },
                                  }
                                : { smtpConfig: defaultSmtpValue }),
                            provider,
                        });
                    }}
                />
            </div>

            {renderEmailTypeItems()}
        </div>
    );
};

export default EmailSendSource;
