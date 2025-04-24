import React from 'react';
import { Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { EditIcon } from '@milesight/shared/src/components';
import { Descriptions, DescriptionsProps, PermissionControlDisabled } from '@/components';
import { PERMISSIONS } from '@/constants';

interface IProps {
    /** modal title */
    title: string;
    /** config detail */
    configData: DescriptionsProps['data'];
    /** edit event */
    onEdit: () => void;
}

/**
 * config table cell component
 */
const ConfigCell: React.FC<IProps> = props => {
    const { getIntlText } = useI18n();
    const { title, configData, onEdit } = props;

    return (
        <div className="detail-wrap">
            <div className="detail-wrap-container">
                <span className="detail-wrap-container-title">{title}</span>
                <PermissionControlDisabled permissions={PERMISSIONS.CREDENTIAL_MODULE_EDIT}>
                    <Button
                        variant="outlined"
                        sx={{ textTransform: 'none' }}
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={onEdit}
                    >
                        {getIntlText('common.button.edit')}
                    </Button>
                </PermissionControlDisabled>
            </div>
            <Descriptions data={configData} />
        </div>
    );
};

export default ConfigCell;
