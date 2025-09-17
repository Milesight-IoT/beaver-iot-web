import React, { useState } from 'react';
import { isNil } from 'lodash-es';
import { IconButton } from '@mui/material';
import { useCopy, useI18n } from '@milesight/shared/src/hooks';
import {
    ContentCopyIcon,
    VisibilityIcon,
    VisibilityOffIcon,
} from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import './style.less';

type OptionItem = {
    label: string;
    value?: string | number | null;
    type?: 'text' | 'password';
    copyable?: boolean;
};

export interface Props {
    title?: string;

    options?: OptionItem[];

    emptyPlaceholder?: string;
}

const ParamsList: React.FC<Props> = ({ title, options, emptyPlaceholder = '-' }) => {
    const { getIntlText } = useI18n();
    const { handleCopy } = useCopy();
    const [visible, setVisible] = useState<Record<string, boolean>>({});

    return (
        <div className="ms-node-form-group">
            <div className="ms-node-form-group-header">
                {title && <div className="ms-node-form-group-title">{title}</div>}
            </div>
            <div className="ms-node-form-group-item">
                <div className="ms-params-list">
                    {options?.map(option => (
                        <div className="ms-params-list-item" key={option.label}>
                            <div className="ms-params-list-item-label">{option.label}</div>
                            <div className="ms-params-list-item-value">
                                <div className="content">
                                    {/* <Tooltip
                                        autoEllipsis
                                        title={
                                            visible[option.label] || option.type !== 'password'
                                                ? option.value
                                                : `${option.value}`.replace(/./g, '*')
                                        }
                                    /> */}
                                    {isNil(option.value) ? (
                                        emptyPlaceholder
                                    ) : (
                                        <Tooltip
                                            autoEllipsis
                                            title={
                                                visible[option.label] || option.type !== 'password'
                                                    ? option.value
                                                    : `${option.value}`.replace(/./g, '*')
                                            }
                                        />
                                    )}
                                </div>
                                {!isNil(option.value) && (
                                    <div className="actions">
                                        {option.type === 'password' && (
                                            <Tooltip
                                                title={getIntlText(
                                                    !visible[option.label]
                                                        ? 'common.label.visible'
                                                        : 'common.label.invisible',
                                                )}
                                            >
                                                <IconButton
                                                    onClick={() => {
                                                        setVisible(prev => ({
                                                            ...prev,
                                                            [option.label]: !prev[option.label],
                                                        }));
                                                    }}
                                                >
                                                    {!visible[option.label] ? (
                                                        <VisibilityIcon />
                                                    ) : (
                                                        <VisibilityOffIcon />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {option.copyable !== false && (
                                            <Tooltip title={getIntlText('common.label.copy')}>
                                                <IconButton
                                                    onClick={e => {
                                                        handleCopy(
                                                            `${option.value}`,
                                                            (e.target as HTMLElement)?.closest(
                                                                'div',
                                                            ),
                                                        );
                                                    }}
                                                >
                                                    <ContentCopyIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParamsList;
