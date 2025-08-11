import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';
import { isEmpty } from 'lodash-es';

import { Modal, type ModalProps } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { useFormItems, useEntityOptions, useTagOptions } from './hooks';
import Tag from '../tag';
import type { ManageTagsProps, ManageTagsFormSubmitProps } from './interface';

import styles from './style.module.less';

interface Props extends Omit<ModalProps, 'onOk'> {
    /**
     * selected entity data
     */
    selectedEntities?: ObjectToCamelCase<EntityData>[];
    /** tip info */
    tip?: string;
    /** on form submit */
    onFormSubmit: (props: ManageTagsFormSubmitProps) => Promise<void>;
}

/**
 * Manage tag Modal
 */
const ManageTagsModal: React.FC<Props> = props => {
    const { visible, selectedEntities, tip, onCancel, onFormSubmit, ...restProps } = props;

    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset, watch, setValue } = useForm<ManageTagsProps>();
    const { tagsLoading, tagOptions, getTagList } = useTagOptions();
    const { entityOptions } = useEntityOptions(tagOptions, selectedEntities);

    const currentAction = watch('action');

    const { formItems } = useFormItems({
        currentAction,
        entityOptions,
        tagsLoading,
        originalTagOptions: tagOptions,
    });

    const resetTagForm = useMemoizedFn(() => {
        setValue('tags', []);
        setValue('originalTag', '');
        setValue('replaceTag', '');
    });

    /**
     * When action changed
     * initial value
     */
    useEffect(() => {
        if (!currentAction) {
            return;
        }

        resetTagForm();
    }, [currentAction, resetTagForm]);

    const onSubmit: SubmitHandler<ManageTagsProps> = async params => {
        await onFormSubmit({
            params,
            reset,
            resetTagForm,
            getTagList,
        });
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    const renderTags = () => {
        if (!Array.isArray(entityOptions) || isEmpty(entityOptions)) {
            return <div className={styles.tags}>{getIntlText('tag.tip.not_any_tags')}</div>;
        }

        return (
            <div className={styles['entity-tags-wrapper']}>
                {entityOptions.map(tag => (
                    <Tag
                        key={tag.id}
                        label={tag.name}
                        arbitraryColor={tag.color}
                        tip={tag.description}
                    />
                ))}
            </div>
        );
    };

    return (
        <Modal
            visible={visible}
            size="lg"
            title={getIntlText('tag.title.manage_tags')}
            className={classNames(styles['manage-tags-modal'], { loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            {...restProps}
        >
            <div className={styles.alert}>
                {tip && <div className={styles.msg}>{tip}</div>}
                {renderTags()}
            </div>

            {formItems.map(item => (
                <Controller<ManageTagsProps> {...item} key={item.name} control={control} />
            ))}
        </Modal>
    );
};

export default ManageTagsModal;
