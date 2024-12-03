import React from 'react';
import { camelCase } from 'lodash-es';
import { isFileName } from '@milesight/shared/src/utils/tools';

const modules = (() => {
    const getModuleFiles = (modules: ModuleType, suffix?: string) => {
        let bucket = {};
        for (const path of Object.keys(modules)) {
            const component = React.lazy(modules[path]);

            const [, folder] = path?.split('/') || [];
            if (!folder || folder in bucket || isFileName(folder)) continue;

            const name = camelCase(folder) + (suffix || '');
            bucket = { ...bucket, [name]: component };
        }
        return bucket;
    };

    const configureModules = import.meta.glob('../plugins/*/configure/index.tsx');
    const viewModules = import.meta.glob('../plugins/*/view/index.tsx');

    const configFiles = getModuleFiles(configureModules, 'Config');
    const viewFiles = getModuleFiles(viewModules, 'View');
    return { ...configFiles, ...viewFiles };
})();

export default modules;
