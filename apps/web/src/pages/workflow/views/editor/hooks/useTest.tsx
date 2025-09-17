import { useCallback } from 'react';
import { get as getObjectValue } from 'lodash-es';
import { useReactFlow } from '@xyflow/react';
import { genRandomString, getObjectType } from '@milesight/shared/src/utils/tools';
import useFlowStore from '../store';
import { isRefParamKey, getUrlParams } from '../helper';
import { PARAM_REFERENCE_PATTERN_STRING } from '../constants';
import useWorkflow from './useWorkflow';

type MockDataResult = {
    type: 'string' | 'json';
    value: string;
};

const randomNumber = (num: number) => Math.floor(Math.random() * num);
const refParamPattern = new RegExp(PARAM_REFERENCE_PATTERN_STRING, 'g');

/**
 * Node Test and workflow test data generator
 */
const useTest = () => {
    const { getNodes } = useReactFlow<WorkflowNode, WorkflowEdge>();
    const nodeConfigs = useFlowStore(state => state.nodeConfigs);
    const { getReferenceParamDetail, getEntityDetail } = useWorkflow();

    /**
     * Mock value for single param
     */
    const mockValue = useCallback(
        (val: any, mocks?: any[]) => {
            const valType = getObjectType(val);
            let result: any = '';

            switch (valType) {
                case 'string': {
                    const refDetail = !isRefParamKey(val)
                        ? undefined
                        : getReferenceParamDetail(val);
                    if (!refDetail) {
                        result =
                            val?.replace(refParamPattern, '') ||
                            mocks?.[randomNumber(mocks.length)] ||
                            genRandomString(8, { lowerCase: true });
                    } else {
                        const { valueType } = refDetail;

                        switch (valueType) {
                            case 'BOOLEAN': {
                                result = Math.random() > 0.5;
                                break;
                            }
                            case 'LONG':
                            case 'DOUBLE': {
                                result = Math.floor(Math.random() * 100);
                                break;
                            }
                            default: {
                                result = genRandomString(8, { lowerCase: true });
                                break;
                            }
                        }
                    }
                    break;
                }
                case 'array': {
                    result = val.map((item: any) => mockValue(item, mocks));
                    break;
                }
                case 'object': {
                    result = Object.keys(val).reduce(
                        (acc: any, cur: string) => {
                            acc[cur] = mockValue(val[cur], mocks);
                            return acc;
                        },
                        {} as Record<string, any>,
                    );
                    break;
                }
                default: {
                    result = val;
                    break;
                }
            }

            return result;
        },
        [getReferenceParamDetail],
    );

    /**
     * Generate test data for single node test
     *
     * @description Mock based on `testInputs` in config
     */
    const genNodeTestData = useCallback(
        (node: WorkflowNode) => {
            const { type } = node;
            const { parameters } = node?.data || {};
            const { testable, testInputs } = nodeConfigs[type!] || {};

            if (!testable || !testInputs?.length) return;
            if (testInputs.length === 1 && testInputs[0].type === 'string') {
                const { key, path, mocks } = testInputs[0];
                const originValue = getObjectValue(parameters, path || key);

                return {
                    type: 'string',
                    value: mockValue(originValue, mocks),
                } as MockDataResult;
            }

            const mockData: Record<string, any> = {};
            let mockDataType: MockDataResult['type'] = 'json';
            testInputs.forEach(({ key, path, type, mocks }) => {
                const originValue = getObjectValue(parameters, path || key);

                switch (type) {
                    case 'string': {
                        mockData[key] = mockValue(originValue, mocks);
                        mockDataType = 'string';
                        break;
                    }
                    case 'array': {
                        if (!Array.isArray(originValue)) {
                            mockData[key] = mocks?.[randomNumber(mocks.length)] || [];
                        } else {
                            mockData[key] = originValue.map(item => {
                                return mockValue(item, mocks);
                            });
                        }
                        break;
                    }
                    case 'object': {
                        if (typeof originValue !== 'object') {
                            mockData[key] = mocks?.[randomNumber(mocks.length)] || {};
                        } else {
                            mockData[key] = Object.keys(originValue).reduce(
                                (acc, cur) => {
                                    acc[cur] = mockValue(originValue[cur], mocks);
                                    return acc;
                                },
                                {} as Record<string, any>,
                            );
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            });

            return {
                type: mockDataType,
                value: JSON.stringify(mockData, null, 2),
            };
        },
        [nodeConfigs, mockValue],
    );

    /**
     * Generate test data for workflow test
     *
     * @description Mock based on node type and `outputs` in config
     */
    const genWorkflowTestData = useCallback(() => {
        const nodes = getNodes();
        const entryNodeConfigs = Object.values(nodeConfigs).filter(
            ({ category }) => category === 'entry',
        );
        const entryNodeTypes = entryNodeConfigs.map(({ type }) => type);
        const entryNode = nodes.find(({ type }) => entryNodeTypes.includes(type!));
        const { outputs } = entryNodeConfigs.find(({ type }) => type === entryNode?.type) || {};

        if (!entryNode || !outputs?.length) return;
        const { parameters } = entryNode.data || {};
        const result: Record<string, any> = {};
        const mockValueByType = (type?: EntityValueDataType) => {
            switch (type) {
                case 'BOOLEAN': {
                    return Math.random() > 0.5;
                }
                case 'LONG':
                case 'DOUBLE': {
                    return randomNumber(100);
                }
                case 'ENUM': {
                    return [];
                }
                case 'OBJECT': {
                    return {};
                }
                default: {
                    return genRandomString(8, { lowerCase: true });
                }
            }
        };

        switch (entryNode.type) {
            case 'trigger': {
                const configs = parameters?.entityConfigs as NonNullable<
                    TriggerNodeDataType['parameters']
                >['entityConfigs'];

                if (!configs?.length) return result;
                configs.forEach(({ name, type }) => {
                    if (!name) return;
                    result[name] = mockValueByType(type);
                });
                break;
            }
            case 'listener': {
                const inputArgs = parameters?.entities;

                if (!inputArgs) return result;
                inputArgs.forEach((key: string) => {
                    if (!key) return;
                    const detail = getEntityDetail(key);
                    result[key] = mockValueByType(detail?.entity_value_type);
                });
                break;
            }
            // case 'mqtt': {
            //     break;
            // }
            case 'httpin': {
                const url = parameters?.url || '';
                const pathParams = getUrlParams(url);

                outputs.forEach(({ key, valueType, testable }) => {
                    if (!testable === false) return;

                    switch (key) {
                        case 'header': {
                            result[key] = JSON.stringify({
                                'Header-Key': 'Header Value',
                            });
                            break;
                        }
                        case 'params': {
                            result[key] = JSON.stringify({
                                exampleKey: 'Example Value',
                            });
                            break;
                        }
                        case 'pathParam': {
                            result.url = url;
                            if (pathParams.length) {
                                pathParams.forEach(item => {
                                    result[`${key}.${item}`] = mockValueByType();
                                });
                            }
                            break;
                        }
                        default: {
                            result[key] = mockValueByType(valueType);
                            break;
                        }
                    }
                });
                break;
            }
            default: {
                outputs.forEach(({ key, path, valueType, testable }) => {
                    if (!testable === false) return;
                    const originValue = getObjectValue(parameters, path || key);

                    result[key] = originValue || mockValueByType(valueType);
                });
                break;
            }
        }

        return result;
    }, [nodeConfigs, getNodes, getEntityDetail]);

    return {
        /**
         * Generate test data for single node test
         */
        genNodeTestData,
        /**
         * Generate test data for workflow test
         */
        genWorkflowTestData,
    };
};

export default useTest;
