import React from 'react';
import type { FileWithPath } from 'file-selector';

export type { FileWithPath };

export type ErrorCodeType =
    | 'file_invalid_type'
    | 'file_too_large'
    | 'file_too_small'
    | 'too_many_files'
    | 'server_error';

export interface FileError {
    message: React.ReactNode;
    code: ErrorCodeType;
}

export interface FileRejection {
    file: FileWithPath;
    errors: readonly FileError[];
}

export type DropEvent =
    | React.DragEvent<HTMLElement>
    | React.ChangeEvent<HTMLInputElement>
    | DragEvent
    | Event
    | Array<FileSystemFileHandle>;

export interface UseDropzoneProps {
    /**
     * Set accepted file types
     */
    accept?: Record<string, string[]>;

    /**
     * Enable or disable multiple file upload
     */
    multiple?: boolean;

    /**
     * Maximum number of files that can be uploaded
     */
    maxFiles?: number;

    /**
     * Minimum file size (in bytes)
     */
    minSize?: number;

    /**
     * Maximum file size (in bytes)
     */
    maxSize?: number;

    /**
     * Enable or disable the dropzone
     */
    disabled?: boolean;

    /**
     * Prevent dropped items to take over the current browser window
     */
    preventDropOnDocument?: boolean;

    /**
     * Enable or disable click to open the native file selection dialog
     */
    noClick?: boolean;

    /**
     * Enable or disable SPACE/ENTER to open the native file selection dialog
     */
    noKeyboard?: boolean;

    /**
     * Enable or disable drag and drop
     */
    noDrag?: boolean;

    /**
     * Prevent drag events bubbling up to parents
     */
    noDragEventsBubbling?: boolean;

    /**
     * Callback for when the `dragenter` event occurs
     */
    onDragEnter?: (e: DragEvent) => void;

    /**
     * Callback for when the `dragover` event occurs
     */
    onDragOver?: (e: DragEvent) => void;

    /**
     * Callback for when the `dragleave` event occurs
     */
    onDragLeave?: (e: DragEvent) => void;

    /**
     * Use this to provide a custom file aggregator
     * @param event A drag event or input change event (if files were selected via the file dialog)
     */
    getFilesFromEvent?: (event: DropEvent) => Promise<Array<File | DataTransferItem>>;

    /**
     * Callback for when the file dialog opens
     */
    onFileDialogOpen?: () => void;

    /**
     * Callback for when the file dialog closes
     */
    onFileDialogCancel?: () => void;

    /**
     * Callback for when the `drop` event occurs
     */
    onDrop?: <T extends File>(
        acceptedFiles: T[],
        fileRejections: FileRejection[],
        event: DropEvent,
    ) => void;

    /**
     * Callback for when the `drop` event occurs.
     * Note that if no files are accepted, this callback is not invoked.
     */
    onDropAccepted?: <T extends File>(files: T[], event: DropEvent) => void;

    /**
     * Callback for when the `drop` event occurs.
     * Note that if no files are rejected, this callback is not invoked.
     */
    onDropRejected?: (fileRejections: FileRejection[], event: DropEvent) => void;

    /**
     * Callback for when there's some error from any of the promises
     */
    onError?: (err: Error) => void;

    /**
     * Custom validation function. It must return null if there's no errors.
     */
    validator?: <T extends File>(file: T) => FileError | readonly FileError[] | null;
}

export interface DropzoneRootProps extends React.HTMLAttributes<HTMLElement> {
    refKey?: string;
    [key: string]: any;
}

export interface DropzoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    refKey?: string;
}

export type DropzoneState = {
    /**
     * Indicates whether the dropzone is currently focused.
     */
    isFocused?: boolean;
    /**
     * Indicates whether the dropzone is currently dragging.
     */
    isDragActive?: boolean;
    /**
     * Indicates whether the dropzone is currently accepting files.
     */
    isDragAccept?: boolean;
    /**
     * Indicates whether the dropzone is currently rejecting files.
     */
    isDragReject?: boolean;
    /**
     * Indicates whether the file dialog is currently active.
     */
    isFileDialogActive?: boolean;
    /**
     * The files that are currently accepted.
     */
    acceptedFiles?: readonly FileWithPath[];
    /**
     * The files that are currently rejected.
     */
    fileRejections?: readonly FileRejection[];
    // rootRef: React.RefObject<HTMLElement>;
    // inputRef: React.RefObject<HTMLInputElement>;
    // getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
    // getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
};

export interface DropzoneProps extends UseDropzoneProps {
    children(
        state: DropzoneState & {
            rootRef: React.RefObject<HTMLElement>;
            inputRef: React.RefObject<HTMLInputElement>;
            getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
            getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
        },
    ): React.ReactElement;
}

export interface DropzoneRef {
    open: () => void;
}
