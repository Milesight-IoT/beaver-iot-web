import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isEqual } from 'lodash-es';
import { Button, IconButton, Grid2, Switch, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ArrowBackIcon, EditIcon } from '@milesight/shared/src/components';
import { WorkflowAPISchema } from '@/services/http';
import { Tooltip } from '@/components';
import { EditModal, type EditModalProps } from '@/pages/workflow/components';
import { type DesignMode } from '../../typings';
import './style.less';

export interface TopbarProps {
    /* Is Data Loading */
    loading?: boolean;

    /** Is Buttons Disabled */
    disabled?: boolean;

    /** Workflow Detail Data */
    data?: Partial<Omit<WorkflowAPISchema['getFlowDesign']['response'], 'design_data'>>;

    /** Default Workflow Design Mode */
    mode?: DesignMode;

    /** Right Slot */
    rightSlot?: React.ReactNode;

    /** Design Mode Change Callback */
    onDesignModeChange: (mode: DesignMode) => void;

    /** Data Change Callback */
    onDataChange?: (data: TopbarProps['data'], reason?: 'manual') => void;

    /** This handler gets called before the user click 「Back」 Button */
    onBeforeBack?: () => void | Promise<void>;

    /** Button Click Callback */
    // onButtonClick?: (type: 'back' | 'save', data?: TopbarProps['data']) => void;
}

/**
 * Workflow Editor Topbar
 */
const Topbar: React.FC<TopbarProps> = ({
    data,
    loading,
    disabled,
    mode = 'canvas',
    rightSlot,
    onDataChange,
    onDesignModeChange,
    onBeforeBack,
}) => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    // ---------- Workflow Name/Remark/Status Edit ----------
    const [flowData, setFlowData] = useState<TopbarProps['data']>();
    const [openEditModal, setOpenEditModal] = useState(false);

    const handleEditConfirm: EditModalProps['onConfirm'] = async params => {
        setOpenEditModal(false);
        setFlowData(data => {
            const result = { ...data, ...params };

            onDataChange?.(result, 'manual');
            return result;
        });
    };

    const handleSwitchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setFlowData(data => {
            const result = { ...data, enabled: checked };

            onDataChange?.(result, 'manual');
            return result;
        });
    };

    const handleBack = async () => {
        if (onBeforeBack) {
            await onBeforeBack();
        }

        navigate('/workflow', { replace: true });
    };

    useEffect(() => {
        if (data?.id) {
            setFlowData(data);
            return;
        }

        const result = {
            name: `${getIntlText('common.label.workflow')}${Date.now()}`,
            enabled: true,
            ...data,
        };

        if (isEqual(data, result)) return;

        setFlowData(result);
        onDataChange?.(result);
    }, [data, getIntlText, onDataChange]);

    return (
        <div className="ms-workflow-topbar">
            <Grid2 container wrap="nowrap" spacing={1}>
                <Grid2 className="ms-workflow-topbar-left" size={4}>
                    <Button
                        variant="outlined"
                        // className="btn-back"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => handleBack()}
                    >
                        {getIntlText('common.label.back')}
                    </Button>
                    {(flowData?.name || loading === false) && (
                        <div className="title md:d-none">
                            <Tooltip autoEllipsis title={flowData?.name} />
                            <IconButton
                                disabled={disabled || loading}
                                onClick={() => setOpenEditModal(true)}
                            >
                                <EditIcon />
                            </IconButton>
                        </div>
                    )}
                </Grid2>
                <Grid2 className="ms-workflow-topbar-center md:d-none" size={4}>
                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        className="ms-toggle-button-group ms-workflow-mode-buttons"
                        disabled={disabled || loading}
                        value={mode}
                        onChange={(_, value) => {
                            if (!value) return;
                            onDesignModeChange(value as DesignMode);
                        }}
                    >
                        <ToggleButton
                            aria-label={getIntlText('workflow.label.design_mode_canvas_name')}
                            value="canvas"
                        >
                            {getIntlText('workflow.label.design_mode_canvas_name')}
                        </ToggleButton>
                        <ToggleButton
                            aria-label={getIntlText('workflow.label.design_mode_advanced_name')}
                            value="advanced"
                        >
                            {getIntlText('workflow.label.design_mode_advanced_name')}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid2>
                <Grid2 className="ms-workflow-topbar-right md:d-none" size={4}>
                    <Switch
                        disabled={disabled || loading}
                        checked={!!flowData?.enabled}
                        onChange={handleSwitchChange}
                    />
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

export default React.memo(Topbar);
