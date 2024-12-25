import { isFileName } from '@milesight/shared/src/utils/tools';

// 手动导入所有需要的模块

// import TriggerConfigure from '../plugins/trigger/configure/index';
// import TriggerView from '../plugins/trigger/view/index';

// 模拟 import.meta.glob 的模块对象
const modules = {
   
    // 'trigger/configure': TriggerConfigure,
    // 'trigger/view': TriggerView,
};

// 提取子文件夹名的函数
const getFolderName = (modules: { [key: string]: any }) => {
    return Object.keys(modules).reduce((bucket, path) => {
        const [folder] = path.split('/');
        if (!folder || bucket.includes(folder) || isFileName(folder)) return bucket;

        bucket.push(folder);
        return bucket;
    }, [] as string[]);
};

const folderNames = getFolderName(modules);

export default folderNames;
