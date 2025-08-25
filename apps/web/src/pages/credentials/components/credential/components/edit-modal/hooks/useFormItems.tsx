import { useMemo, useState } from 'react';
import { type ControllerProps, type FieldValues } from 'react-hook-form';
import { TextField, InputAdornment } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    checkRequired,
    checkLettersAndNum,
    checkLength,
    checkRangeLength,
} from '@milesight/shared/src/utils/validators';
import { PasswordInput } from '@/components';
// username regex
const userNameReg = /^[a-zA-Z0-9_\-.]+$/;

type ExtendControllerProps<T extends FieldValues> = ControllerProps<T> & {
    /**
     * To Control whether the current component is rendered
     */
    shouldRender?: (data: Partial<T>) => boolean;
};

interface IPros {
    tenantId: string;
    type: 'mqtt' | 'http';
}

export type FormDataProps = {
    username: string;
    accessSecret: string;
};

/** edit mqtt | http fromItems */
const useFormItems = ({ type, tenantId }: IPros) => {
    const { getIntlText } = useI18n();

    const formItems = useMemo(() => {
        const result: ExtendControllerProps<FormDataProps>[] = [];

        result.push(
            {
                name: 'username',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkLength: checkLength({ enum: [8] }),
                        checkLettersAndNumAndSpecial:
                            type === 'mqtt'
                                ? value => {
                                      return userNameReg.test(value)
                                          ? true
                                          : getIntlText(
                                                'common.valid.input_letter_num_special_char',
                                                { 1: '_-' },
                                            );
                                  }
                                : checkLettersAndNum(),
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type="text"
                            autoComplete="off"
                            disabled={disabled}
                            placeholder={getIntlText('common.placeholder.input')}
                            label={getIntlText('user.label.user_name_table_title')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {tenantId ? `@${tenantId}` : tenantId}
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    );
                },
            },
            {
                name: 'accessSecret',
                rules: {
                    validate: {
                        checkRequired: checkRequired(),
                        checkRangeLength: checkRangeLength({ min: 8, max: 32 }),
                        checkLettersAndNum: type === 'http' ? checkLettersAndNum() : () => true,
                    },
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <PasswordInput
                            required
                            fullWidth
                            autoComplete="off"
                            placeholder={getIntlText('common.placeholder.input')}
                            disabled={disabled}
                            label={getIntlText('common.label.password')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                        />
                    );
                },
            },
        );

        return result;
    }, [getIntlText]);

    return formItems;
};

export default useFormItems;
