import { useMemoizedFn, useRequest } from 'ahooks';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast, ErrorIcon } from '@milesight/shared/src/components';

import { useConfirm } from '@/components';
import { tagAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { type TableRowDataType } from './useColumns';

export default function useTag(getAllTags?: () => void) {
    const { getIntlText } = useI18n();
    const confirm = useConfirm();

    const { data: addedTagNum, run: getAddedTag } = useRequest(async () => {
        const [error, resp] = await awaitWrap(tagAPI.getTagNumberByUserAdded());
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        const data = getResponseData(resp);
        return data?.number || 0;
    });

    const handleDeleteTag = useMemoizedFn((records: TableRowDataType[]) => {
        if (!Array.isArray(records) || isEmpty(records)) {
            return;
        }

        const isBatch = records.length > 1;
        const titleKey = isBatch ? 'common.label.bulk_deletion' : 'common.label.deletion';
        const description = isBatch
            ? getIntlText('tag.tip.bulk_delete_tag', {
                  1: records.length,
              })
            : getIntlText('tag.tip.single_delete_tag', {
                  1: records?.[0]?.name || '',
              });

        confirm({
            title: getIntlText(titleKey),
            description,
            confirmButtonText: getIntlText('common.label.delete'),
            icon: <ErrorIcon sx={{ color: 'var(--orange-base)' }} />,
            onConfirm: async () => {
                const ids = records.map(r => r.id);

                const [error, resp] = await awaitWrap(
                    tagAPI.deleteTag({
                        ids,
                    }),
                );
                if (error || !isRequestSuccess(resp)) {
                    return;
                }

                getAllTags?.();
                getAddedTag();
                toast.success(getIntlText('common.message.delete_success'));
            },
        });
    });

    return {
        /**
         * To delete tag
         */
        handleDeleteTag,
        getAddedTag,
        addedTagCount: addedTagNum || 0,
    };
}
