import React, { useEffect, useMemo, useRef } from 'react';
import { cloneDeep } from 'lodash-es';
import { Chart } from 'chart.js';

const createSandbox = (sharedState: string[], injectedObjects = {}) => {
    let iframe = document.getElementById('sandbox') as HTMLIFrameElement;
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'sandbox';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }

    const ctx = iframe.contentWindow; // 沙箱运行时的全局对象
    if (!ctx) return;

    const store: Record<string, any> = {};
    for (const [key, value] of Object.entries(injectedObjects)) {
        store[key] = value;
    }
    (ctx as any).store = store;

    return new Proxy(ctx, {
        has: (target, key: string) => {
            return key in target || sharedState.includes(key);
        },
        get: (target: Record<string, any>, key: string) => {
            if (sharedState.includes(key)) {
                return target[key];
            }
            return undefined;
        },
        set: (target: Record<string, any>, key: string, value) => {
            if (sharedState.includes(key)) {
                target[key] = value;
                return true;
            }
            return false;
        },
    });
};

/** 动态执行脚本生成数据 */
function executeScriptsInObject(obj: Record<string, any>, injectData: any) {
    const executeScript = (script: string) => {
        const sandbox = createSandbox(['store', 'console'], injectData);
        const code = `with (ctx) { return (${script})(ctx.store); }`;
        // eslint-disable-next-line no-new-func
        const fn = new Function('ctx', code);
        return fn(sandbox);
    };

    const traverse = (currentObj: Record<string, any>) => {
        if (typeof currentObj !== 'object' || currentObj === null) {
            return currentObj;
        }

        // 递归遍历对象的所有属性
        for (const key in currentObj) {
            if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
                if (key === '$exec' && typeof currentObj[key] === 'string') {
                    // 执行脚本并替换当前属性
                    currentObj = executeScript(currentObj[key]);
                } else {
                    currentObj[key] = traverse(currentObj[key]);
                }
            }
        }

        return currentObj;
    };

    return traverse(obj);
}
interface IProps {
    injectData: any;
    tagProps: ViewProps;
    children: React.ReactElement;
}
export default React.memo(({ injectData, tagProps, children, ...rest }: IProps) => {
    const chartRef = useRef<HTMLCanvasElement>(null);

    const chartConfiguration = useMemo(() => {
        const { chartOptions } = tagProps || {};

        return executeScriptsInObject(cloneDeep(chartOptions), injectData) as Chart['config'];
    }, [injectData, tagProps]);

    useEffect(() => {
        // 生成图表
        try {
            const ref = chartRef.current;
            const chart: Chart | null = ref ? new Chart(ref, chartConfiguration) : null;

            return () => {
                /**
                 * 清空图表数据
                 */
                chart?.destroy();
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }, [chartConfiguration, chartRef]);

    return (
        <canvas ref={chartRef} {...rest}>
            {children}
        </canvas>
    );
});
