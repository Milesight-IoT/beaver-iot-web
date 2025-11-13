import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { isEqual } from 'lodash-es';
import { useDebounceEffect, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { InfoOutlinedIcon } from '@milesight/shared/src/components';
import { ToggleRadio, Tooltip } from '@/components';
import EntityMultipleSelect, { type EntityMultipleSelectProps } from '../entity-multiple-select';
import TagMultipleSelect from '../tag-multiple-select';
import './style.less';

export type EntityDataSelectValueType = Partial<
    NonNullable<ListenerNodeDataType['parameters']>['entityData']
>;

interface Props {
    value?: EntityDataSelectValueType;
    defaultValue?: EntityDataSelectValueType;
    onChange?: (value: EntityDataSelectValueType) => void;
}

type DataType = keyof NonNullable<EntityDataSelectValueType>;

const entityFilterModel: EntityMultipleSelectProps['filterModel'] = {
    type: ['PROPERTY'],
    accessMode: ['R', 'RW'],
};

/**
 * Entity Data Select Component
 */
const EntityDataSelect: React.FC<Props> = memo(props => {
    const { getIntlText } = useI18n();
    const [value, setValue] = useControllableValue<EntityDataSelectValueType>(props);

    // ---------- Toggle Radio ----------
    const [dataType, setDataType] = useState<DataType>();
    const options = useMemo<
        { label: React.ReactNode; value: DataType; helperText?: React.ReactNode }[]
    >(() => {
        return [
            {
                value: 'keys',
                label: getIntlText('workflow.label.select_entities'),
            },
            {
                value: 'tags',
                label: (
                    <>
                        {getIntlText('workflow.label.select_by_tags')}
                        <Tooltip title={getIntlText('workflow.message.batch_select_by_tags_tip')}>
                            <InfoOutlinedIcon />
                        </Tooltip>
                    </>
                ),
            },
        ];
    }, [getIntlText]);

    // ---------- Update value ----------
    const [entityKeys, setEntityKeys] = useState<NonNullable<EntityDataSelectValueType>['keys']>();
    const [tagKeys, setTagKeys] = useState<NonNullable<EntityDataSelectValueType>['tags']>();
    const handleValueChange = useCallback(
        (type: DataType, value: NonNullable<EntityDataSelectValueType>[DataType]) => {
            setValue({ [type]: value });
        },
        [setValue],
    );

    // Update inner keys/tags when props value change
    useDebounceEffect(
        () => {
            const type: DataType = value?.tags ? 'tags' : 'keys';

            switch (type) {
                case 'keys': {
                    setEntityKeys(oKeys => {
                        if (isEqual(oKeys, value?.keys)) return oKeys;
                        return value?.keys;
                    });
                    break;
                }
                case 'tags': {
                    setTagKeys(oTags => {
                        if (isEqual(oTags, value?.tags)) return oTags;
                        return value?.tags;
                    });
                    break;
                }
                default: {
                    break;
                }
            }

            setDataType(type);
        },
        [value],
        { wait: 300 },
    );

    return (
        <div className="ms-entity-data-select-root">
            <ToggleRadio options={options} value={dataType} onChange={setDataType} />
            <div className="ms-entity-data-select-body">
                {dataType === 'keys' && (
                    <EntityMultipleSelect
                        filterModel={entityFilterModel}
                        value={entityKeys}
                        onChange={keys => {
                            setEntityKeys(keys);
                            handleValueChange('keys', keys);
                        }}
                    />
                )}
                {dataType === 'tags' && (
                    <TagMultipleSelect
                        value={tagKeys}
                        onChange={tags => {
                            setTagKeys(tags);
                            handleValueChange('tags', tags);
                        }}
                    />
                )}
            </div>
        </div>
    );
});

export default EntityDataSelect;
