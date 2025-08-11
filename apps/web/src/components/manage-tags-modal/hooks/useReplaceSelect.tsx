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

import { useI18n } from '@milesight/shared/src/hooks';
import { LoadingWrapper } from '@milesight/shared/src/components';
import Tag from '../../tag';

export function useReplaceSelect(props: { tagOptions: TagProps[]; tagsLoading?: boolean }) {
    const { tagOptions, tagsLoading = false } = props || {};

    const { getIntlText } = useI18n();

    const replaceTransformValue = useMemoizedFn((value: ApiKey) => {
        return (
            tagOptions?.find(option => {
                if (!value) {
                    return false;
                }

                return value === option.id;
            }) || null
        );
    });

    const handleReplaceChange = useMemoizedFn(
        (
            onChange: (...event: any[]) => void,
        ): UseAutocompleteProps<TagProps, false, false, false>['onChange'] => {
            return (_, selectedOption) => {
                onChange(selectedOption?.id || null);
            };
        },
    );

    const replaceRenderOptions = useMemoizedFn(
        (): AutocompleteProps<TagProps, false, false, false>['renderOption'] => {
            return (props, option, state) => {
                return [props, option, state] as React.ReactNode;
            };
        },
    );

    const replaceRenderInput = useMemoizedFn(
        (
            value: ApiKey,
            text: string,
            error: FieldError | undefined,
        ): AutocompleteProps<TagProps, false, false, false>['renderInput'] => {
            return params => {
                const currentOption = replaceTransformValue(value);
                return (
                    <TextField
                        {...params}
                        required
                        error={!!error}
                        helperText={error ? error.message : null}
                        label={text}
                        placeholder={
                            currentOption ? undefined : getIntlText('common.placeholder.select')
                        }
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                startAdornment: currentOption ? (
                                    <Tag
                                        label={currentOption.name}
                                        arbitraryColor={currentOption.color}
                                        tip={currentOption.description}
                                    />
                                ) : undefined,
                            },
                        }}
                    />
                );
            };
        },
    );

    const replaceIsOptionEqualToValue = useMemoizedFn(
        (): UseAutocompleteProps<TagProps, false, false, false>['isOptionEqualToValue'] => {
            return (option, valueObj) => option.id === valueObj.id;
        },
    );

    const replaceGetOptionLabel = useMemoizedFn(
        (): UseAutocompleteProps<TagProps, false, false, false>['getOptionLabel'] => {
            return () => '';
        },
    );

    const replaceFilterOptions = useMemoizedFn(
        (): UseAutocompleteProps<TagProps, false, false, false>['filterOptions'] => {
            return (options, state) => {
                return (options || []).filter(o => o.name.includes(state.inputValue));
            };
        },
    );

    const replaceSlots = useMemoizedFn((): Partial<AutocompleteSlots> | undefined => {
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

    return {
        replaceTransformValue,
        handleReplaceChange,
        replaceRenderOptions,
        replaceRenderInput,
        replaceIsOptionEqualToValue,
        replaceGetOptionLabel,
        replaceFilterOptions,
        replaceSlots,
    };
}
