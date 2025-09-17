import { useMemo } from 'react';
import { type ControllerProps } from 'react-hook-form';
import { FormControl, Autocomplete } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { checkRequired } from '@milesight/shared/src/utils/validators';
import { Select } from '@milesight/shared/src/components';

import { TagOperationEnums } from '@/services/http';
import type { ManageTagsProps } from '../interface';
import { SelectVirtualizationList } from '../components';
import { MANAGE_ACTION } from '../constants';
import { useAutoComplete } from './useAutoComplete';
import { useReplaceSelect } from './useReplaceSelect';

export function useFormItems(props: {
    currentAction: TagOperationEnums;
    entityOptions: TagProps[];
    tagsLoading?: boolean;
    originalTagOptions: TagProps[];
}) {
    const {
        currentAction = TagOperationEnums.ADD,
        entityOptions,
        tagsLoading = false,
        originalTagOptions,
    } = props || {};

    const { getIntlText } = useI18n();
    const {
        autoCompleteTagOptions,
        transformValue,
        handleChange,
        handleRenderOptions,
        handleRenderInput,
        handleRenderTag,
        handleIsOptionEqualToValue,
        handleGetOptionDisabled,
        handleGetOptionLabel,
        handleSlots,
    } = useAutoComplete({
        currentAction,
        entityOptions,
        tagsLoading,
        originalTagOptions,
    });

    const {
        replaceTransformValue,
        handleReplaceChange,
        replaceRenderOptions,
        replaceRenderInput,
        replaceIsOptionEqualToValue,
        replaceGetOptionLabel,
        replaceFilterOptions,
        replaceSlots,
    } = useReplaceSelect({
        tagOptions: originalTagOptions,
        tagsLoading,
    });

    const formItems: ControllerProps<ManageTagsProps>[] = useMemo(() => {
        const results: ControllerProps<ManageTagsProps>[] = [];

        const actionItem: ControllerProps<ManageTagsProps> = {
            name: 'action',
            rules: {
                maxLength: {
                    value: 127,
                    message: getIntlText('valid.input.max_length', {
                        1: 127,
                    }),
                },
                validate: {
                    checkRequired: checkRequired(),
                },
            },
            defaultValue: TagOperationEnums.ADD,
            render({ field: { onChange, value }, fieldState: { error } }) {
                return (
                    <Select
                        required
                        fullWidth
                        options={MANAGE_ACTION(getIntlText)}
                        label={getIntlText('common.label.action')}
                        error={error}
                        value={value as ApiKey}
                        onChange={onChange}
                    />
                );
            },
        };

        const tagsItem: ControllerProps<ManageTagsProps> = {
            name: 'tags',
            rules: {
                validate: {
                    checkRequired: checkRequired(),
                },
            },
            defaultValue: [],
            render({ field: { onChange, value }, fieldState: { error } }) {
                return (
                    <FormControl fullWidth>
                        <Autocomplete<TagProps, true>
                            multiple
                            id="manage-tags"
                            size="small"
                            options={autoCompleteTagOptions}
                            value={transformValue(value as ApiKey[])}
                            onChange={handleChange(onChange)}
                            disableCloseOnSelect
                            disableListWrap
                            renderOption={handleRenderOptions()}
                            renderInput={handleRenderInput(error)}
                            renderTags={handleRenderTag()}
                            isOptionEqualToValue={handleIsOptionEqualToValue()}
                            getOptionDisabled={handleGetOptionDisabled(value as ApiKey[])}
                            getOptionLabel={handleGetOptionLabel()}
                            slotProps={{
                                listbox: {
                                    component: SelectVirtualizationList,
                                },
                            }}
                            slots={handleSlots()}
                        />
                    </FormControl>
                );
            },
        };
        if (currentAction !== TagOperationEnums.REPLACE) {
            results.push(tagsItem);
        }

        const replaceItems: ControllerProps<ManageTagsProps>[] = [
            {
                name: 'originalTag',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <FormControl fullWidth>
                            <Autocomplete<TagProps, false>
                                id="original-tag-select"
                                size="small"
                                options={entityOptions}
                                value={replaceTransformValue(value as ApiKey)}
                                onChange={handleReplaceChange(onChange)}
                                disableListWrap
                                renderOption={replaceRenderOptions()}
                                renderInput={replaceRenderInput(
                                    value as ApiKey,
                                    getIntlText('tag.title.original_tag'),
                                    error,
                                )}
                                isOptionEqualToValue={replaceIsOptionEqualToValue()}
                                getOptionLabel={replaceGetOptionLabel()}
                                filterOptions={replaceFilterOptions()}
                                slotProps={{
                                    listbox: {
                                        component: SelectVirtualizationList,
                                    },
                                }}
                            />
                        </FormControl>
                    );
                },
            },
            {
                name: 'replaceTag',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                    },
                },
                defaultValue: '',
                render({ field: { onChange, value }, fieldState: { error } }) {
                    return (
                        <FormControl fullWidth>
                            <Autocomplete<TagProps, false>
                                id="replace-tag-select"
                                size="small"
                                options={originalTagOptions}
                                value={replaceTransformValue(value as ApiKey)}
                                onChange={handleReplaceChange(onChange)}
                                disableListWrap
                                renderOption={replaceRenderOptions()}
                                renderInput={replaceRenderInput(
                                    value as ApiKey,
                                    getIntlText('tag.title.replace_with'),
                                    error,
                                )}
                                isOptionEqualToValue={replaceIsOptionEqualToValue()}
                                getOptionLabel={replaceGetOptionLabel()}
                                filterOptions={replaceFilterOptions()}
                                slotProps={{
                                    listbox: {
                                        component: SelectVirtualizationList,
                                    },
                                }}
                                slots={replaceSlots()}
                            />
                        </FormControl>
                    );
                },
            },
        ];
        if (currentAction === TagOperationEnums.REPLACE) {
            results.push(...replaceItems);
        }

        return [actionItem, ...results];
    }, [
        getIntlText,
        autoCompleteTagOptions,
        entityOptions,
        originalTagOptions,
        currentAction,
        transformValue,
        handleChange,
        handleRenderOptions,
        handleRenderInput,
        handleRenderTag,
        handleIsOptionEqualToValue,
        handleGetOptionDisabled,
        handleGetOptionLabel,
        handleSlots,
        replaceTransformValue,
        handleReplaceChange,
        replaceRenderOptions,
        replaceRenderInput,
        replaceIsOptionEqualToValue,
        replaceGetOptionLabel,
        replaceFilterOptions,
        replaceSlots,
    ]);

    return {
        formItems,
    };
}
