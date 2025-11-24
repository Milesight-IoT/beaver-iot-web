import { useState, useRef, useMemo, useEffect } from 'react';
import { useMemoizedFn, useFullscreen } from 'ahooks';
import { Stack, Button, Divider, IconButton } from '@mui/material';

import { useI18n, useStoreShallow, usePreventLeave } from '@milesight/shared/src/hooks';
import {
    FullscreenIcon,
    EditIcon,
    CloseIcon,
    CheckIcon,
    toast,
    LoadingButton,
} from '@milesight/shared/src/components';

import { PermissionControlHidden, Tooltip, useConfirm } from '@/components';
import { PERMISSIONS } from '@/constants';
import {
    type DeviceAPISchema,
    type WidgetDetail,
    dashboardAPI,
    awaitWrap,
    isRequestSuccess,
} from '@/services/http';
import PluginListPopover from '../components/plugin-list-popover';
import { useActivityEntity } from '../plugin/hooks';
import { type DrawingBoardExpose } from '../interface';
import { filterWidgets, getDeviceIdsInuse } from '../utils';
import useDrawingBoardStore from '../store';

export interface UseDrawingBoardProps {
    disabled?: boolean;
    disabledEditTip?: string;
    disabledEdit?: boolean;
    deviceDetail?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;
    onSave?: (widgets?: WidgetDetail[]) => void;
}

export type DrawingBoardPropsType = {
    ref: React.RefObject<DrawingBoardExpose>;
    /** The widget plugin currently being added or edited */
    operatingPlugin: WidgetDetail | undefined;
    /** Is drawing board in edit mode */
    isEdit: boolean;
    isFullscreen: boolean;
    /** Change drawing board edit mode */
    changeIsEdit: (isEditing: boolean) => void;
    updateOperatingPlugin: (plugin?: WidgetDetail) => void;
    /** Drawing board html div node */
    drawingBoardRef: React.RefObject<HTMLDivElement>;
    /** Exit body fullscreen */
    exitFullscreen: () => void;
};

/**
 * Drawing board operation
 */
export default function useDrawingBoard(props?: UseDrawingBoardProps) {
    const { disabled, disabledEdit, disabledEditTip, deviceDetail, onSave } = props || {};

    const { getIntlText } = useI18n();
    const { setDrawingBoardFullscreen } = useDrawingBoardStore(
        useStoreShallow('setDrawingBoardFullscreen'),
    );

    const drawingBoardExposeRef = useRef<DrawingBoardExpose>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [operatingPlugin, setOperatingPlugin] = useState<WidgetDetail>();
    const [loading, setLoading] = useState(false);

    const drawingBoardRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, { enterFullscreen, exitFullscreen }] = useFullscreen(document.body);
    const { getRecordEntityIds } = useActivityEntity();
    const confirm = useConfirm();
    const { showPrevent } = usePreventLeave({
        isPreventLeave: isEdit,
        confirm,
    });

    useEffect(() => {
        setDrawingBoardFullscreen(isFullscreen);
    }, [setDrawingBoardFullscreen, isFullscreen]);

    const changeIsEdit = useMemoizedFn((isEditing: boolean) => {
        setIsEdit(Boolean(isEditing));
    });

    const updateOperatingPlugin = useMemoizedFn((plugin?: WidgetDetail) => {
        setOperatingPlugin(plugin);
    });

    /**
     * Get dashboard drawing board edit permissions
     */
    const editPermissions = useMemo(() => {
        if (deviceDetail?.id) {
            return [PERMISSIONS.DEVICE_EDIT];
        }

        return PERMISSIONS.DASHBOARD_EDIT;
    }, [deviceDetail]);

    const renderNormalMode = (
        <Stack className="xl:d-none" direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <IconButton
                disabled={disabled}
                onClick={enterFullscreen}
                sx={{
                    borderRadius: '6px',
                    border: '1px solid var(--gray-3)',
                    '&:hover': {
                        borderColor: 'var(--primary-color-base)',
                    },
                }}
            >
                <FullscreenIcon />
            </IconButton>
            <PermissionControlHidden permissions={editPermissions}>
                <Tooltip
                    isDisabledButton={disabled || disabledEdit}
                    placement="left"
                    title={disabledEdit ? disabledEditTip : null}
                    sx={{
                        cursor: disabled || disabledEdit ? 'not-allowed' : undefined,
                    }}
                >
                    <Button
                        disabled={disabled || disabledEdit}
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEdit(true)}
                    >
                        {getIntlText('common.button.edit')}
                    </Button>
                </Tooltip>
            </PermissionControlHidden>
        </Stack>
    );

    const handleCancel = useMemoizedFn(() => {
        setIsEdit(false);
        drawingBoardExposeRef?.current?.handleCancel();
    });

    const handleSave = useMemoizedFn(async () => {
        try {
            setLoading(true);

            const data = drawingBoardExposeRef?.current?.handleSave();
            const { id, name, widgets } = data || {};
            if (!id || !widgets) {
                return;
            }

            const recordEntityIds = getRecordEntityIds(id);
            const [error, resp] = await awaitWrap(
                dashboardAPI.updateDrawingBoard({
                    canvas_id: id,
                    widgets: filterWidgets(widgets),
                    entity_ids: recordEntityIds,
                    device_ids: getDeviceIdsInuse(widgets),
                    name,
                }),
            );
            if (error || !isRequestSuccess(resp)) {
                return;
            }

            /** Execute hook callback */
            onSave?.(widgets);
            toast.success(getIntlText('common.message.operation_success'));
        } finally {
            setLoading(false);
            /**
             * Exit edit mode
             */
            setIsEdit(false);
        }
    });

    const renderEditMode = (
        <Stack className="xl:d-none" direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <PluginListPopover
                disabled={loading}
                deviceDetail={deviceDetail}
                onSelect={updateOperatingPlugin}
            />
            <Divider orientation="vertical" variant="middle" flexItem />
            <Button
                disabled={loading}
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CloseIcon />}
            >
                {getIntlText('common.button.cancel')}
            </Button>
            <LoadingButton
                loading={loading}
                variant="contained"
                onClick={handleSave}
                startIcon={<CheckIcon />}
            >
                {getIntlText('common.button.save')}
            </LoadingButton>
        </Stack>
    );

    const renderDrawingBoardOperation = () => {
        if (isEdit) {
            return renderEditMode;
        }

        return renderNormalMode;
    };

    const drawingBoardProps = useMemo((): DrawingBoardPropsType => {
        return {
            ref: drawingBoardExposeRef,
            /** The widget plugin currently being added or edited */
            operatingPlugin,
            /** Is drawing board in edit mode */
            isEdit,
            isFullscreen,
            /** Change drawing board edit mode */
            changeIsEdit,
            updateOperatingPlugin,
            /** Drawing board html div node */
            drawingBoardRef,
            /** Exit body fullscreen */
            exitFullscreen,
        };
    }, [
        operatingPlugin,
        isEdit,
        isFullscreen,
        changeIsEdit,
        updateOperatingPlugin,
        exitFullscreen,
    ]);

    return {
        /**
         * Component props that must be transferred
         * when using the drawing board component
         */
        drawingBoardProps,
        renderDrawingBoardOperation,
        showPrevent,
    };
}
