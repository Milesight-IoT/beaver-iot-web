import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { Button, IconButton, FormHelperText } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    DeleteOutlineIcon,
    AddIcon,
    KeyboardArrowDownIcon,
} from '@milesight/shared/src/components';
import { EntitySelect, type EntitySelectProps } from '@/components';
import type { EntitySelectOption } from '@/components/entity-select';
import { filterEntityMap } from '@/plugin/utils';
import Select from '../select';

import styles from './style.module.less';

type SingleEntitySelectProps = EntitySelectProps<EntityOptionType, false, false>;
export enum POSITION_AXIS {
    LEFT = 1,
    RIGHT = 2,
}

export interface ChartEntityPositionValueType {
    id: ApiKey;
    entity: EntitySelectOption | null;
    position: POSITION_AXIS;
}

export interface ChartEntityPositionProps
    extends Pick<
        SingleEntitySelectProps,
        'entityType' | 'entityValueType' | 'entityAccessMod' | 'excludeChildren'
    > {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: ChartEntityPositionValueType[];
    defaultValue?: ChartEntityPositionValueType[];
    onChange?: (value: ChartEntityPositionValueType[]) => void;
    entityType: SingleEntitySelectProps['entityType'];
    entityValueTypes: SingleEntitySelectProps['entityValueType'];
    entityAccessMods: SingleEntitySelectProps['entityAccessMod'];
    entityExcludeChildren: SingleEntitySelectProps['excludeChildren'];
    customFilterEntity: keyof typeof filterEntityMap;
}

const MAX_VALUE_LENGTH = 5;

/**
 * Select the entity and position of the line chart
 *
 * Note: use in line chart multiple y axis
 */
const ChartEntityPosition: React.FC<ChartEntityPositionProps> = ({
    multiple = true,
    error,
    helperText,
    entityType,
    entityValueType,
    entityValueTypes,
    entityAccessMod,
    entityAccessMods,
    entityExcludeChildren,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<ChartEntityPositionValueType[]>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<ChartEntityPositionValueType>(data);

    const positionOptions: OptionsProps[] = useMemo(() => {
        return [
            {
                label: getIntlText('dashboard.label.left_y_axis'),
                value: POSITION_AXIS.LEFT,
            },
            {
                label: getIntlText('dashboard.label.right_y_axis'),
                value: POSITION_AXIS.RIGHT,
            },
        ];
    }, [getIntlText]);

    useLayoutEffect(() => {
        if (
            isEqual(
                data,
                list.filter(item => Boolean(item.id)),
            )
        ) {
            return;
        }

        resetList(data);
    }, [data, resetList]);

    useEffect(() => {
        setData?.(list.filter(item => Boolean(item.id)));
    }, [list, setData]);

    return (
        <div className={styles['chart-entity-position']}>
            <div className={styles.label}>{getIntlText('common.label.data_source')}</div>
            <div className={styles['list-content']}>
                {list.map((item, index) => (
                    <div className={styles.item} key={getKey(index)}>
                        <EntitySelect
                            required
                            fieldName="entityId"
                            label={getIntlText('common.label.entity')}
                            popupIcon={<KeyboardArrowDownIcon />}
                            value={String(item?.id || '')}
                            onChange={option => {
                                replace(index, {
                                    id: option?.rawData?.entityId || '',
                                    entity: option,
                                    position: item.position,
                                });
                            }}
                            dropdownMatchSelectWidth={365}
                            entityType={entityType}
                            entityValueType={entityValueTypes || entityValueType}
                            entityAccessMod={entityAccessMods || entityAccessMod}
                            excludeChildren={entityExcludeChildren}
                        />
                        <Select
                            title={getIntlText('dashboard.label.y_axis')}
                            sx={{ width: '105px' }}
                            options={positionOptions}
                            defaultValue={POSITION_AXIS.LEFT}
                            value={item.position}
                            onChange={e => {
                                const value = e?.target?.value;
                                if (!value) return;

                                replace(index, {
                                    id: item.id,
                                    entity: item.entity,
                                    position: value as POSITION_AXIS,
                                });
                            }}
                        />
                        <div className={styles.icon}>
                            <IconButton onClick={() => remove(index)}>
                                <DeleteOutlineIcon />
                            </IconButton>
                        </div>
                    </div>
                ))}
                {multiple && (
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AddIcon />}
                        disabled={list.length >= MAX_VALUE_LENGTH}
                        onClick={() => {
                            if (list.length >= MAX_VALUE_LENGTH) return;
                            insert(list.length, {
                                id: '',
                                entity: null,
                                position: POSITION_AXIS.LEFT,
                            });
                        }}
                    >
                        {getIntlText('common.label.add')}
                    </Button>
                )}
            </div>
            <FormHelperText error={Boolean(error)}>{helperText}</FormHelperText>
        </div>
    );
};

export default ChartEntityPosition;
