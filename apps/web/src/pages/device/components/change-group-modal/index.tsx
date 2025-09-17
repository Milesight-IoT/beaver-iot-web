import React, { useMemo } from 'react';
import { useForm, Controller, type SubmitHandler, type ControllerProps } from 'react-hook-form';
import { useMemoizedFn } from 'ahooks';
import classNames from 'classnames';
import { Tab, Tabs, Box, Alert, FormControl, Autocomplete } from '@mui/material';

import { Modal, type ModalProps, InfoIcon } from '@milesight/shared/src/components';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { useI18n } from '@milesight/shared/src/hooks';

import { useAutocomplete } from './useAutocomplete';

import styles from './style.module.less';

export enum GroupTabEnums {
    'GROUP' = 1,
    'UNGROUPED' = 2,
}

export interface ChangeGroupProps {
    group: ApiKey;
}

interface Props extends Omit<ModalProps, 'onOk'> {
    /**
     * selected devices ids
     */
    selectedIds: ApiKey[];
    /**
     * current selected tab
     */
    currentTab: GroupTabEnums;
    /** change tab function */
    handleChangeTab: (tab: GroupTabEnums) => void;
    /** on form submit */
    onFormSubmit: (params: ChangeGroupProps, callback: () => void) => Promise<void>;
    onSuccess?: () => void;
}

/**
 * change group Modal
 */
const ChangeGroupModal: React.FC<Props> = props => {
    const {
        visible,
        selectedIds,
        currentTab,
        handleChangeTab,
        onCancel,
        onFormSubmit,
        onSuccess,
        ...restProps
    } = props;

    const { getIntlText } = useI18n();
    const { control, formState, handleSubmit, reset } = useForm<ChangeGroupProps>();
    const {
        options,
        handleChange,
        handleIsOptionEqualToValue,
        handleRenderInput,
        handleTransformValue,
    } = useAutocomplete();

    const formItems: ControllerProps<ChangeGroupProps>[] = useMemo(() => {
        return [
            {
                name: 'group',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <FormControl fullWidth>
                            <Autocomplete<OptionsProps, false>
                                id="replace-tag-select"
                                size="small"
                                options={options}
                                value={handleTransformValue(value as ApiKey)}
                                onChange={handleChange(onChange)}
                                disableListWrap
                                renderInput={handleRenderInput(
                                    getIntlText('device.label.device_group'),
                                    error,
                                )}
                                isOptionEqualToValue={handleIsOptionEqualToValue()}
                                ListboxProps={{
                                    sx: {
                                        height: '240px',
                                    },
                                }}
                            />
                        </FormControl>
                    );
                },
            },
        ];
    }, [
        getIntlText,
        options,
        handleChange,
        handleIsOptionEqualToValue,
        handleRenderInput,
        handleTransformValue,
    ]);

    const onSubmit: SubmitHandler<ChangeGroupProps> = async params => {
        await onFormSubmit(params, () => {
            reset();
            onSuccess?.();
        });
    };

    const handleCancel = useMemoizedFn(() => {
        reset();
        onCancel?.();
    });

    const alertMsg = useMemo(() => {
        let msg = 'device.tip.move_device_to_group';

        if (currentTab === GroupTabEnums.UNGROUPED) {
            msg = 'device.tip.move_device_to_ungrouped';
        }

        return getIntlText(msg, {
            1: selectedIds?.length || 0,
        });
    }, [currentTab, selectedIds, getIntlText]);

    return (
        <Modal
            size="lg"
            visible={visible}
            title={getIntlText('device.label.change_device_group')}
            className={classNames({ loading: formState.isSubmitting })}
            onOk={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            sx={{
                '.MuiDialogTitle-root': {
                    paddingBottom: '4px',
                },
                '.MuiDialogContent-root': {
                    paddingLeft: 0,
                    paddingRight: 0,
                },
            }}
            {...restProps}
        >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: '0 24px' }}>
                <Tabs value={currentTab} onChange={(_, newTab) => handleChangeTab(newTab)}>
                    <Tab
                        label={getIntlText('device.title.move_device_to_group')}
                        value={GroupTabEnums.GROUP}
                    />
                    <Tab
                        label={getIntlText('device.title.mark_device_to_ungrouped')}
                        value={GroupTabEnums.UNGROUPED}
                    />
                </Tabs>
            </Box>

            <div className={styles['change-group-wrapper']}>
                <Alert
                    icon={<InfoIcon />}
                    severity="info"
                    sx={{
                        '.MuiAlert-message': {
                            color: 'var(--text-color-primary)',
                        },
                        margin: 0,
                    }}
                >
                    {alertMsg}
                </Alert>

                {currentTab === GroupTabEnums.GROUP && (
                    <div className={styles.items}>
                        {formItems.map(item => (
                            <Controller<ChangeGroupProps>
                                {...item}
                                key={item.name}
                                control={control}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ChangeGroupModal;
