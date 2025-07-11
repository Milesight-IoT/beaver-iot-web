import React from 'react';
import { Tooltip } from '@mui/material';
import { isBoolean } from 'lodash-es';
import { useI18n } from '@milesight/shared/src/hooks';
import { DataReportResult } from '@/services/http';

import './style.less';

export interface ParseResultProps {
    title: string;
    entityList: ObjectToCamelCase<DataReportResult>['entities'];
}

/**
 * object key value show component
 */
const ParseResult: React.FC<ParseResultProps> = props => {
    const { title, entityList } = props;
    const { getIntlText } = useI18n();
    const convertShowValue = (value: any) => {
        if (isBoolean(value)) {
            return String(value);
        }
        return value;
    };

    return (
        <div className="ms-parse-result">
            <span>{title}</span>
            {entityList?.map(entity => {
                return (
                    <div key={entity.entityName} className="ms-parse-result-item">
                        <div>
                            <span>{getIntlText('device.label.param_entity_name')}</span>
                            <Tooltip title={entity.entityName}>
                                <span>{convertShowValue(entity.entityName) || '-'}</span>
                            </Tooltip>
                        </div>
                        <div>
                            <span>{getIntlText('setting.integration.entity_data_value')}</span>
                            <Tooltip title={entity.value}>
                                <span>{convertShowValue(entity.value) || '-'}</span>
                            </Tooltip>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ParseResult;
