import { Alert, IconButton, Grid2 } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ChevronRightIcon, toast } from '@milesight/shared/src/components';
import { entityAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { useConfirm, Tooltip } from '@/components';
import { useEntity, type InteEntityType } from '../../../hooks';
import './style.less';

// interface FormDataProps {
//     startTime?: number;
//     endTime?: number;
// }

interface Props {
    /** Entity list */
    entities?: InteEntityType[];

    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

// Synchronize device information with historical data entity keyword
const SYNC_DEVICE_KEY = 'sync_device';

const Functions: React.FC<Props> = ({ entities, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();

    // ---------- Check the logic of the pop-up ----------
    const { getEntityKey } = useEntity({ entities });
    const confirm = useConfirm();
    // const [modalOpen, setModalOpen] = useState(false);
    const handleConfirm = () => {
        confirm({
            title: getIntlText('setting.integration.function_data_sync_confirm_title'),
            description: getIntlText('setting.integration.function_data_sync_confirm_helper_text'),
            async onConfirm() {
                const entityKey = getEntityKey(SYNC_DEVICE_KEY);

                if (!entityKey) {
                    console.warn('Entity key is not found');
                    return;
                }
                const [error, resp] = await awaitWrap(
                    entityAPI.callService({ exchange: { [entityKey]: null } }),
                );

                if (error || !isRequestSuccess(resp)) return;

                onUpdateSuccess?.();
                toast.success({ content: getIntlText('common.message.operation_success') });
            },
        });
    };

    return (
        <div className="ms-int-functions">
            <Alert severity="warning" sx={{ mb: 2.5 }}>
                {getIntlText('setting.integration.available_function_warning_text')}
            </Alert>
            <Grid2 container spacing={2}>
                <Grid2 size={{ sm: 6, md: 4, xl: 3 }}>
                    <div className="ms-int-feat-card" onClick={handleConfirm}>
                        <div className="header">
                            <Tooltip
                                autoEllipsis
                                className="title"
                                title={getIntlText('setting.integration.function_data_sync_title')}
                            />
                            <IconButton sx={{ width: 24, height: 24 }}>
                                <ChevronRightIcon />
                            </IconButton>
                        </div>
                        <div className="desc">
                            <Tooltip
                                title={getIntlText('setting.integration.function_data_sync_desc')}
                            >
                                <span>
                                    {getIntlText('setting.integration.function_data_sync_desc')}
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </Grid2>
                {/* <Grid2 size={{ sm: 6, md: 4, xl: 3 }}>
                    <div className="ms-int-feat-card" onClick={() => setModalOpen(true)}>
                        <div className="header">
                            <Tooltip
                                autoEllipsis
                                className="title"
                                title="Query the historical data"
                            />
                            <IconButton sx={{ width: 24, height: 24 }}>
                                <ChevronRightIcon />
                            </IconButton>
                        </div>
                        <div className="desc">
                            This service is used to manually pull telemetry data reported by devices
                            to the Milesight Development Platform.
                        </div>
                    </div>
                </Grid2> */}
            </Grid2>
            {/* <Modal
                visible={modalOpen}
                title="Query the historical data"
                onCancel={() => setModalOpen(false)}
                onOk={() => console.log('handle ok...')}
            >
                <DateRangePicker label={{ start: 'Start date', end: 'End date' }} />
            </Modal> */}
        </div>
    );
};

export default Functions;
