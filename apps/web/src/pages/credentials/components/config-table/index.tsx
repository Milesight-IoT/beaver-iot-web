import React from 'react';
import { Button } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { EditIcon } from '@milesight/shared/src/components';
import { Descriptions, DescriptionsProps, PermissionControlDisabled } from '@/components';
import { PERMISSIONS } from '@/constants';

import './style.less';

interface IProps {
    /** modal title */
    title: React.ReactNode;
    /** config detail */
    configData: DescriptionsProps['data'];
    /** permissions module */
    permissions: PERMISSIONS;
    /** edit event */
    onEdit: () => void;
}

/**
 * config table with permissions component
 */
const ConfigTable: React.FC<IProps> = props => {
    const { getIntlText } = useI18n();
    const { title, configData, onEdit, permissions } = props;

    return (
        <div className="ms-config-table">
            <div className="ms-config-table-container">
                <div className="ms-config-table-container-title">{title}</div>
                <PermissionControlDisabled permissions={permissions}>
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

export default ConfigTable;
