import React from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { Menu, MenuItem } from '@mui/material';

import { ToolbarPart } from '../toolbar-part';
import { BlockTypeOptions, BLOCK_TYPE } from './constant';
import { useBlockFormat } from './hooks';
import { ExpandMoreIcon, CheckIcon } from '../../../../../icons';
import './style.less';

interface IProps {
    /** Whether to disable */
    disabled: boolean;
}
export default React.memo(({ disabled }: IProps) => {
    const { blockType, onChange } = useBlockFormat();

    const renderMenuItemByBlockType = (blockType: BLOCK_TYPE, label: string) => {
        const blockTypeMap = {
            [BLOCK_TYPE.PARAGRAPH]: <span>{label}</span>,
            [BLOCK_TYPE.HEADING_1]: <h1>{label}</h1>,
            [BLOCK_TYPE.HEADING_2]: <h2>{label}</h2>,
            [BLOCK_TYPE.HEADING_3]: <h3>{label}</h3>,
        };

        return Reflect.get(blockTypeMap, blockType, label);
    };

    return (
        <PopupState variant="popper" popupId="block-type-menu">
            {state => (
                <div className="ms-toolbar__block-type">
                    <ToolbarPart
                        {...bindTrigger(state)}
                        className="ms-toolbar__block-dropdown"
                        disabled={disabled}
                    >
                        <span>{BlockTypeOptions.find(t => t.value === blockType)?.label}</span>
                        <ExpandMoreIcon />
                    </ToolbarPart>
                    <Menu {...bindMenu(state)} className="toolbar-size__menu">
                        {BlockTypeOptions.map(item => {
                            return (
                                <MenuItem
                                    disabled={disabled}
                                    key={item.value}
                                    selected={blockType === item.value}
                                    onClick={() => {
                                        onChange(item.value);
                                        state.close();
                                    }}
                                >
                                    <div className="ms-toolbar__block-item">
                                        {renderMenuItemByBlockType(item.value, item.label)}
                                        {item.value === blockType && <CheckIcon color="primary" />}
                                    </div>
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </div>
            )}
        </PopupState>
    );
});
