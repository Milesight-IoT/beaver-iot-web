import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import {
    TextField,
    FormControl,
    FormControlLabel,
    InputLabel,
    Select,
    Switch,
    MenuItem,
} from '@mui/material';
// import { useI18n } from '@milesight/shared/src/hooks';
// import { checkRequired } from '@milesight/shared/src/utils/validators';
import { NodeFormItemValueType } from '../../../typings';
import useFlowStore from '../../../store';
import {
    CodeEditor,
    ConditionsInput,
    EntityAssignSelect,
    EntityMultipleSelect,
    EntitySelect,
    ParamAssignInput,
    TimerInput,
    EmailContent,
    ParamInput,
    ServiceParamAssignInput,
    EmailSendSource,
    EmailRecipients,
} from '../components';

type NodeFormGroupType = {
    groupType?: string;
    groupName?: string;
    helperText?: string;
    children?: (ControllerProps<NodeFormDataProps> & {
        valueType?: NodeFormItemValueType;
        /**
         * To Control whether the current component is rendered
         */
        shouldRender?: (data: NodeFormDataProps) => boolean;
    })[];
};

/**
 * Form Item Props
 */
export type NodeFormDataProps = Record<string, any>;

interface Props {
    readonly?: boolean;
    nodeType?: WorkflowNodeType;
}

const useNodeFormItems = ({ nodeType, readonly }: Props) => {
    const nodeConfigs = useFlowStore(state => state.nodeConfigs);
    // const { getIntlText } = useI18n();

    const formConfigs = useMemo(() => {
        if (!Object.keys(nodeConfigs).length) return {};

        // console.log({ nodeConfigs });
        const result: Partial<Record<WorkflowNodeType, NodeFormGroupType[]>> = {};
        Object.entries(nodeConfigs).forEach(([nodeType, nodeConfig]) => {
            const { properties = {}, outputProperties = {} } = nodeConfig.schema || {};
            const formConfigs = Object.entries(properties)
                .filter(([_, item]) => !item.autowired)
                .map(([name, item]) => {
                    item.name = item.name || name;
                    return item;
                })
                .sort((a, b) => (a.index || 0) - (b.index || 0))
                .concat(
                    Object.entries(outputProperties)
                        .filter(([_, item]) => !item.autowired && item.editable)
                        .map(([name, item]) => {
                            item.name = item.name || name;
                            return item;
                        })
                        .sort((a, b) => (a.index || 0) - (b.index || 0)),
                );
            const formGroups: NodeFormGroupType[] = [];

            result[nodeType as WorkflowNodeType] = formGroups;
            formConfigs.forEach(
                ({
                    name,
                    type,
                    secret,
                    required,
                    enum: enums,
                    defaultValue,
                    displayName,
                    description,
                    uiComponent,
                    uiComponentGroup,
                }) => {
                    const groupType = uiComponentGroup || name;
                    const groupName = uiComponentGroup || displayName;
                    const helperText = description;
                    let group = formGroups.find(item => item.groupType === groupType);

                    if (!group) {
                        group = {
                            groupType,
                            groupName,
                            helperText,
                            children: [],
                        };
                        formGroups.push(group);
                    }

                    const formItem: NonNullable<NodeFormGroupType['children']>[0] = {
                        name,
                        valueType: type,
                        render({ field: { onChange, value } }) {
                            return (
                                <TextField
                                    fullWidth
                                    type={secret ? 'password' : undefined}
                                    autoComplete={secret ? 'new-password' : 'off'}
                                    sx={{ my: 1.5 }}
                                    required={required}
                                    label={displayName}
                                    defaultValue={defaultValue}
                                    value={value}
                                    onChange={onChange}
                                />
                            );
                        },
                    };

                    if (uiComponent) {
                        switch (uiComponent) {
                            case 'paramDefineInput': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <ParamInput value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'paramAssignInput': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <ParamAssignInput value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'EntitySelect': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <EntitySelect value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'entityMultipleSelect': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return (
                                        <EntityMultipleSelect value={value} onChange={onChange} />
                                    );
                                };
                                break;
                            }
                            case 'entityAssignSelect': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <EntityAssignSelect value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'timerSettings': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <TimerInput value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'conditionsInput': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <ConditionsInput value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'codeEditor': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return (
                                        <CodeEditor
                                            readOnly={readonly}
                                            editable={!readonly}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    );
                                };
                                break;
                            }
                            case 'serviceEntitySetting': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return (
                                        <ServiceParamAssignInput
                                            value={value}
                                            onChange={onChange}
                                        />
                                    );
                                };
                                break;
                            }
                            case 'emailContent': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <EmailContent value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'emailSendSource': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <EmailSendSource value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            case 'emailRecipients': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return <EmailRecipients value={value} onChange={onChange} />;
                                };
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    } else if (enums?.length) {
                        formItem.render = ({ field: { onChange, value } }) => {
                            return (
                                <FormControl fullWidth size="small" sx={{ my: 1.5 }}>
                                    <InputLabel required={required} id={`select-label-${name}`}>
                                        {displayName}
                                    </InputLabel>
                                    <Select
                                        notched
                                        label={displayName}
                                        labelId={`select-label-${name}`}
                                        required={required}
                                        value={value}
                                        onChange={onChange}
                                    >
                                        {Object.entries(enums || {}).map(([key, value]) => (
                                            <MenuItem key={value} value={key}>
                                                {value}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            );
                        };
                    } else {
                        switch (type) {
                            case 'map':
                            case 'array':
                            case 'object': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return (
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            required={required}
                                            label={displayName}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    );
                                };
                                break;
                            }
                            case 'boolean': {
                                formItem.render = ({ field: { onChange, value } }) => {
                                    return (
                                        <FormControl fullWidth size="small" sx={{ my: 1.5 }}>
                                            <FormControlLabel
                                                label={displayName}
                                                required={required}
                                                checked={!!value}
                                                onChange={onChange}
                                                control={<Switch size="small" />}
                                                sx={{ fontSize: '12px' }}
                                            />
                                        </FormControl>
                                    );
                                };
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }

                    group.children?.push(formItem);
                },
            );
        });

        return result;
    }, [nodeConfigs]);

    return !nodeType ? [] : formConfigs[nodeType] || [];
};

export default useNodeFormItems;
