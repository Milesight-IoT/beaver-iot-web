import { useLayoutEffect, useState, useRef, useCallback, useMemo } from 'react';
import cls from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { useControllableValue, useSize } from 'ahooks';
import {
    TextField,
    IconButton,
    Chip,
    Popover,
    Divider,
    Menu,
    MenuItem,
    InputAdornment,
    type TextFieldProps,
    type PopoverProps,
} from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { SettingsOutlinedIcon, KeyboardArrowDownIcon } from '@milesight/shared/src/components';
import { Tooltip, EntitySelect, type EntitySelectProps } from '@/components';
import { type FlattenNodeParamType } from '@/pages/workflow/views/editor/typings';
import useWorkflow from '@/pages/workflow/views/editor/hooks/useWorkflow';
import { isRefParamKey } from '@/pages/workflow/views/editor/helper';
import UpstreamNodeList, { type UpstreamNodeListProps } from '../upstream-node-list';
import './style.less';

type EntityParamSelectValueType = ApiKey;

export type EntityFilterParams = {
    /** Search Keyword */
    keyword?: string;
    /** Entity Type */
    type?: EntityType | EntityType[];
    /** Entity Value Type */
    valueType?: EntityValueDataType | EntityValueDataType[];
    /** Entity Access Mode */
    accessMode?: EntityAccessMode | EntityAccessMode[];
    /** Exclude Children */
    excludeChildren?: boolean;
};

export interface EntityParamSelectProps
    extends Omit<EntitySelectProps<EntityParamSelectValueType, false, false>, 'onChange'> {
    filter?: UpstreamNodeListProps['filter'];

    /**
     * API Filter Model
     */
    filterModel?: Omit<EntityFilterParams, 'keyword'>;

    value?: EntityParamSelectValueType;

    defaultValue?: EntityParamSelectValueType;

    onChange?: (value: EntityParamSelectValueType | null) => void;
}

/**
 * Entity Param Select Component
 *
 * Note: Use in EntityAssignmentNode
 */
const EntityParamSelect: React.FC<EntityParamSelectProps> = ({
    size,
    filter,
    fieldName = 'entityKey',
    filterModel,
    ...props
}) => {
    const { getIntlText } = useI18n();

    // ---------- Render Upstream Param Options ----------
    const { getUpstreamNodeParams } = useWorkflow();
    const [, options] = getUpstreamNodeParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const { width: containerWidth } = useSize(containerRef) || {};
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const commonPopoverProps = useMemo<
        Pick<PopoverProps, 'anchorOrigin' | 'transformOrigin' | 'sx'>
    >(
        () => ({
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            sx: {
                '& .MuiList-root': {
                    width: containerWidth,
                    minWidth: 300,
                    maxHeight: 420,
                },
            },
        }),
        [containerWidth],
    );

    // ---------- Render EntitySelect ----------
    const [entityPopupOpen, setEntityPopupOpen] = useState(false);
    const endAdornment = useMemo(
        () => (
            <InputAdornment position="end" className="ms-entity-param-select-param-trigger">
                <IconButton
                    onClick={e => {
                        e.stopPropagation();
                        setAnchorEl(containerRef.current);
                    }}
                >
                    <SettingsOutlinedIcon sx={{ fontSize: '16px' }} />
                </IconButton>
            </InputAdornment>
        ),
        [],
    );
    const inputBlur = useCallback(() => {
        setTimeout(() => {
            containerRef.current?.querySelector('input')?.blur();
        }, 0);
    }, []);

    const filterModelValue = useMemo(() => {
        const { type, valueType, accessMode, excludeChildren } = filterModel || {};

        const filterType = type && (Array.isArray(type) ? type : [type]);
        const filterValueType = valueType && (Array.isArray(valueType) ? valueType : [valueType]);
        const filterAccessMode =
            accessMode && (Array.isArray(accessMode) ? accessMode : [accessMode]);

        return {
            entityType: filterType,
            entityValueType: filterValueType,
            entityAccessMod: filterAccessMode,
            excludeChildren,
        };
    }, [filterModel]);

    // ---------- Data Interaction ----------
    const [data, setData] = useControllableValue<EntityParamSelectValueType | undefined>(props);
    const [entityValue, setEntityValue] = useState<EntityParamSelectValueType>();
    const [paramValue, setParamValue] = useState<FlattenNodeParamType>();

    useLayoutEffect(() => {
        // entity value
        if (!isRefParamKey(`${data}`)) {
            setEntityValue(data);
            return;
        }

        // An param from upstream node params
        setParamValue(val => {
            if (val && val.valueKey === data) {
                return val;
            }
            return options?.find(item => item.valueKey === data);
        });
    }, [data, options]);

    return (
        <div ref={containerRef} className="ms-entity-param-select">
            <EntitySelect
                label={getIntlText('common.label.entity')}
                {...props}
                {...filterModelValue}
                size={size}
                fieldName={fieldName}
                className={cls({
                    'hide-cursor': !!paramValue && !entityPopupOpen,
                })}
                endAdornment={endAdornment}
                popupIcon={<KeyboardArrowDownIcon />}
                value={entityValue}
                onOpen={() => setEntityPopupOpen(true)}
                onClose={() => setEntityPopupOpen(false)}
                onChange={option => {
                    setParamValue(undefined);
                    setEntityValue(option?.value);
                    setData(option?.value);
                }}
            />
            {!!paramValue && !entityPopupOpen && (
                <Chip
                    className="ms-entity-param-select-chip"
                    label={
                        <Tooltip title={`${paramValue.valueName} / ${paramValue.valueTypeLabel}`}>
                            <span className="name">{paramValue.valueName}</span>
                        </Tooltip>
                    }
                    onDelete={() => {
                        setParamValue(undefined);
                        setData(undefined);
                    }}
                />
            )}
            <Popover
                className="ms-entity-param-select-menu"
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(null);
                    inputBlur();
                }}
                {...commonPopoverProps}
            >
                <UpstreamNodeList
                    filter={filter || (data => data.valueType === 'STRING')}
                    value={paramValue}
                    onChange={node => {
                        setAnchorEl(null);
                        setParamValue(node);
                        setEntityValue(undefined);
                        setData(node.valueKey);

                        inputBlur();
                    }}
                />
            </Popover>
        </div>
    );
};

export default EntityParamSelect;
