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
import { EntitySelect } from '@/components';
import type { EntitySelectOption } from '@/components/entity-select';
import Select from '../select';

import './style.less';

export enum POSITION_AXIS {
    LEFT = 1,
    RIGHT = 2,
}

export interface ChartEntityPositionValueType {
    id: ApiKey;
    entity: EntitySelectOption | null;
    position: POSITION_AXIS;
}

export interface ChartEntityPositionProps {
    label?: string[];
    required?: boolean;
    multiple?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: ChartEntityPositionValueType[];
    defaultValue?: ChartEntityPositionValueType[];
    onChange?: (value: ChartEntityPositionValueType[]) => void;
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
        <div className="ms-entity-assign-select">
            <div className="ms-entity-assign-select__label">
                {getIntlText('common.label.data_source')}
            </div>
            <div className="list-content">
                {list.map((item, index) => (
                    <div className="ms-entity-assign-select-item" key={getKey(index)}>
                        <EntitySelect
                            required
                            fieldName="entityId"
                            className="ms-entity-select"
                            label={getIntlText('common.label.entity')}
                            popupIcon={<KeyboardArrowDownIcon />}
                            value={String(item?.id || '')}
                            onChange={option => {
                                if (!option) return;

                                replace(index, {
                                    id: option?.rawData?.entityId || '',
                                    entity: option,
                                    position: item.position,
                                });
                            }}
                            dropdownMatchSelectWidth={360}
                        />
                        <Select
                            title={getIntlText('dashboard.label.y_axis')}
                            sx={{ width: '100px' }}
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
                        <IconButton onClick={() => remove(index)}>
                            <DeleteOutlineIcon />
                        </IconButton>
                    </div>
                ))}
                {multiple && (
                    <Button
                        fullWidth
                        variant="outlined"
                        className="ms-entity-assign-select-add-btn"
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
