import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import cls from 'classnames';
import { isUndefined, isBoolean } from 'lodash-es';
import { useDebounceFn } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { ArrowForwardIosIcon, CheckIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import type { ValueType } from './typings';

interface Props {
    /** Whether multiple selection is enabled */
    multiple?: boolean;
    /** Class name for the component */
    className?: string;
    /** All devices */
    devices?: ValueType[];
    /** Whether filter the bound device */
    isBound?: boolean;
    /** The devices that filtered by search keyword */
    searchDevices?: ValueType[];
    /** The value of the component */
    value?: ValueType | ValueType[];
    /** The devices that selected */
    onSelectedChange?: (value: ValueType | ValueType[]) => void;
}

type NormalDataType = {
    integrationId: ApiKey;
    integrationName: string;
    devices: ValueType[];
};

const List = forwardRef<HTMLDivElement, Props>(
    (
        { multiple, className, devices, isBound, searchDevices, value, onSelectedChange, ...props },
        ref,
    ) => {
        // console.log({ value, devices, searchDevices });
        const { getIntlText } = useI18n();
        const dataList = useMemo(() => {
            const map = new Map<ApiKey, ValueType[]>();
            const result: NormalDataType[] = [];

            devices?.forEach(item => {
                const integrationId = item.integration_id!;
                if (isBoolean(isBound) && isBoolean(item.bound) && item.bound !== isBound) {
                    return;
                }
                if (!map.has(integrationId)) {
                    map.set(integrationId, []);
                }
                map.get(integrationId)?.push(item);
            });

            map.forEach((devices, integrationId) => {
                const integrationName = devices[0].integration_name || '';
                result.push({
                    integrationId,
                    integrationName,
                    devices,
                });
            });

            return result;
        }, [devices, isBound]);

        // ---------- Interactions ----------
        const [targetRecord, setTargetRecord] = useState<NormalDataType>();
        const { run: handleMouseEnter } = useDebounceFn(
            (data: NormalDataType) => {
                setTargetRecord(data);
            },
            { wait: 300 },
        );
        const handleSelect = (data: ValueType) => {
            if (!multiple) {
                onSelectedChange?.(data);
                return;
            }
            const values = !value ? [] : Array.isArray(value) ? value : [value];
            const selected = !!values.find(v => v.id === data.id);
            if (selected) {
                onSelectedChange?.(values.filter(v => v.id !== data.id));
            } else {
                onSelectedChange?.([...values, data]);
            }
        };

        useEffect(() => {
            const firstValue = !Array.isArray(value) ? value : value[0];
            const defaultRecord = !value
                ? dataList[0]
                : dataList.find(
                      item =>
                          item.integrationId === firstValue?.integration_id ||
                          item.devices.find(it => it.id === firstValue?.id),
                  );

            setTargetRecord(record => {
                if (record) return record;
                return defaultRecord;
            });
        }, [value, dataList]);

        return (
            <div ref={ref} className={cls('ms-device-select-listbox', className)} {...props}>
                <div
                    className={cls('data-list-search', {
                        'd-block': !isUndefined(searchDevices),
                    })}
                >
                    {searchDevices?.map(item => {
                        const title = `${item.integration_name} / ${item.name}`;
                        return (
                            <div
                                className="search-item"
                                key={`${item.integration_id}_${item.id}`}
                                onClick={() => handleSelect(item)}
                            >
                                <Tooltip autoEllipsis title={title} />
                            </div>
                        );
                    })}
                    {!searchDevices?.length && (
                        <div className="ms-device-select__empty">
                            {getIntlText('common.label.no_options')}
                        </div>
                    )}
                </div>
                <div
                    className={cls('data-list-normal', {
                        empty: !dataList?.length,
                        'd-none': !isUndefined(searchDevices),
                    })}
                >
                    {!dataList.length && (
                        <div className="ms-device-select__empty">
                            {getIntlText('common.label.no_options')}
                        </div>
                    )}
                    <div className="inte-list">
                        {dataList.map(item => (
                            <div
                                key={item.integrationId}
                                className={cls('inte-item', {
                                    active: item.integrationId === targetRecord?.integrationId,
                                })}
                                onMouseEnter={() => handleMouseEnter(item)}
                            >
                                <Tooltip autoEllipsis title={item.integrationName} />
                                <ArrowForwardIosIcon />
                            </div>
                        ))}
                    </div>
                    <div className="device-list">
                        {targetRecord?.devices.map(item => {
                            const values = !value ? [] : Array.isArray(value) ? value : [value];
                            const selected = !!values.find(v => v.id === item.id);

                            return (
                                <div
                                    key={item.id}
                                    className={cls('device-item', { active: selected })}
                                    onClick={() => handleSelect(item)}
                                >
                                    <Tooltip autoEllipsis title={item.name} />
                                    {selected && <CheckIcon />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    },
);

export default List;
