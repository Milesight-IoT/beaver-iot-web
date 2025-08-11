import { TagOperationEnums } from '@/services/http';

export const ALL_OPTION = {
    label: 'common.label.select_all',
    value: 'ALL',
};

export const MANAGE_ACTION = (
    getIntlText: (key: string, options?: Record<number | string, any>) => string,
) => [
    {
        label: getIntlText('tag.label.append_tag'),
        value: TagOperationEnums.ADD,
    },
    {
        label: getIntlText('tag.label.overwrite_tag'),
        value: TagOperationEnums.OVERWRITE,
    },
    {
        label: getIntlText('tag.label.remove_tag'),
        value: TagOperationEnums.REMOVE,
    },
    {
        label: getIntlText('tag.label.replace_tag'),
        value: TagOperationEnums.REPLACE,
    },
];
