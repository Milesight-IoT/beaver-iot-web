import { memo, useEffect, useState } from 'react';
import './style.less';

export interface ViewProps {
    config: {
        src?: string;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const View = (props: ViewProps) => {
    const { config } = props;
    const { src='https://example.com' } = config || {};

    const [key, setKey] = useState(0);

    // 当src变化时更新key值
    useEffect(() => {
        setKey(prevKey => prevKey + 1);
    }, [src]);

    return (
        <iframe
            key={key}  // 通过改变key强制重新创建iframe
            src={src}
            width="100%"
            height="800px"
            title="这是一个demo"
            className=''
            allowFullScreen
        />
    );
};

export default memo(View);
