import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { isEqual } from 'lodash-es';
import { useControllableValue, useDebounceFn, useDynamicList } from 'ahooks';
import { Divider, IconButton, Tooltip } from '@mui/material';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import { HelpIcon } from '@milesight/shared/src/components';
import { useEntityApi } from '@/plugin/hooks';
import useConfigPanelStore from '../../store';
import ParamInputSelect, { ParamInputSelectProps } from '../param-input-select';
import EntitySelect from '../entity-select';
import './style.less';

type InputParamListType = {
    key: ApiKey;
    name: ApiKey;
    type: ApiKey;
    value: ParamInputSelectProps['value'];
};
type ServiceParamsValueType = {
    [key: string]: string | undefined;
};
type ServiceParamAssignInputValueType = {
    serviceEntity?: ApiKey;
    paramList?: InputParamListType[];
    serviceParams: ServiceParamsValueType;
};
type ServiceParamAssignInputProps = {
    required?: boolean;
    disabled?: boolean;
    helperText?: string;
    value?: ServiceParamAssignInputValueType;
    defaultValue?: ServiceParamAssignInputValueType;
    onChange?: (value: ServiceParamAssignInputValueType) => void;
};
type EntityItem = {
    entity_key: ApiKey;
    entity_name: ApiKey;
    entity_value_type: ApiKey;
};

const ServiceParamAssignInput: React.FC<ServiceParamAssignInputProps> = ({
    required,
    disabled,
    defaultValue,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const { helperText = getIntlText('workflow.node.service_helptext') } = props;
    const { getEntityList } = useConfigPanelStore(useStoreShallow(['getEntityList']));
    const { getEntityChildren } = useEntityApi();
    const [innerValue, setInnerValue] =
        useControllableValue<ServiceParamAssignInputValueType>(props);
    const { list, replace, resetList } = useDynamicList<InputParamListType>([]);
    const preValueRef = useRef<ServiceParamAssignInputValueType>();

    const handlerChange = useCallback(
        async (serviceEntity?: ApiKey) => {
            setInnerValue(pre => ({ ...pre, serviceEntity }));
            if (serviceEntity) {
                const entityFilterList = await getEntityList({ keyword: serviceEntity as string });
                if (entityFilterList?.length) {
                    const entityItem = entityFilterList[0];
                    const { error, res } = await getEntityChildren({
                        id: entityItem.entity_id,
                    });
                    if (!error) {
                        resetList(
                            res.map((item: EntityItem) => {
                                const valueItem: ParamInputSelectProps['value'] =
                                    innerValue?.serviceParams?.[item.entity_key as string];
                                return {
                                    key: item.entity_key,
                                    name: item.entity_name,
                                    type: item.entity_value_type,
                                    value: valueItem || undefined,
                                };
                            }),
                        );
                        return;
                    }
                }
            }
            if (list.length) {
                resetList([]);
            }
        },
        [innerValue],
    );
    const renderInputParam = useMemo(() => {
        if (list.length) {
            return (
                <div className="ms-service-param-assign-input">
                    {list.map((item, index) => {
                        return (
                            <div key={item.key} className="param-item">
                                <div className="param-item-title">
                                    <span className="param-item-name">{item.name}</span>
                                    <span className="param-item-type">{item.type}</span>
                                </div>
                                <ParamInputSelect
                                    required={required}
                                    value={item?.value}
                                    onChange={data => {
                                        replace(index, { ...item, value: data });
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    }, [list]);
    const transformParams = useCallback(
        (paramList: InputParamListType[]): ServiceParamsValueType => {
            const res: ServiceParamsValueType = {};
            paramList.forEach(item => {
                res[item.key] = item.value;
            });
            return res;
        },
        [],
    );
    useLayoutEffect(() => {
        if (isEqual(preValueRef.current, innerValue)) return;
        preValueRef.current = innerValue;
        handlerChange(innerValue?.serviceEntity);
    }, [innerValue]);
    useLayoutEffect(() => {
        setInnerValue(pre => {
            const newValue = { ...pre, serviceParams: transformParams(list) };
            preValueRef.current = newValue;
            return newValue;
        });
    }, [list]);
    return (
        <div className="ms-service-entity-call">
            <EntitySelect
                filterModel={{ type: 'SERVICE' }}
                value={innerValue?.serviceEntity ?? ''}
                onChange={handlerChange}
            />
            <Divider className="ms-divider" />
            <div className="ms-node-form-group-title">
                {getIntlText('workflow.node.input_variables')}
                {helperText && !innerValue?.serviceEntity && (
                    <Tooltip enterDelay={300} enterNextDelay={300} title={helperText}>
                        <IconButton size="small">
                            <HelpIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
            {renderInputParam}
        </div>
    );
};
export default ServiceParamAssignInput;
