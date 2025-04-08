import { forwardRef, useImperativeHandle } from 'react';
import useDropzone from './useDropzone';
import { DropzoneRef, DropzoneProps } from './typings';

const Dropzone = forwardRef<DropzoneRef, DropzoneProps>(({ children, ...params }, ref) => {
    const { open, ...props } = useDropzone(params);

    useImperativeHandle(ref, () => ({ open }), [open]);

    return <>{children(props)}</>;
});

Dropzone.displayName = 'Dropzone';
export default Dropzone;
