import { useMemo } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { Descriptions, MultiTag, Tag } from '@/components';
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
                label: getIntlText('common.label.type'),
                content: data.entityValueType,
            },
            {
                key: 'entityTags',
                label: getIntlText('tag.label.tags'),
                content: (
                    <MultiTag<NonNullable<TableRowDataType['entityTags']>[0]>
                        data={(data.entityTags || []).map(
                            (tag: NonNullable<TableRowDataType['entityTags']>[0]) => ({
                                ...tag,
                                key: tag.id,
                                label: tag.name,
                                desc: tag.description,
                            }),
                        )}
                        renderItem={(tag, maxItemWidth) => {
                            return (
                                <Tag
                                    key={tag.id}
                                    label={tag.name}
                                    arbitraryColor={tag.color}
                                    tip={tag.description}
                                    sx={{ maxWidth: maxItemWidth }}
                                />
                            );
                        }}
                    />
                ),
                contentCellProps: {
                    colSpan: 3,
                },
            },
        ];
    }, [data]);

    return <Descriptions data={desList} />;
};

export default BasicInfo;
