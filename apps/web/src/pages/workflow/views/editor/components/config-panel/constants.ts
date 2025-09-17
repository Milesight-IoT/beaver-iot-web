import { type EditorSupportLang } from '@/components';

const DEFAULT_JS_VALUE = `
return {
  result: arg1 + arg2,
};
`;

const DEFAULT_PYTHON_VALUE = `
def main():
  return {
    "result": arg1 + arg2,
  }
`;

const DEFAULT_GROOVY_VALUE = `
map = [:];
map["result"] = arg1+arg2;
return map;
`;

const DEFAULT_MVEL_VALUE = `
map = [:];
map["result"] = arg1+arg2;
return map;
`;

/**
 * Code Expression Default Value
 */
export const CODE_EXPRESSION_DEFAULT_VALUE: Partial<Record<EditorSupportLang, string>> = {
    js: DEFAULT_JS_VALUE.trim(),
    python: DEFAULT_PYTHON_VALUE.trim(),
    groovy: DEFAULT_GROOVY_VALUE.trim(),
    mvel: DEFAULT_MVEL_VALUE.trim(),
};

/**
 * Node Form Default Values
 */
export const DEFAULT_VALUES: Partial<Record<WorkflowNodeType, Record<string, any>>> = {
    httpin: {
        method: 'POST',
        url: '',
    },
    service: {
        payload: [],
    },
    select: {
        entities: [''],
    },
    code: {
        inputArguments: {
            arg1: '',
            arg2: '',
        },
        expression: {
            language: 'js',
            expression: CODE_EXPRESSION_DEFAULT_VALUE.js,
        },
        payload: [
            {
                name: 'result',
                type: 'STRING',
            },
        ],
    },
    http: {
        method: 'POST',
        url: '',
    },
    email: {
        emailConfig: {
            useSystemSettings: true,
        },
    },
    webhook: {
        inputArguments: {},
    },
    mqtt: {
        encoding: 'UTF-8',
    },
};
