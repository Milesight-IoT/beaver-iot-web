import { useMemo, useState } from 'react';
import { type ControllerProps, type FieldValues } from 'react-hook-form';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    checkRequired,
    checkLettersAndNum,
    checkLength,
    checkRangeLength,
} from '@milesight/shared/src/utils/validators';
import { VisibilityIcon, VisibilityOffIcon } from '@milesight/shared/src/components';

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
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

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
                                                'valid.input.string_letter_num_special_char',
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
                            placeholder={getIntlText('common.label.please_enter')}
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
                    validate: (() => {
                        return {
                            ...{
                                checkRequired: checkRequired(),
                                checkRangeLength: checkRangeLength({ min: 8, max: 32 }),
                                checkLettersAndNum: checkLettersAndNum(),
                            },
                        };
                    })(),
                },
                render({ field: { onChange, value, disabled }, fieldState: { error } }) {
                    return (
                        <TextField
                            required
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="off"
                            placeholder={getIntlText('common.label.please_enter')}
                            disabled={disabled}
                            label={getIntlText('common.label.password')}
                            error={!!error}
                            helperText={error ? error.message : null}
                            value={value}
                            onChange={onChange}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? (
                                                <VisibilityIcon />
                                            ) : (
                                                <VisibilityOffIcon />
                                            )}
                                        </IconButton>
                                    ),
                                },
                            }}
                        />
                    );
                },
            },
        );

        return result;
    }, [getIntlText, showPassword]);

    return formItems;
};

export default useFormItems;
