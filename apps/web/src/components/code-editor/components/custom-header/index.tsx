import React from 'react';
import EditorHeader from '../header';
import type { EditorProps, EditorToolbarProps } from '../../types';

export default React.memo((props: EditorToolbarProps & Pick<EditorProps, 'renderHeader'>) => {
    const { renderHeader, ...rest } = props;

    if (renderHeader) return renderHeader(rest);
    return <EditorHeader {...rest} />;
});
