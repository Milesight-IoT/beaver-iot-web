import { useState, useRef, useMemo } from 'react';
import { useMemoizedFn, useFullscreen } from 'ahooks';
import { Stack, Button, Divider } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { FullscreenIcon, EditIcon, CloseIcon, CheckIcon } from '@milesight/shared/src/components';
import PermissionControlHidden from '@/components/permission-control-hidden';
import { PERMISSIONS } from '@/constants';
import { type WidgetDetail } from '@/services/http/dashboard';
import PluginListPopover from '../components/plugin-list-popover';
import { type DrawingBoardExpose } from '../interface';

export interface UseDrawingBoardProps {
    onSave?: (widgets?: WidgetDetail[]) => void;
}

/**
 * Drawing board operation
 */
export function useDrawingBoard(props?: UseDrawingBoardProps) {
    const { onSave } = props || {};

    const { getIntlText } = useI18n();

    const drawingBoardExposeRef = useRef<DrawingBoardExpose>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [operatingPlugin, setOperatingPlugin] = useState<WidgetDetail>();

    const drawingBoardRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, { enterFullscreen }] = useFullscreen(drawingBoardRef);

    const changeIsEdit = useMemoizedFn((isEditing: boolean) => {
        setIsEdit(Boolean(isEditing));
    });

    const updateOperatingPlugin = useMemoizedFn((plugin?: WidgetDetail) => {
        setOperatingPlugin(plugin);
    });

    const renderNormalMode = (
        <Stack direction="row" spacing={2}>
            <div onClick={enterFullscreen} className="dashboard-button-icon">
                <FullscreenIcon />
            </div>
            <PermissionControlHidden permissions={PERMISSIONS.DASHBOARD_EDIT}>
                <Button
                    variant="contained"
                    className="md:d-none"
                    disabled={false}
                    startIcon={<EditIcon />}
                    onClick={() => setIsEdit(true)}
                >
                    {getIntlText('common.button.edit')}
                </Button>
            </PermissionControlHidden>
        </Stack>
    );

    const handleCancel = useMemoizedFn(() => {
        setIsEdit(false);
        drawingBoardExposeRef?.current?.handleCancel();
    });

    const handleSave = useMemoizedFn(() => {
        setIsEdit(false);
        const newestWidgets = drawingBoardExposeRef?.current?.handleSave();
        console.log('handleSave ? ', newestWidgets);

        onSave?.(newestWidgets);
    });

    const renderEditMode = (
        <Stack direction="row" spacing={2}>
            <PluginListPopover onSelect={updateOperatingPlugin} />
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
