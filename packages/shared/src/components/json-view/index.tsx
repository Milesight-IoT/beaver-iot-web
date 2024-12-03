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
    /** 对编辑状态下的 json text 进行保存操作 */
    save: () => Promise<any>;
    getCurrentText?: () => void;
}

interface Props {
    /** 待渲染 json 数据 */
    value?: any;

    /** 是否隐藏 json 内部的编辑操作按钮 */
    readonly?: boolean;

    /** 样式类 */
    className?: string;

    /** 修改数据后的回调 */
    onChange?: (value: any) => void;

    /** text 编辑状态的回调 */
    onEditStatusChange?: (isEdit: boolean) => void;

    /**
     * 需要对用户保存编辑后的 json 数据进行校验的函数
     * 返回 true 表示校验通过，返回 false 表示校验失败
     */
    validateJson?: (value: any) => any;

    /**
     * 维持组件为可编辑状态
     */
    maintainEditStatus?: boolean;
}

/**
 * JSON 数据渲染组件（默认 readOnly）
 */
const JsonTextarea = forwardRef<JsonTextareaExposeProps, Props>(
    ({ readonly = true, className, maintainEditStatus = false, ...props }: Props, ref) => {
        const { getIntlText } = useI18n();

        /** 将 json 数据转换为字符串 */
        const propValueStr = useMemo(() => {
            /**
             * 如果 value 是空数组或空对象，则直接返回 [] 或 {}
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

        /** 暴露给父组件调用的方法 */
        useImperativeHandle(ref, () => ({
            /** 父组件主动调用保存，则不分发变更回调事件 */
            save: () => handleSave(false),
            getCurrentText: () => {
                return currentVal.current;
            },
        }));

        useEffect(() => {
            setState(propValueStr);

            // 重置编辑状态
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
                        // 校验 json 数据
                        if (props?.validateJson && !props.validateJson(result)) {
                            throw new Error('自定义 json 格式校验失败');
                        }

                        // 分发执行变更回调
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

        /** text area 区域样式处理 */
        const viewModeTextCls = useMemo(() => {
            return classNames('ms-view-mode-text', className, {
                /** 根据编辑状态设置 border 样式 */
                'edit-mode-status': isEdit || maintainEditStatus,
            });
        }, [className, isEdit, maintainEditStatus]);

        /**
         * 是否只读
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
