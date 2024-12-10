import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type AxiosError } from 'axios';
import { Button, IconButton, Grid2, Switch, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ArrowBackIcon, EditIcon, toast } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import { workflowAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { EditModal, type EditModalProps } from '@/pages/workflow/components';
import './style.less';

/**
 * Workflow Design Mode
 */
export type DesignMode = 'canvas' | 'advanced';

interface Props {
    /** Workflow Detail Data */
    data?: {
        id: ApiKey;
        name: string;
        remark?: string;
        enabled?: boolean;
    };

    /** Default Workflow Design Mode */
    mode?: DesignMode;

    /** Right Slot */
    rightSlot?: React.ReactNode;

    /** Edit Error Callback */
    onEditError?: (error: AxiosError | null) => void;

    /** Edit Success Callback */
    onEditSuccess?: () => void;

    /** Design Mode Change Callback */
    onDesignModeChange: (mode: DesignMode) => void;
}

/**
 * Workflow 头部工具栏组件
 */
const Topbar: React.FC<Props> = ({
    data,
    mode = 'canvas',
    rightSlot,
    onEditError,
    onEditSuccess,
    onDesignModeChange,
}) => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- Workflow Name/Remark/Status Edit ----------
    const [flowData, setFlowData] = useState<Props['data']>();
    const [openEditModal, setOpenEditModal] = useState(false);

    const handleEditConfirm: EditModalProps['onConfirm'] = async params => {
        console.log({ params });
        if (!flowData?.id) return;
        // const [error, resp] = await awaitWrap(
        //     workflowAPI.updateFlow({ id: flowData.id, ...params }),
        // );

        // if (error || !isRequestSuccess(resp)) {
        //     onEditError?.(error);
        //     return;
        // }
        // TODO: Replace with real data
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });

        setOpenEditModal(false);
        setFlowData(data => ({ ...data!, ...params }));
        toast.success(getIntlText('common.message.operation_success'));
    };

    const handleSwitchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!flowData?.id) return;
        const { checked } = e.target;

        // const [error, resp] = await awaitWrap(
        //     workflowAPI.enableFlow({ id: flowData.id, status: checked ? 'enabled' : 'disabled' }),
        // );

        // if (error || !isRequestSuccess(resp)) {
        //     onEditError?.(error);
        //     return;
        // }
        // TODO: Replace with real data
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });

        setFlowData(data => ({ ...data!, enabled: checked }));
        toast.success(getIntlText('common.message.operation_success'));
    };

    useEffect(() => setFlowData(data), [data]);

    return (
        <div className="ms-workflow-topbar">
            <Grid2 container wrap="nowrap" spacing={1}>
                <Grid2 className="ms-workflow-topbar-left" size={4}>
                    <Button
                        variant="outlined"
                        className="btn-back"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/workflow', { replace: true })}
                    >
                        {getIntlText('common.label.back')}
                    </Button>
                    <div className="title">
                        <Tooltip title="Workflow Name" />
                        <IconButton onClick={() => setOpenEditModal(true)}>
                            <EditIcon />
                        </IconButton>
                    </div>
                </Grid2>
                <Grid2 className="ms-workflow-topbar-center" size={4}>
                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        className="ms-workflow-mode-buttons"
                        value={mode}
                        onChange={(_, value) => {
                            if (!value) return;
                            onDesignModeChange(value as DesignMode);
                        }}
                    >
                        <ToggleButton
                            disableRipple
                            aria-label={getIntlText('workflow.label.design_mode_canvas_name')}
                            value="canvas"
                        >
                            {getIntlText('workflow.label.design_mode_canvas_name')}
                        </ToggleButton>
                        <ToggleButton
                            disableRipple
                            aria-label={getIntlText('workflow.label.design_mode_advanced_name')}
                            value="advanced"
                        >
                            {getIntlText('workflow.label.design_mode_advanced_name')}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid2>
                <Grid2 className="ms-workflow-topbar-right" size={4}>
                    <Switch checked={!!flowData?.enabled} onChange={handleSwitchChange} />
                    {rightSlot}
                </Grid2>
            </Grid2>
            <EditModal
                data={flowData}
                visible={openEditModal}
                onCancel={() => setOpenEditModal(false)}
                onConfirm={handleEditConfirm}
            />
        </div>
    );
};

export default Topbar;
