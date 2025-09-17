import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { type FieldError } from 'react-hook-form';
import {
    type UseAutocompleteProps,
    type AutocompleteProps,
    TextField,
    type AutocompleteSlots,
    Paper,
    List,
} from '@mui/material';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { CloseIcon, LoadingWrapper } from '@milesight/shared/src/components';

import { TagOperationEnums } from '@/services/http';
import Tag from '@/components/tag';
import { useTagAllSelect } from './useTagAllSelect';
import { ALL_OPTION } from '../constants';

import styles from '../style.module.less';

export function useAutoComplete(props: {
    currentAction: TagOperationEnums;
    entityOptions: TagProps[];
    tagsLoading?: boolean;
    originalTagOptions: TagProps[];
}) {
    const { currentAction, entityOptions, tagsLoading, originalTagOptions } = props || {};

    const { getIntlText } = useI18n();

    const { allIsIndeterminate, convertTagsValue, convertTagsOnChangeValue } = useTagAllSelect();

    const autoCompleteTagOptions = useMemo((): TagProps[] => {
        const allOption: TagProps = {
            id: ALL_OPTION.value,
            name: getIntlText(ALL_OPTION.label),
            color: '#7B4EFA',
        };

        if (currentAction === TagOperationEnums.REMOVE) {
            if (!Array.isArray(entityOptions) || isEmpty(entityOptions)) {
                return [];
            }

            if (entityOptions?.length === 1) {
                return entityOptions;
            }

            return [allOption, ...entityOptions];
        }

        return originalTagOptions;
    }, [getIntlText, currentAction, originalTagOptions, entityOptions]);

    const transformValue = useMemoizedFn((value: ApiKey[]) => {
        return autoCompleteTagOptions.filter(option => {
            if (!Array.isArray(value)) {
                return false;
            }

            const newValue =
                currentAction === TagOperationEnums.REMOVE
                    ? convertTagsValue(value, autoCompleteTagOptions)
                    : value;
            return newValue.includes(option.id as ApiKey);
        });
    });

    const handleChange = useMemoizedFn(
        (
            onChange: (...event: any[]) => void,
        ): UseAutocompleteProps<TagProps, true, false, false>['onChange'] => {
            return (_, selectedOptions, reason, details) => {
                const newValue = (selectedOptions || []).map(o => o.id).filter(Boolean);

                const finalNewValue =
                    currentAction === TagOperationEnums.REMOVE
                        ? convertTagsOnChangeValue(
                              newValue as ApiKey[],
                              autoCompleteTagOptions,
                              reason,
                              details,
                          )
                        : newValue;
                onChange(finalNewValue);
            };
        },
    );

    const handleRenderOptions = useMemoizedFn(
        (): AutocompleteProps<TagProps, true, false, false>['renderOption'] => {
            return (props, option, state) => {
                Reflect.set(state, 'multiple', true);
                Reflect.set(state, 'allIsIndeterminate', allIsIndeterminate);
                return [props, option, state] as React.ReactNode;
            };
        },
    );

    const handleRenderInput = useMemoizedFn(
        (
            error: FieldError | undefined,
        ): AutocompleteProps<TagProps, true, false, false>['renderInput'] => {
            return params => (
                <TextField
                    {...params}
                    required
                    error={!!error}
                    helperText={error ? error.message : null}
                    label={getIntlText('tag.label.tags')}
                    placeholder={getIntlText('common.placeholder.select')}
                />
            );
        },
    );

    const handleRenderTag = useMemoizedFn(
        (): AutocompleteProps<TagProps, true, false, false>['renderTags'] => {
            return (value: readonly TagProps[], getTagProps) => {
                return value
                    .filter(o => o.id !== ALL_OPTION.value)
                    .map((option: TagProps, index: number) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                            <Tag
                                key={key}
                                label={option.name}
                                arbitraryColor={option.color}
                                tip={option.description}
                                deleteIcon={<CloseIcon />}
                                {...tagProps}
                            />
                        );
                    });
            };
        },
    );

    const handleIsOptionEqualToValue = useMemoizedFn(
        (): UseAutocompleteProps<TagProps, true, false, false>['isOptionEqualToValue'] => {
            return (option, valueObj) => option.id === valueObj.id;
        },
    );

    const handleGetOptionDisabled = useMemoizedFn(
        (
            value: ApiKey[],
        ): UseAutocompleteProps<TagProps, true, false, false>['getOptionDisabled'] => {
            return () => {
                return (
                    [TagOperationEnums.ADD, TagOperationEnums.OVERWRITE].includes(currentAction) &&
                    (value as ApiKey[])?.length >= 10
                );
            };
        },
    );

    const handleGetOptionLabel = useMemoizedFn(
        (): UseAutocompleteProps<TagProps, true, false, false>['getOptionLabel'] => {
            return option => {
                return option?.name || '';
            };
        },
    );

    const handleSlots = useMemoizedFn((): Partial<AutocompleteSlots> | undefined => {
        return {
            paper: tagsLoading
                ? () => (
                      <Paper>
                          <LoadingWrapper loading>
                              <List
                                  sx={{
                                      height: 100,
                                  }}
                              />
                          </LoadingWrapper>
                      </Paper>
                  )
                : undefined,
        };
    });

    const renderEmpty = useMemoizedFn((options: TagProps[]) => {
        if (Array.isArray(options) && !isEmpty(options)) {
            return null;
        }

        return (
            <div className={styles['select-empty']}>{getIntlText('common.label.no_options')}</div>
        );
    });

    return {
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
        renderEmpty,
    };
}
