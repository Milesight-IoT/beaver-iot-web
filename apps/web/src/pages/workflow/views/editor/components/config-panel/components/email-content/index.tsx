import React from 'react';
import { useControllableValue } from 'ahooks';

import { CodeEditor } from '@/components';

import { ContentHeader } from './components';

import styles from './style.module.less';

export interface EmailContentProps {
    value?: string;
    onChange: (value: string) => void;
}

/**
 * Email Notify Node
 * The Email Content Enter Component
 */
const EmailContent: React.FC<EmailContentProps> = props => {
    const { value, onChange } = props;

    const [content, setContent] = useControllableValue({
        value: value || '',
        onChange,
    });

    return (
        <div className={styles['email-content']}>
            <CodeEditor
                editorLang="text"
                value={content}
                renderHeader={ContentHeader}
                onChange={setContent}
            />
        </div>
    );
};

export default EmailContent;
