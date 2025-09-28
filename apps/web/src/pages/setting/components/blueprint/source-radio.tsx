import React, { useMemo } from 'react';
import cls from 'classnames';
import { useControllableValue } from 'ahooks';
import { FormControl, InputLabel, FormHelperText } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { Logo, UploadFileIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import { BlueprintSourceType } from '@/services/http';

interface Props {
    label?: string;
    required?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: BlueprintSourceType;
    onChange?: (value: BlueprintSourceType) => void;
}

const SourceRadio: React.FC<Props> = ({ label, required, error, helperText, ...props }) => {
    const { getIntlText } = useI18n();
    const [source, setSource] = useControllableValue<BlueprintSourceType>(props);

    const options = useMemo<
        {
            key: BlueprintSourceType;
            icon: React.ReactNode;
            title: string;
            desc: string;
        }[]
    >(
        () => [
            {
                key: BlueprintSourceType.DEFAULT,
                icon: <Logo mini />,
                title: getIntlText('setting.blueprint.title_official_store'),
                desc: getIntlText('setting.blueprint.desc_official_store'),
            },
            {
                key: BlueprintSourceType.UPLOAD,
                icon: <UploadFileIcon />,
                title: getIntlText('common.label.local_upload'),
                desc: getIntlText('setting.blueprint.desc_local_upload'),
            },
        ],
        [getIntlText],
    );

    return (
        <FormControl
            fullWidth
            className="ms-blueprint-source-radio-root"
            error={error}
            required={required}
        >
            {label && <InputLabel required={required}>{label}</InputLabel>}
            <div className="radio-container">
                {options.map(item => (
                    <div
                        key={item.key}
                        className={cls('radio-item', { active: source === item.key })}
                        onClick={() => setSource(item.key)}
                    >
                        <div className="radio-item-icon">{item.icon}</div>
                        <div className="radio-item-detail">
                            <div className="radio-item-title">{item.title}</div>
                            <Tooltip autoEllipsis className="radio-item-desc" title={item.desc} />
                        </div>
                    </div>
                ))}
                {helperText && <FormHelperText>{helperText}</FormHelperText>}
            </div>
        </FormControl>
    );
};

export default SourceRadio;
