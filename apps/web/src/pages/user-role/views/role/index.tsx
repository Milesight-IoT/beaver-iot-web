import React, { useCallback } from 'react';
import { isEmpty, isNil } from 'lodash-es';
import classNames from 'classnames';
import { Button, OutlinedInput, InputAdornment, Typography } from '@mui/material';

import {
    AddIcon,
    SearchIcon,
    PermIdentityIcon,
    LoadingWrapper,
    PerfectScrollbar,
} from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { Empty } from '@/components';
import { type RoleType } from '@/services/http';

import { MoreDropdown, AddRoleModal, RoleBody } from './components';
import { useRole } from './hooks';
import { MODAL_TYPE } from './constants';

import styles from './style.module.less';

/**
 * Role Module
 */
const Role: React.FC = () => {
    const { getIntlText } = useI18n();
    const {
        roleData,
        activeRole,
        handleRoleClick,
        handleAddRole,
        handleSearch,
        handleRoleOperate,
        addModalVisible,
        setAddModalVisible,
        showAddModal,
        modalTitles,
        modalData,
        modalType,
        handleEditRole,
        loading,
        searchKeyword,
    } = useRole();

    const roleItemCls = useCallback(
        (currentItem: ObjectToCamelCase<RoleType>) => {
            return classNames(styles.item, {
                [styles.active]: currentItem.roleId === activeRole?.roleId,
            });
        },
        [activeRole],
    );

    const renderRoleItem = (item: ObjectToCamelCase<RoleType>) => {
        return (
            <div
                key={item.roleId}
                className={roleItemCls(item)}
                onClick={() => handleRoleClick(item)}
            >
                <div className={styles['name-wrapper']}>
                    <div className={styles.icon}>
                        <PermIdentityIcon color="action" />
                    </div>

                    <Typography variant="inherit" noWrap title={item.name}>
                        {item.name}
                    </Typography>
                </div>

                <MoreDropdown
                    onOperation={handleRoleOperate}
                    isActive={item.roleId === activeRole?.roleId}
                />
            </div>
        );
    };

    const renderRole = () => {
        if ((!Array.isArray(roleData) || isEmpty(roleData)) && isNil(searchKeyword)) {
            return (
                <div className={styles.empty}>
                    <LoadingWrapper loading={loading}>
                        {!loading && (
                            <Empty
                                text={getIntlText('user.message.not_data_roles_tip')}
                                extra={
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => showAddModal(MODAL_TYPE.ADD)}
                                    >
                                        {getIntlText('user.label.add_role')}
                                    </Button>
                                }
                            />
                        )}
                    </LoadingWrapper>
                </div>
            );
        }

        const renderRoleList = () => {
            if (!Array.isArray(roleData) || isEmpty(roleData) || loading) {
                return (
                    <LoadingWrapper loading={loading}>
                        <div className={styles['empty-role']}>
                            {!loading && <Empty text={getIntlText('common.label.empty')} />}
                        </div>
                    </LoadingWrapper>
                );
            }

            return roleData.map(data => renderRoleItem(data));
        };

        return (
            <>
                <div className={classNames(styles.aside, 'md:d-none')}>
                    <OutlinedInput
                        placeholder="Search"
                        sx={{ width: 200, height: 40 }}
                        onChange={e => handleSearch?.(e.target.value)}
                        startAdornment={
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        }
                    />

                    <PerfectScrollbar className={styles['role-container']}>
                        {renderRoleList()}
                    </PerfectScrollbar>

                    <div className={styles['add-btn']}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => showAddModal(MODAL_TYPE.ADD)}
                        >
                            {getIntlText('common.label.add')}
                        </Button>
                    </div>
                </div>
                <div className={styles.main}>
                    <RoleBody />
                </div>
            </>
        );
    };

    return (
        <div className={styles['role-view']}>
            {renderRole()}

            <AddRoleModal
                visible={addModalVisible}
                onCancel={() => setAddModalVisible(false)}
                onFormSubmit={modalType === MODAL_TYPE.ADD ? handleAddRole : handleEditRole}
                data={modalData}
                title={modalTitles}
            />
        </div>
    );
};

export default Role;
