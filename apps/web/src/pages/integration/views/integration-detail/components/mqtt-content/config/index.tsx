import { useEffect } from 'react';
import { Tooltip } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import cls from 'classnames';
import { useI18n } from '@milesight/shared/src/hooks';
import { InfoOutlinedIcon } from '@milesight/shared/src/components';
import { MqttBrokerInfoType } from '@/services/http';
import { useEntity, type InteEntityType } from '../../../hooks';
import { useFormItems, type FormDataProps } from './hook';

import './style.less';

interface Props {
    /** Entity list */
    entities?: InteEntityType[];
    brokerInfo?: MqttBrokerInfoType;
    /** Edit successful callback */
    onUpdateSuccess?: () => void;
}

/**
 * mqtt integrated configuration component
 */
const Config: React.FC<Props> = ({ entities, brokerInfo, onUpdateSuccess }) => {
    const { getIntlText } = useI18n();
    const { getEntityValues } = useEntity({ entities });

    // ---------- form related processing logic ----------
    const formItems = useFormItems();
    const { control, formState, setValue } = useForm<FormDataProps>();

    useEffect(() => {
        setValue('server', brokerInfo?.server || '');
        setValue('port', brokerInfo?.port || '');
        setValue('username', brokerInfo?.username || '');
        setValue('password', brokerInfo?.password || '');
    }, [getEntityValues, brokerInfo]);

    // const getMqttBrokerInfo = async () => {
    //     const [error, resp] = await awaitWrap(mqttApi.getBrokerInfo());
    //     const data = getResponseData(resp);
    //     if (error || !data || !isRequestSuccess(resp)) {
    //         return;
    //     }
    //     setValue('server', data.server);
    //     setValue('port', data.port);
    //     setValue('username', data.username);
    //     setValue('password', data.password);
    // }

    return (
        <div className="ms-view-mqtt-config">
            <div className="ms-view-mqtt-config-header">
                <h2>{getIntlText('setting.integration.mqtt_broker')}</h2>
                <Tooltip
                    title={getIntlText('setting.integration.mqtt_broker_helper_text')}
                    sx={{ ml: 0.5 }}
                >
                    <InfoOutlinedIcon />
                </Tooltip>
            </div>
            <div className="ms-view-mqtt-config-body">
                <div className={cls('form', { loading: formState.isSubmitting })}>
                    {formItems.map(props => (
                        <Controller<FormDataProps> {...props} key={props.name} control={control} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Config;
