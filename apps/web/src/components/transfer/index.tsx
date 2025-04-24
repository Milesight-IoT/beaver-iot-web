import React from 'react';
import { isEmpty } from 'lodash-es';

import {
    List,
    ListItemButton,
    Typography,
    ListItemIcon,
    Checkbox,
    Button,
    Divider,
} from '@mui/material';
import { ChevronLeftIcon, ChevronRightIcon } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import Empty from '../empty';
import { useTransfer } from './hooks';

import type { TransferListProps, TransferItem } from './interface';

import './style.less';

/**
 * Transfer list
 */
const TransferList: React.FC<TransferListProps> = props => {
    const { getIntlText } = useI18n();

    const {
        checked,
        left,
        right,
        leftChecked,
        rightChecked,
        handleCheckedLeft,
        handleCheckedRight,
        handleToggle,
        handleToggleAll,
        numberOfChecked,
    } = useTransfer(props);

    const renderList = (items: readonly TransferItem[]) => {
        if (!Array.isArray(items) || isEmpty(items)) {
            return <Empty text={getIntlText('common.label.empty')} />;
        }

        return items.map(({ key, title }: TransferItem) => {
            const labelId = `transfer-list-all-item-${key}-label`;

            return (
                <ListItemButton key={key} role="listitem" onClick={handleToggle({ key, title })}>
                    <ListItemIcon>
                        <Checkbox
                            checked={checked.some(c => c.key === key)}
                            tabIndex={-1}
                            disableRipple
                        />
                    </ListItemIcon>
                    <Typography id={labelId} variant="inherit" noWrap title={title}>
                        {title}
                    </Typography>
                </ListItemButton>
            );
        });
    };

    const customList = (title: React.ReactNode, items: readonly TransferItem[]) => {
        const statistics = `${numberOfChecked(items)}/${items.length}`;

        return (
            <div className="ms-transfer__list">
                <div className="ms-transfer__header">
                    <div className="ms-transfer__header-checkbox">
                        <Checkbox
                            onClick={handleToggleAll(items)}
                            checked={numberOfChecked(items) === items.length && items.length !== 0}
                            indeterminate={
                                numberOfChecked(items) !== items.length &&
                                numberOfChecked(items) !== 0
                            }
                            disabled={items.length === 0}
                        />
                    </div>
                    <div className="ms-transfer__header-text">
                        <div className="ms-transfer__header-title">{title}</div>
                        <div className="ms-transfer__header-value">
                            {statistics} {getIntlText('common.label.selected')}
                        </div>
                    </div>
                </div>
                <Divider />
                <List
                    sx={{
                        height: 288,
                        bgcolor: 'background.paper',
                        overflow: 'auto',
                        borderRadius: '6px',
                    }}
                    dense
                    component="div"
                    role="list"
                    className="ms-perfect-scrollbar"
                >
                    {renderList(items)}
                </List>
            </div>
        );
    };

    return (
        <div className="ms-transfer">
            {customList(getIntlText('common.label.choices'), left)}
            <div className="ms-transfer__operation">
                <Button
                    variant="contained"
                    disabled={Boolean(rightChecked.length === 0)}
                    sx={{ width: 32, minWidth: 32 }}
                    onClick={handleCheckedLeft}
                >
                    <ChevronLeftIcon />
                </Button>
                <Button
                    variant="contained"
                    disabled={Boolean(leftChecked.length === 0)}
                    sx={{ width: 32, minWidth: 32 }}
                    onClick={handleCheckedRight}
                >
                    <ChevronRightIcon />
                </Button>
            </div>
            {customList(getIntlText('common.label.chosen'), right)}
        </div>
    );
};

export default TransferList;
export * from './interface';
