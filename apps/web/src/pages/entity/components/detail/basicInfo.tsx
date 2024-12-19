import { useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Descriptions } from '@/components';
import { TableRowDataType } from '../../hooks/useColumns';

interface IProps {
    data: TableRowDataType;
}

const BasicInfo = ({ data }: IProps) => {
    const { getIntlText } = useI18n();

    const desList = useMemo(() => {
        return [
            {
                key: 'name',
                label: getIntlText('device.label.param_entity_name'),
                content: data.entityName,
            },
            {
                key: 'dataType',
                label: getIntlText('common.label.data_type'),
                content: data.entityValueType,
            },
        ];
    }, [data]);

    return <Descriptions data={desList} />;
};

export default BasicInfo;
