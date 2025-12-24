import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import cls from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { useInterval } from 'ahooks';
import { List } from '@mui/material';

import { useI18n, useTheme, useTime, useMediaQuery } from '@milesight/shared/src/hooks';
import { LoadingWrapper } from '@milesight/shared/src/components';

import { Empty } from '@/components';
import { PERMISSIONS } from '@/constants';
import PermissionControlDisabled from '../permission-control-disabled';
import { Widgets, PluginList, OperateWidgetModal } from './components';
import { useDrawingBoardData } from './hooks';
import { DrawingBoardContext } from './context';
import type { DrawingBoardExpose, DrawingBoardProps } from './interface';

import './style.less';

/**
 *  Drawing board for data visualization and exploration
 */
const DrawingBoard = forwardRef<DrawingBoardExpose, DrawingBoardProps>((props, ref) => {
    const {
        drawingBoardDetail,
        isEdit,
        drawingBoardRef,
        isFullscreen,
        operatingPlugin,
        changeIsEdit,
        updateOperatingPlugin,
        exitFullscreen,
        disabledEdit,
        deviceDetail,
    } = props;

    const { getIntlText } = useI18n();
    const { breakpoints } = useTheme();
    const smallScreenSize = useMediaQuery(breakpoints.down('xl'));

    const {
        widgets,
        loadingWidgets,
        drawingBoardContext,
        updateWidgets,
        handleWidgetChange,
        handleCancel,
        handleSave,
        handleCloseModel,
    } = useDrawingBoardData(props);

    /** Expose methods to parent component */
    useImperativeHandle(ref, () => {
        return {
            handleCancel,
            handleSave,
        };
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

    /**
     * Empty data displays plugin list selection
     */
    const renderEmptyDrawingBoard = () => {
        if (smallScreenSize) {
            return <Empty text={getIntlText('dashboard.tip.small_screen_empty')} />;
        }

        return (
            <PermissionControlDisabled permissions={editPermissions}>
                <div
                    className={cls('drawing-board__empty', {
                        disabled: disabledEdit,
                    })}
                >
                    <div className="drawing-board__empty-title">
                        {getIntlText('dashboard.empty_text')}
                    </div>
                    <div className="drawing-board__empty-description">
                        {getIntlText('dashboard.empty_description')}
                    </div>
                    <PluginList onSelect={updateOperatingPlugin} changeIsEditMode={changeIsEdit} />
                </div>
            </PermissionControlDisabled>
        );
    };

    const renderDrawingBoard = () => {
        if (!Array.isArray(widgets) || isEmpty(widgets)) {
            return renderEmptyDrawingBoard();
        }

        return (
            <Widgets
                widgets={widgets}
                onChangeWidgets={updateWidgets}
                isEdit={isEdit}
                onEdit={updateOperatingPlugin}
                mainRef={drawingBoardRef}
                dashboardId={drawingBoardDetail.id}
            />
        );
    };

    // ========== Interval update dateTime ==========
    const { getTimeFormat } = useTime();
    const [dateTime, setDateTime] = useState(getTimeFormat());

    useInterval(() => {
        setDateTime(getTimeFormat());
    }, 5000);

    if (loadingWidgets) {
        return (
            <LoadingWrapper loading>
                <List sx={{ height: '300px' }} />
            </LoadingWrapper>
        );
    }
    return (
        <DrawingBoardContext.Provider value={drawingBoardContext}>
            <div className="drawing-board">
                {!!drawingBoardDetail.attributes?.show_extra && (
                    <div className="drawing-board__header">
                        <span className="title">{drawingBoardDetail.name}</span>
                        <span className="date">{dateTime}</span>
                    </div>
                )}

                <div ref={drawingBoardRef} className="drawing-board__wrapper ms-perfect-scrollbar">
                    <div
                        className={cls('drawing-board__container', {
                            'remove-max-width': !isNil(drawingBoardDetail?.attributes?.fullscreen),
                        })}
                    >
                        {renderDrawingBoard()}
                    </div>
                </div>

                {!!operatingPlugin && (
                    <OperateWidgetModal
                        widgets={widgets}
                        plugin={operatingPlugin}
                        handleWidgetChange={handleWidgetChange}
                        onCancel={handleCloseModel}
                    />
                )}
            </div>
        </DrawingBoardContext.Provider>
    );
});

export default DrawingBoard;
