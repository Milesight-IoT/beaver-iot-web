import React, { useState } from 'react';
import { Button, FormHelperText } from '@mui/material';
import { useControllableValue } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon } from '@milesight/shared/src/components';

import { type MarkerExtraInfoProps } from '../../plugins/occupancy-marker/control-panel';
import BindEntitiesModal from './BindEntitiesModal';

import './style.less';

export interface ToiletBindEntitiesProps {
    error?: boolean;
    helperText?: React.ReactNode;
    value?: MarkerExtraInfoProps[];
    defaultValue?: MarkerExtraInfoProps[];
    onChange?: (value: MarkerExtraInfoProps[]) => void;
}

/**
 * Toilet project bind entities component
 */
const ToiletBindEntities: React.FC<ToiletBindEntitiesProps> = ({
    error,
    helperText,
    ...restProps
}) => {
    const { getIntlText } = useI18n();
    const [_, setValue] = useControllableValue<MarkerExtraInfoProps[]>(restProps);

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <div className="toilet-bind-entities">
            <div className="header-label">
                <span className="asterisk">*</span>
                {getIntlText('common.label.data_source')}
            </div>

            <div className="tip-info">{getIntlText('dashboard.tip.toilet_bind_entities')}</div>

            <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setModalVisible(true)}
            >
                {getIntlText('dashboard.label.batch_bind_entities')}
            </Button>

            <FormHelperText error={!!error}>{helperText}</FormHelperText>

            {modalVisible && (
                <BindEntitiesModal
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    setValue={setValue}
                />
            )}
        </div>
    );
};

export default ToiletBindEntities;
