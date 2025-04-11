import { Grid2, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ChevronRightIcon, toast } from '@milesight/shared/src/components';
import { useConfirm, Tooltip } from '@/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { InteEntityType, useEntity } from '../../../hooks';

import './style.less';

interface Props {
    /** Entity list */
    entities?: InteEntityType[];
    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

// sync codec key
const SYNC_CODEC_KEY = 'sync-device-codec';

/**
 * gateway services component
 */
const Service: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const { getEntityKey } = useEntity({ entities });

    // ---------- card Click on Related Processing logic ----------
    const confirm = useConfirm();
    const handleConfirm = () => {
        confirm({
            title: getIntlText('common.label.tip'),
            description: getIntlText('common.confirm.execute'),
            type: 'info',
            async onConfirm() {
                const entityKey = getEntityKey(SYNC_CODEC_KEY);
                if (!entityKey) {
                    console.warn('Entity key is not found');
                    return;
                }
                const [error, resp] = await awaitWrap(
                    entityAPI.callService({ exchange: { [entityKey]: null } }),
                );

                if (error || !isRequestSuccess(resp)) {
                    return;
                }
                onUpdateSuccess?.();
                toast.success({ content: getIntlText('common.message.operation_success') });
            },
        });
    };

    return (
        <div className="ms-ns-service">
            <Grid2 container spacing={2}>
                <Grid2 size={{ sm: 6, md: 4, xl: 3 }}>
                    <div className="ms-ns-service-card" onClick={handleConfirm}>
                        <div className="header">
                            <Tooltip
                                autoEllipsis
                                className="title"
                                title={getIntlText('setting.integration.device.update_codec')}
                            />
                            <IconButton sx={{ width: 24, height: 24 }}>
                                <ChevronRightIcon />
                            </IconButton>
                        </div>
                        <div className="desc">
                            <Tooltip
                                autoEllipsis
                                className="title"
                                title={getIntlText('setting.integration.device.update_codec_desc')}
                            />
                        </div>
                    </div>
                </Grid2>
            </Grid2>
        </div>
    );
};

export default Service;
