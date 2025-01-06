import React, { useLayoutEffect } from 'react';
import cls from 'classnames';
import { isEqual, cloneDeep, merge } from 'lodash-es';
import { useDynamicList, useControllableValue } from 'ahooks';
import {
    ToggleButtonGroup,
    ToggleButton,
    Button,
    IconButton,
    Chip,
    Select,
    MenuItem,
    TextField,
    Tooltip,
} from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    AddIcon,
    DeleteOutlineIcon,
    InputIcon,
    CodeIcon,
    SyncIcon,
    KeyboardArrowDownIcon,
} from '@milesight/shared/src/components';
import { genUuid } from '../../../../helper';
import { logicOperatorMap, conditionOperatorMap } from '../../../../constants';
import ParamSelect from '../param-select';
import './style.less';

export type ConditionsInputValueType = NonNullable<IfElseNodeDataType['parameters']>['choice'];

type ConditionBlockValueType = ConditionsInputValueType['when'][number];

type ConditionValueType = ConditionBlockValueType['conditions'][number];

export type ConditionsInputProps = {
    value?: ConditionsInputValueType;
    defaultValue?: ConditionsInputValueType;
    onChange?: (value: ConditionsInputValueType) => void;
};

const genConditionValue = (): ConditionValueType => {
    return { id: genUuid('subcondition') };
};

const genConditionBlockValue = (): ConditionBlockValueType => {
    return {
        id: genUuid('condition'),
        logicOperator: 'AND',
        expressionType: 'condition',
        conditions: [genConditionValue()],
    };
};

const DEFAULT_CONDITION_BLOCK_VALUE = genConditionBlockValue();

const MAX_CONDITIONS_NUMBER = 5;
const MAX_CONDITION_BLOCKS_NUMBER = 5;

/**
 * Conditions Input Component
 *
 * Note: use in IfelseNode
 */
const ConditionsInput: React.FC<ConditionsInputProps> = props => {
    const { getIntlText, getIntlHtml } = useI18n();
    const [data, setData] = useControllableValue<ConditionsInputValueType>(props);
    // const otherwiseId = useRef<string>('');
    const {
        list: blockList,
        remove: removeBlock,
        getKey: getBlockKey,
        insert: insertBlock,
        replace: replaceBlock,
        resetList: resetBlockList,
    } = useDynamicList<ConditionBlockValueType>([DEFAULT_CONDITION_BLOCK_VALUE]);

    // console.log({ blockList });
    const handleExpTypeChange = (block: ConditionBlockValueType, blockIndex: number) => {
        const { expressionType } = block;
        const newExpType = expressionType === 'condition' ? 'mvel' : 'condition';

        replaceBlock(blockIndex, {
            ...block,
            expressionType: newExpType,
            conditions: [genConditionValue()],
        });
    };

    const handleLogicOperatorChange = (block: ConditionBlockValueType, blockIndex: number) => {
        let { logicOperator } = block;

        logicOperator = logicOperator === 'AND' ? 'OR' : 'AND';
        replaceBlock(blockIndex, { ...block, logicOperator });
    };

    const removeCondition = (index: number, block: ConditionBlockValueType, blockIndex: number) => {
        const conditions = cloneDeep(block.conditions || []);

        conditions.splice(index, 1);
        replaceBlock(blockIndex, { ...block, conditions });
    };

    const insertCondition = (
        index: number,
        condition: ConditionValueType,
        block: ConditionBlockValueType,
        blockIndex: number,
    ) => {
        const conditions = cloneDeep(block.conditions || []);

        conditions.splice(index, 0, condition);
        replaceBlock(blockIndex, { ...block, conditions });
    };

    const replaceCondition = (
        index: number,
        condition: Partial<ConditionValueType>,
        block: ConditionBlockValueType,
        blockIndex: number,
    ) => {
        const conditions = cloneDeep(block.conditions || []);

        conditions.splice(index, 1, merge(conditions[index], condition));
        replaceBlock(blockIndex, { ...block, conditions });
    };

    const checkEmptyOperator = (condition: ConditionValueType) => {
        const emptyOperators: WorkflowFilterOperator[] = ['IS_EMPTY', 'IS_NOT_EMPTY'];
        const { expressionValue } = condition;

        return (
            typeof expressionValue !== 'string' &&
            emptyOperators.includes(expressionValue?.operator as WorkflowFilterOperator)
        );
    };

    useLayoutEffect(() => {
        if (!data?.when?.length) return;
        if (isEqual(data.when, blockList)) return;
        resetBlockList(data.when);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetBlockList]);

    useLayoutEffect(() => {
        setData(d => {
            const otherwiseId = `${d?.otherwise?.id || ''}` || genUuid('condition');
            const result = {
                when: blockList,
                otherwise: {
                    id: otherwiseId,
                },
            };
            return result;
        });
    }, [blockList, setData]);

    return (
        <div className="ms-conditions-input">
            {blockList.map((block, blockIndex) => {
                const { conditions, logicOperator, expressionType } = block;
                const isMultipleConditions = conditions?.length > 1;
                const tipKeyword =
                    logicOperator === 'OR'
                        ? getIntlText(logicOperatorMap.AND?.labelIntlKey || '')
                        : getIntlText(logicOperatorMap.OR?.labelIntlKey || '');

                return (
                    <div
                        className="ms-conditions-input-item"
                        key={getBlockKey(blockIndex) || blockIndex}
                    >
                        <div className="ms-conditions-input-item-topbar">
                            <div className="name">
                                {blockIndex === 0
                                    ? getIntlText('workflow.label.logic_keyword_if')
                                    : getIntlText('workflow.label.logic_keyword_elseif')}
                            </div>
                            <div className="btns">
                                <ToggleButtonGroup
                                    size="small"
                                    value={expressionType}
                                    onChange={() => handleExpTypeChange(block, blockIndex)}
                                >
                                    <ToggleButton disableRipple value="condition">
                                        <InputIcon />
                                    </ToggleButton>
                                    <ToggleButton disableRipple value="mvel">
                                        <CodeIcon />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                {blockList.length > 1 && (
                                    <IconButton onClick={() => removeBlock(blockIndex)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                )}
                            </div>
                        </div>
                        {expressionType === 'mvel' ? (
                            <div className="ms-conditions-input-item-mvel">
                                <TextField
                                    fullWidth
                                    multiline
                                    autoComplete="off"
                                    rows={5}
                                    sx={{ marginTop: 0 }}
                                    value={conditions[0]?.expressionValue || ''}
                                    onChange={e =>
                                        replaceCondition(
                                            0,
                                            {
                                                expressionValue: e.target.value,
                                            },
                                            block,
                                            blockIndex,
                                        )
                                    }
                                />
                                <TextField
                                    fullWidth
                                    autoComplete="off"
                                    placeholder="Condition Description"
                                    value={conditions[0]?.expressionDescription || ''}
                                    onChange={e =>
                                        replaceCondition(
                                            0,
                                            {
                                                expressionDescription: e.target.value,
                                            },
                                            block,
                                            blockIndex,
                                        )
                                    }
                                />
                            </div>
                        ) : (
                            <div
                                className={cls('ms-conditions-input-item-conditions', {
                                    'multiple-conditions': isMultipleConditions,
                                })}
                            >
                                {isMultipleConditions && (
                                    <div className="logic-operator">
                                        <Tooltip
                                            enterDelay={300}
                                            enterNextDelay={300}
                                            title={getIntlHtml(
                                                'workflow.editor.form_logic_operator_switch_tip',
                                                { 1: tipKeyword },
                                            )}
                                        >
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={
                                                    <>
                                                        {getIntlText(
                                                            logicOperatorMap[logicOperator]
                                                                ?.labelIntlKey || '',
                                                        )}
                                                        <SyncIcon />
                                                    </>
                                                }
                                                onClick={() =>
                                                    handleLogicOperatorChange(block, blockIndex)
                                                }
                                            />
                                        </Tooltip>
                                    </div>
                                )}
                                {conditions.map((condition, index) => {
                                    const { expressionValue } = condition;

                                    if (typeof expressionValue === 'string') return null;
                                    return (
                                        <div className="field-item" key={condition.id}>
                                            <div
                                                className={cls('input-wrapper', {
                                                    'hidden-value-input':
                                                        checkEmptyOperator(condition),
                                                })}
                                            >
                                                <div className="select">
                                                    <ParamSelect
                                                        label=""
                                                        value={`${expressionValue?.key || ''}`}
                                                        onChange={e =>
                                                            replaceCondition(
                                                                index,
                                                                {
                                                                    expressionValue: {
                                                                        key: e.target.value,
                                                                    },
                                                                },
                                                                block,
                                                                blockIndex,
                                                            )
                                                        }
                                                    />
                                                    <Select
                                                        defaultValue=""
                                                        placeholder="Condition"
                                                        labelId="param-select-label"
                                                        IconComponent={KeyboardArrowDownIcon}
                                                        MenuProps={{
                                                            className: 'ms-param-select-menu',
                                                        }}
                                                        value={expressionValue?.operator || ''}
                                                        onChange={e =>
                                                            replaceCondition(
                                                                index,
                                                                {
                                                                    expressionValue: {
                                                                        operator: e.target
                                                                            .value as WorkflowFilterOperator,
                                                                    },
                                                                },
                                                                block,
                                                                blockIndex,
                                                            )
                                                        }
                                                    >
                                                        {Object.entries(conditionOperatorMap).map(
                                                            ([key, oprt]) => (
                                                                <MenuItem key={key} value={key}>
                                                                    {getIntlText(oprt.labelIntlKey)}
                                                                </MenuItem>
                                                            ),
                                                        )}
                                                    </Select>
                                                </div>
                                                <TextField
                                                    fullWidth
                                                    autoComplete="off"
                                                    placeholder={getIntlText('common.label.value')}
                                                    value={expressionValue?.value || ''}
                                                    onChange={e => {
                                                        replaceCondition(
                                                            index,
                                                            {
                                                                expressionValue: {
                                                                    value: e.target.value,
                                                                },
                                                            },
                                                            block,
                                                            blockIndex,
                                                        );
                                                    }}
                                                />
                                            </div>
                                            {isMultipleConditions && (
                                                <IconButton
                                                    onClick={() =>
                                                        removeCondition(index, block, blockIndex)
                                                    }
                                                >
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            )}
                                        </div>
                                    );
                                })}
                                <Button
                                    variant="outlined"
                                    className="ms-conditions-input-add-btn"
                                    startIcon={<AddIcon />}
                                    disabled={conditions.length >= MAX_CONDITIONS_NUMBER}
                                    onClick={() =>
                                        insertCondition(
                                            conditions.length,
                                            genConditionValue(),
                                            block,
                                            blockIndex,
                                        )
                                    }
                                >
                                    {getIntlText('workflow.editor.form_button_add_condition')}
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
            <Button
                fullWidth
                variant="outlined"
                className="ms-conditions-input-add-btn"
                startIcon={<AddIcon />}
                disabled={blockList.length >= MAX_CONDITION_BLOCKS_NUMBER}
                onClick={() => insertBlock(blockList.length, genConditionBlockValue())}
            >
                {getIntlText('workflow.label.logic_keyword_elseif')}
            </Button>
        </div>
    );
};

export default React.memo(ConditionsInput);
