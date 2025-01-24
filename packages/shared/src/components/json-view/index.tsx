import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { isEmpty, isPlainObject } from 'lodash-es';
import classNames from 'classnames';
import toast from '../toast';
import { useI18n } from '../../hooks';

import './style.less';

export interface JsonTextareaExposeProps {
    /** Save the json text in the edit state */
    save: () => Promise<any>;
    getCurrentText?: () => void;
}

interface Props {
    /** json data to be rendered */
    value?: any;

    /** Whether to hide the edit action button inside the json */
    readonly?: boolean;

    /** Style class */
    className?: string;

    /** Callback after data modification */
    onChange?: (value: any) => void;

    /** text edit status callback */
    onEditStatusChange?: (isEdit: boolean) => void;

    /**
     * A function that needs to verify the edited json data saved by the user
     * If true is returned, the verification succeeds. If false is returned, the verification fails
     */
    validateJson?: (value: any) => any;

    /**
     * Keep the component editable
     */
    maintainEditStatus?: boolean;
}

/**
 * JSON data rendering component (default readOnly)
 */
const JsonTextarea = forwardRef<JsonTextareaExposeProps, Props>(
    ({ readonly = true, className, maintainEditStatus = false, ...props }: Props, ref) => {
        const { getIntlText } = useI18n();

        /** Converts json data to a string */
        const propValueStr = useMemo(() => {
            /**
             * If value is an empty array or an empty object, return [] or {} directly.
             */
            if (
                (Array.isArray(props.value) || isPlainObject(props.value)) &&
                isEmpty(props.value)
            ) {
                return JSON.stringify(props.value, null, 4);
            }

            return !isEmpty(props?.value) ? JSON.stringify(props.value, null, 4) : '';
        }, [props.value]);

        const [state, setState] = useState<string>(propValueStr);
        const [isEdit, setIsEdit] = useState<boolean>(false);

        const cacheVal = useRef<string>('');
        const currentVal = useRef<string>('');

        /** Exposes a method called by the parent component */
        useImperativeHandle(ref, () => ({
            /** The parent component actively calls the save, and does not distribute the change callback event */
            save: () => handleSave(false),
            getCurrentText: () => {
                return currentVal.current;
            },
        }));

        useEffect(() => {
            setState(propValueStr);

            // Reset edit status
            setIsEdit(false);
            props?.onEditStatusChange?.(false);
        }, [props.value]);

        useEffect(() => {
            currentVal.current = state;
        }, [state]);

        useEffect(() => {
            if (maintainEditStatus) {
                cacheVal.current = currentVal.current;
            }
        }, [maintainEditStatus]);

        const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setState(e.target.value);
        };

        const handleCancel = useCallback(() => {
            setState(cacheVal.current);
            setIsEdit(false);
            props?.onEditStatusChange?.(false);
            currentVal.current = cacheVal.current;
        }, [props]);

        const handleSave = useCallback(
            (emitChange = true) => {
                return new Promise((resolve, reject) => {
                    setIsEdit(false);
                    props?.onEditStatusChange?.(false);

                    try {
                        const result = JSON.parse(state);
                        // Check json data
                        if (props?.validateJson && !props.validateJson(result)) {
                            throw new Error(
                                'The user-defined json format verification fails. Procedure',
                            );
                        }

                        // Distribute execute change callbacks
                        if (emitChange) props.onChange?.(result);
                        resolve(result);
                    } catch (e) {
                        // eslint-disable-next-line
                        console.error(e);
                        toast.error(getIntlText('common.upload.error_json_format_message'));
                        setState(cacheVal.current);
                        reject(e);
                    }
                });
            },
            [state, getIntlText, props],
        );

        const handleEdit = useCallback(() => {
            cacheVal.current = state;

            setIsEdit(true);
            props?.onEditStatusChange?.(true);
        }, [state, props]);

        /** text area Area style processing */
        const viewModeTextCls = useMemo(() => {
            return classNames('ms-view-mode-text', className, {
                /** Set the border style according to the editing state */
                'edit-mode-status': isEdit || maintainEditStatus,
            });
        }, [className, isEdit, maintainEditStatus]);

        /**
         * Read only or not
         */
        const isReadOnly = useMemo(() => {
            if (maintainEditStatus) {
                return false;
            }

            return !isEdit;
        }, [maintainEditStatus, isEdit]);

        return (
            <div className={viewModeTextCls}>
                <textarea
                    readOnly={isReadOnly}
                    wrap="off"
                    className="ms-view-mode-text-textarea"
                    value={state}
                    onChange={handleOnChange}
                />
            </div>
        );
    },
);

export default React.memo(JsonTextarea);
