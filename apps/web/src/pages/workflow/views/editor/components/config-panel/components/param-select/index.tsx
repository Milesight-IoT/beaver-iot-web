import { useCallback } from 'react';
import {
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    ListSubheader,
    type SelectProps,
} from '@mui/material';
import { isNil } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { KeyboardArrowDownIcon } from '@milesight/shared/src/components';
import { Empty, Tooltip } from '@/components';
import useWorkflow from '@/pages/workflow/views/editor/hooks/useWorkflow';
import './style.less';

type ParamSelectValueType = string;

export type ParamSelectProps = SelectProps<ParamSelectValueType>;

/**
 * Param Select Component
 *
 * Note: This is a basic component, use in IfelseNode
 */
const ParamSelect: React.FC<ParamSelectProps> = ({ label, required, disabled, ...props }) => {
    const { getIntlText } = useI18n();
    const { getUpstreamNodeParams } = useWorkflow();

    const renderOptions = useCallback(() => {
        const [data] = getUpstreamNodeParams();
        const result: React.ReactNode[] = (data || [])
            .map(item => {
                if (!item.outputs.length) return null;

                return [
                    <ListSubheader className="ms-param-select-option-groupname" key={item.nodeId}>
                        {item.nodeType}
                    </ListSubheader>,
                    item.outputs.map(output => (
                        <MenuItem
                            className="ms-param-select-option"
                            key={output.key}
                            value={output.key}
                        >
                            <div className="ms-param-select-item">
                                <Tooltip autoEllipsis className="name" title={output.name} />
                                <span className="divider">/</span>
                                <Tooltip autoEllipsis className="type" title={output.type} />
                                {/* <span className="type">{output.type}</span> */}
                            </div>
                        </MenuItem>
                    )),
                ];
            })
            .filter(Boolean);

        if (!result.length) {
            result.push(<Empty size="small" text={getIntlText('common.label.empty')} />);
        }

        return result;
    }, [getIntlText, getUpstreamNodeParams]);

    return (
        <div className="ms-param-select">
            <FormControl fullWidth required={required} disabled={disabled}>
                <InputLabel id="param-select-label">
                    {!isNil(label) ? label : getIntlText('common.label.value')}
                </InputLabel>
                <Select<ParamSelectValueType>
                    {...props}
                    // @ts-ignore
                    notched
                    defaultValue=""
                    labelId="param-select-label"
                    label={!isNil(label) ? label : getIntlText('common.label.value')}
                    IconComponent={KeyboardArrowDownIcon}
                    MenuProps={{
                        className: 'ms-param-select-menu',
                        anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                        },
                        transformOrigin: {
                            vertical: 'top',
                            horizontal: 'right',
                        },
                    }}
                >
                    {renderOptions()}
                </Select>
            </FormControl>
        </div>
    );
};

export default ParamSelect;
