import { useState, useRef } from 'react';
import { useMemoizedFn, useRequest } from 'ahooks';
import { isEqual, get } from 'lodash-es';

import { objectToCamelCase } from '@milesight/shared/src/utils/tools';
import { toast } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import {
    userAPI,
    getResponseData,
    awaitWrap,
    isRequestSuccess,
    type UserMenuType,
} from '@/services/http';
import useUserRoleStore from '@/pages/user-role/store';
import { permissionMapIntlTextKey, PERMISSION_INTL_SIGN } from '../../../constants';

/**
 * Whether page view permission sign
 */
const VIEW_PERMISSION_SIGN = '.view';

/**
 * role functions hooks
 */
const useFunctions = () => {
    const { getIntlText } = useI18n();
    const { activeRole } = useUserRoleStore();

    const [isEditing, setIsEditing] = useState(false);
    /** all permissions data */
    const [permissions, setPermissions] = useState<ObjectToCamelCase<UserMenuType[]>>([]);
    /** user checked permissions */
    const [checkedPermissions, setCheckedPermissions] = useState<ApiKey[]>([]);

    const cacheCheckedRef = useRef<ApiKey[]>([]);

    const { loading } = useRequest(
        async () => {
            const [err, resp] = await awaitWrap(userAPI.getUserAllMenus());

            if (err || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);

            setPermissions(objectToCamelCase(result || []));
        },
        {
            refreshDeps: [],
        },
    );

    useRequest(
        async () => {
            if (!activeRole) return;

            const [err, resp] = await awaitWrap(
                userAPI.getRoleAllMenus({
                    role_id: activeRole.roleId,
                }),
            );

            if (err || !isRequestSuccess(resp)) {
                return;
            }

            const result = getResponseData(resp);
            setCheckedPermissions((result || []).map(r => r.menu_id));
        },
        {
            refreshDeps: [activeRole],
        },
    );

    /**
     * get modal table row span number
     */
    const getModelTableRowSpan = useMemoizedFn((permission: ObjectToCamelCase<UserMenuType>) => {
        const { children } = permission;

        const isMenu = children.every(c => c.type === 'MENU');
        if (!children || !children?.length || !isMenu) {
            return 2;
        }

        return 1 + children.length;
    });

    const handleEdit = useMemoizedFn(() => {
        // save cache checked permissions
        cacheCheckedRef.current = checkedPermissions;

        setIsEditing(true);
    });

    const handleCancel = useMemoizedFn(() => {
        // restore cache checked permissions
        if (cacheCheckedRef.current && !isEqual(cacheCheckedRef.current, checkedPermissions)) {
            setCheckedPermissions(cacheCheckedRef.current);
        }

        setIsEditing(false);
    });

    /**
     * handle functions permission checked change
     */
    const handleFunctionsChecked = useMemoizedFn(
        (props: {
            permission: ObjectToCamelCase<UserMenuType>;
            siblingPermissions: ObjectToCamelCase<UserMenuType[]>;
        }) => {
            const { permission, siblingPermissions } = props || {};
            if (permission.type !== 'FUNCTION') {
                return;
            }

            const isView = permission.code.includes(VIEW_PERMISSION_SIGN);
            if (isView) {
                setCheckedPermissions(prev => {
                    const newChecked = [...prev];

                    if (newChecked.includes(permission.menuId)) {
                        newChecked.splice(
                            newChecked.findIndex(n => n === permission.menuId),
                            1,
                        );
                    } else {
                        newChecked.push(permission.menuId);
                    }

                    return newChecked;
                });

                return;
            }

            /**
             * If there are other functional permissions, there must be view permissions.
             */
            const view = siblingPermissions?.find(p => p?.code?.includes(VIEW_PERMISSION_SIGN));

            const result = view ? [view.menuId, permission.menuId] : [permission.menuId];
            setCheckedPermissions(prev => {
                let newChecked = [...prev];

                if (newChecked.includes(permission.menuId)) {
                    newChecked.splice(
                        newChecked.findIndex(n => n === permission.menuId),
                        1,
                    );
                } else {
                    newChecked = [...new Set([...newChecked, ...result])];
                }
                return newChecked;
            });
        },
    );

    /**
     * whether disabled current function checkbox
     */
    const isDisabledFunction = useMemoizedFn(
        (props: {
            permission: ObjectToCamelCase<UserMenuType>;
            siblingPermissions: ObjectToCamelCase<UserMenuType[]>;
        }) => {
            const { permission, siblingPermissions } = props || {};

            const { code } = permission || {};
            if (!code?.includes(VIEW_PERMISSION_SIGN)) {
                return !isEditing;
            }

            const otherSiblings = siblingPermissions
                .filter(s => s.menuId !== permission.menuId)
                .map(n => n.menuId);

            /**
             * is disabled current page view checkbox
             */
            const checkedPermissionsHasSibling = checkedPermissions.some(n =>
                otherSiblings.includes(n),
            );
            return !isEditing || checkedPermissionsHasSibling;
        },
    );

    /**
     * handle pages permission checked change
     */
    const handlePagesChecked = useMemoizedFn(
        (props: {
            isChecked: boolean;
            indeterminate: boolean;
            permissions: ObjectToCamelCase<UserMenuType[]>;
        }) => {
            const { isChecked, indeterminate, permissions } = props || {};

            /**
             * if current page is indeterminate
             * the state should be cleared when the user clicks on it
             */
            const newIsChecked = indeterminate ? false : isChecked;

            const menuIds = permissions.map(p => p.menuId);
            setCheckedPermissions(prev => {
                let newChecked = [...prev];
                if (newIsChecked) {
                    newChecked = [...new Set([...newChecked, ...menuIds])];
                } else {
                    newChecked = newChecked.filter(n => !menuIds.includes(n));
                }

                return newChecked;
            });
        },
    );

    /**
     * page is indeterminate
     */
    const isPageIndeterminate = useMemoizedFn((permissions: ObjectToCamelCase<UserMenuType[]>) => {
        const menuIds = permissions.map(p => p.menuId);
        const checkedCount = checkedPermissions.filter(n => menuIds.includes(n)).length;

        return checkedCount > 0 && checkedCount < menuIds.length;
    });

    /**
     * page is checked
     */
    const isPageChecked = useMemoizedFn((permissions: ObjectToCamelCase<UserMenuType[]>) => {
        const menuIds = permissions.map(p => p.menuId);
        const checkedCount = checkedPermissions.filter(n => menuIds.includes(n)).length;

        return checkedCount === menuIds.length;
    });

    /**
     * save role permissions
     */
    const handleSave = useMemoizedFn(async () => {
        if (!activeRole) return;

        const [err, resp] = await awaitWrap(
            userAPI.distributeMenusToRole({
                role_id: activeRole.roleId,
                menu_ids: checkedPermissions,
            }),
        );

        if (err || !isRequestSuccess(resp)) {
            return;
        }

        setIsEditing(false);
        toast.success(getIntlText('common.message.operation_success'));
    });

    /**
     * Get Permission intl label text
     */
    const getPermissionLabel = useMemoizedFn((code: string) => {
        if (!code || typeof code !== 'string') return '';

        /**
         * Get code intl text key
         * eg: dashboard
         */
        const codeIntlKey = get(permissionMapIntlTextKey, code);
        if (codeIntlKey) {
            return getIntlText(codeIntlKey);
        }

        const codeLastStr = code.split('.').pop();
        if (!codeLastStr) {
            return '';
        }

        /**
         * Get code intl text key
         * eg: dashboard.view => view
         */
        const codeLastStrIntlKey = get(permissionMapIntlTextKey, codeLastStr);
        if (codeLastStrIntlKey) {
            return getIntlText(codeLastStrIntlKey);
        }

        /**
         * Get code intl text key
         * eg: device.group_manage => user.role.permission_group_manage
         */
        return getIntlText(`${PERMISSION_INTL_SIGN}${codeLastStr}`);
    });

    return {
        isEditing,
        handleEdit,
        handleCancel,
        permissions,
        getModelTableRowSpan,
        loading,
        handleFunctionsChecked,
        isDisabledFunction,
        checkedPermissions,
        handlePagesChecked,
        isPageIndeterminate,
        isPageChecked,
        handleSave,
        getPermissionLabel,
    };
};

export default useFunctions;
