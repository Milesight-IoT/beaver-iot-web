import { memo, useState } from 'react';
import { IconButton, Popover } from '@mui/material';
import { useI18n, useCopy } from '@milesight/shared/src/hooks';
import { MoreHorizIcon, ContentCopyIcon } from '@milesight/shared/src/components';
import { Tooltip } from '@/components';
import useFlowStore from '../../../../store';
import './style.less';

const MoreMenu = () => {
    const { getIntlText } = useI18n();
    const { handleCopy } = useCopy();
    const selectedNode = useFlowStore(state => state.selectedNode);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    return (
        <div className="ms-config-panel-more-menu">
            <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
                <MoreHorizIcon fontSize="inherit" />
            </IconButton>
            <Popover
                className="ms-config-panel-more-menu-popover"
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(null);
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <div className="node-info-root">
                    <div className="node-info-item">
                        <div className="node-info-item-title">
                            {getIntlText('workflow.label.node_id')}
                        </div>
                        <div className="node-info-item-content">
                            <Tooltip autoEllipsis title={selectedNode?.id} />
                            <Tooltip title={getIntlText('common.label.copy')}>
                                <IconButton
                                    onClick={e => {
                                        handleCopy(
                                            selectedNode?.id || '',
                                            (e.target as HTMLElement).closest('div'),
                                        );
                                    }}
                                >
                                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </Popover>
        </div>
    );
};

export default memo(MoreMenu);
