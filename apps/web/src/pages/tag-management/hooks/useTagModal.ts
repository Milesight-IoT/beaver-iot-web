import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { pick } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { toast } from '@milesight/shared/src/components';

import { tagAPI, awaitWrap, isRequestSuccess } from '@/services/http';
import { type OperateTagProps, type OperateModalType } from '../components/operate-tag-modal';
import { type TableRowDataType } from './useColumns';

export default function useTagModal(getAllTags?: () => void, getAddedTag?: () => void) {
    const { getIntlText } = useI18n();

    const [tagModalVisible, setTagModalVisible] = useState(false);
    const [operateType, setOperateType] = useState<OperateModalType>('add');
    const [modalTitle, setModalTitle] = useState(getIntlText('tag.title.add_tag'));
    const [currentTag, setCurrentTag] = useState<TableRowDataType>();

    const hideModal = useMemoizedFn(() => {
        setTagModalVisible(false);
    });

    const openAddTag = useMemoizedFn(() => {
        setOperateType('add');
        setModalTitle(getIntlText('tag.title.add_tag'));
        setTagModalVisible(true);
    });

    const openEditTag = useMemoizedFn((item: TableRowDataType) => {
        setOperateType('edit');
        setModalTitle(getIntlText('tag.title.edit_tag'));
        setTagModalVisible(true);
        setCurrentTag(item);
    });

    const handleAddTag = useMemoizedFn(async (data: OperateTagProps, callback: () => void) => {
        if (!data) return;

        const [error, resp] = await awaitWrap(tagAPI.addTag(data));
        if (error || !isRequestSuccess(resp)) {
            const errorCode = (error?.response?.data as ApiResponse)?.error_code;
            const respErrorCode = resp?.data?.error_code;
            const tagNumExceededCode = 'number_of_entity_tags_exceeded';
            if (errorCode === tagNumExceededCode || respErrorCode === tagNumExceededCode) {
                getAllTags?.();
                getAddedTag?.();
                setTagModalVisible(false);
                callback?.();
            }

            return;
        }

        getAllTags?.();
        getAddedTag?.();
        setTagModalVisible(false);
        toast.success(getIntlText('common.message.add_success'));
        callback?.();
    });

    const handleEditTag = useMemoizedFn(async (data: OperateTagProps, callback: () => void) => {
        if (!currentTag?.id || !data) return;

        const [error, resp] = await awaitWrap(
            tagAPI.updateTag({
                tag_id: currentTag.id,
                ...pick(data, ['name', 'color', 'description']),
            }),
        );
        if (error || !isRequestSuccess(resp)) {
            return;
        }

        getAllTags?.();
        setTagModalVisible(false);
        toast.success(getIntlText('common.message.operation_success'));
        callback?.();
    });

    const onFormSubmit = useMemoizedFn(async (data: OperateTagProps, callback: () => void) => {
        if (!data) return;

        if (operateType === 'add') {
            await handleAddTag(data, callback);
            return;
        }

        await handleEditTag(data, callback);
    });

    return {
        tagModalVisible,
        modalTitle,
        currentTag,
        operateType,
        hideModal,
        openAddTag,
        openEditTag,
        onFormSubmit,
    };
}
