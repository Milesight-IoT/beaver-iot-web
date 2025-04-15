import React, { useState, useEffect } from 'react';
import DataEditor from '../data-editor';

interface Props {
    title?: string;
    data?: Record<string, any>;
}

const HttpCurlInfo: React.FC<Props> = ({ title, data }) => {
    const [command, setCommand] = useState('');
    // TODO: Get credential info and generate curl command

    useEffect(() => {
        console.log('form data', data);
        setCommand('// TODO: generate curl command');
    }, [data]);

    return (
        <div className="ms-http-curl-info">
            <DataEditor
                readonly
                title="cUrl"
                lang="text"
                extendable={false}
                variableSelectable={false}
                value={command}
            />
        </div>
    );
};

export default HttpCurlInfo;
