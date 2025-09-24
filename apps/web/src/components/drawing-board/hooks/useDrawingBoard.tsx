import { useState, useRef, useMemo } from 'react';
import { useMemoizedFn, useFullscreen } from 'ahooks';
import { Stack, Button, Divider, IconButton } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    FullscreenIcon,
    EditIcon,
    CloseIcon,
    CheckIcon,
    toast,
} from '@milesight/shared/src/components';

import { PermissionControlHidden, TooltipWrapper } from '@/components';
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
import { filterWidgets } from '../utils';

export interface UseDrawingBoardProps {
    disabledEditTip?: string;
    disabledEdit?: boolean;
    deviceDetail?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;
    onSave?: (widgets?: WidgetDetail[]) => void;
}

export type DrawingBoardPropsType = {
    ref: React.RefObject<DrawingBoardExpose>;
    operatingPlugin: WidgetDetail | undefined;
    isEdit: boolean;
    isFullscreen: boolean;
    changeIsEdit: (isEditing: boolean) => void;
    updateOperatingPlugin: (plugin?: WidgetDetail) => void;
    drawingBoardRef: React.RefObject<HTMLDivElement>;
};

/**
 * Drawing board operation
 */
export default function useDrawingBoard(props?: UseDrawingBoardProps) {
    const { disabledEdit, disabledEditTip, deviceDetail, onSave } = props || {};

    const { getIntlText } = useI18n();

    const drawingBoardExposeRef = useRef<DrawingBoardExpose>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [operatingPlugin, setOperatingPlugin] = useState<WidgetDetail>();

    const drawingBoardRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, { enterFullscreen }] = useFullscreen(drawingBoardRef);
    const { getCurrentEntityIds } = useActivityEntity();

    const changeIsEdit = useMemoizedFn((isEditing: boolean) => {
        setIsEdit(Boolean(isEditing));
    });

    const updateOperatingPlugin = useMemoizedFn((plugin?: WidgetDetail) => {
        setOperatingPlugin(plugin);
    });

    const renderNormalMode = (
        <Stack className="xl:d-none" direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <IconButton
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
            <PermissionControlHidden permissions={PERMISSIONS.DASHBOARD_EDIT}>
                <TooltipWrapper placement="left" title={disabledEdit ? disabledEditTip : null}>
                    <Button
                        disabled={disabledEdit}
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEdit(true)}
                    >
                        {getIntlText('common.button.edit')}
                    </Button>
                </TooltipWrapper>
            </PermissionControlHidden>
        </Stack>
    );

    const handleCancel = useMemoizedFn(() => {
        setIsEdit(false);
        drawingBoardExposeRef?.current?.handleCancel();
    });

    const handleSave = useMemoizedFn(async () => {
        setIsEdit(false);

        const data = drawingBoardExposeRef?.current?.handleSave();
        const { id, name, widgets } = data || {};
        if (!id || !widgets) {
            return;
        }

        const currentEntityIds = getCurrentEntityIds(id);
        const [error, resp] = await awaitWrap(
            dashboardAPI.updateDrawingBoard({
                canvas_id: id,
                widgets: filterWidgets(widgets),
                entity_ids: currentEntityIds,
                name,
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        /** Execute hook callback */
        onSave?.(widgets);
        toast.success(getIntlText('common.message.operation_success'));
    });

    const renderEditMode = (
        <Stack className="xl:d-none" direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <PluginListPopover deviceDetail={deviceDetail} onSelect={updateOperatingPlugin} />
            <Divider orientation="vertical" variant="middle" flexItem />
            <Button variant="outlined" onClick={handleCancel} startIcon={<CloseIcon />}>
                {getIntlText('common.button.cancel')}
            </Button>
            <Button variant="contained" onClick={handleSave} startIcon={<CheckIcon />}>
                {getIntlText('common.button.save')}
            </Button>
        </Stack>
    );

    const renderDrawingBoardOperation = () => {
        if (isEdit) {
            return renderEditMode;
        }

        return renderNormalMode;
    };

    const drawingBoardProps = useMemo(() => {
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
        };
    }, [operatingPlugin, isEdit, isFullscreen, changeIsEdit, updateOperatingPlugin]);

    return {
        /**
         * Component props that must be transferred
         * when using the drawing board component
         */
        drawingBoardProps,
        renderDrawingBoardOperation,
    };
}
