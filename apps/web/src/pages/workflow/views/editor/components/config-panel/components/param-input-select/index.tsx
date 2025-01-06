import { useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useControllableValue, useSize } from 'ahooks';
import { TextField, IconButton, Chip, Popover } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { SettingsOutlinedIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import useWorkflow, {
    type FlattenNodeParamType,
} from '@/pages/workflow/views/editor/hooks/useWorkflow';
import { isRefParamKey } from '@/pages/workflow/views/editor/helper';
import UpstreamNodeList from '../upstream-node-list';
import './style.less';

type ParamInputSelectValueType = string | undefined;

export interface ParamInputSelectProps {
    label?: string;

    required?: boolean;

    /**
     * Param Select Placeholder
     */
    placeholder?: string;

    value?: ParamInputSelectValueType;

    defaultValue?: ParamInputSelectValueType;

    onChange?: (value: ParamInputSelectValueType) => void;
}

/**
 * Param Input Select Component
 *
 * Note: This is a basic component., use in CodeNode, ServiceNode, EntityAssignmentNode
 */
const ParamInputSelect: React.FC<ParamInputSelectProps> = ({
    label,
    required = true,
    placeholder,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const { getUpstreamNodeParams } = useWorkflow();
    const [, options] = getUpstreamNodeParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useControllableValue<ParamInputSelectValueType>(props);
    const [inputValue, setInputValue] = useState<string>('');
    const [selectValue, setSelectValue] = useState<FlattenNodeParamType>();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { width: containerWidth } = useSize(containerRef) || {};

    const handleInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        e => {
            const { value } = e.target;

            // input value
            if (!isRefParamKey(value)) {
                setData(value);
                setInputValue(value);
                return;
            }

            // Reference to an entity
            setInputValue('');
            const option = options?.find(item => item.valueKey === value);

            if (!option) return;
            setData(value);
            setSelectValue(option);
        },
        [options, setData],
    );

    useLayoutEffect(() => {
        // Direct input value
        if (!isRefParamKey(data)) {
            setInputValue(data || '');
            setSelectValue(undefined);
            return;
        }

        // Reference to an entity
        setInputValue('');
        const option = options?.find(item => item.valueKey === data);

        setSelectValue(val => {
            if (val && val.valueKey === data) {
                return val;
            }
            return option;
        });
    }, [data, options]);

    return (
        <div className="ms-param-input-select" ref={containerRef}>
            <TextField
                fullWidth
                autoComplete="off"
                label={label || getIntlText('common.label.value')}
                required={required}
                placeholder={
                    selectValue
                        ? ''
                        : placeholder ||
                          getIntlText('workflow.editor.form_param_select_placeholder')
                }
                slotProps={{
                    input: {
                        readOnly: !!selectValue,
                        endAdornment: (
                            <IconButton onClick={() => setAnchorEl(containerRef.current)}>
                                <SettingsOutlinedIcon />
                            </IconButton>
                        ),
                    },
                }}
                value={inputValue}
                onChange={handleInputChange}
            />
            {!!selectValue && (
                <Chip
                    className="ms-param-input-select-chip"
                    label={
                        <>
                            <Tooltip autoEllipsis className="name" title={selectValue.valueName} />
                            {/* <span className="divider">/</span> */}
                            {/* <Tooltip autoEllipsis className="type" title="BOOLEAN" /> */}
                            {selectValue.valueType && (
                                <>
                                    <span className="divider">/</span>
                                    <Tooltip
                                        autoEllipsis
                                        className="type"
                                        title={selectValue.valueType}
                                    />
                                </>
                            )}
                        </>
                    }
                    onDelete={() => setData(undefined)}
                />
            )}
            <Popover
                className="ms-param-input-select-menu"
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiList-root': {
                        width: containerWidth,
                        minWidth: 300,
                        maxHeight: 420,
                    },
                }}
            >
                <UpstreamNodeList
                    onChange={node => {
                        setAnchorEl(null);
                        setData(node.valueKey);
                    }}
                />
            </Popover>
        </div>
    );
};

export default ParamInputSelect;
