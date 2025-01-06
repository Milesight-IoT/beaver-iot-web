import React from 'react';

import { useI18n } from '@milesight/shared/src/hooks';
import { COMMON_EDITOR_HEADER_CLASS, type EditorToolbarProps } from '@/components';

import PreviousNodeSelect from '../previous-node-select';

import styles from './style.module.less';

/** insert string prefix */
const PREFIX = '${';
/** insert string suffix */
const SUFFIX = '}';

/**
 *  content header component
 */
const ContentHeader: React.FC<EditorToolbarProps> = props => {
    const { editorHandlers } = props;
    const { insert } = editorHandlers || {};

    const { getIntlText } = useI18n();

    return (
        <div className={`${styles['content-header']} ${COMMON_EDITOR_HEADER_CLASS}`}>
            <div className={styles.text}>{getIntlText('common.label.content')}</div>
            <PreviousNodeSelect onSelect={nodeKey => insert(`${PREFIX}${nodeKey}${SUFFIX}`)} />
        </div>
    );
};

export default ContentHeader;
