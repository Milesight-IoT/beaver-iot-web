import React, { useMemo, useRef, useReducer, useEffect, useCallback } from 'react';
import { fromEvent } from 'file-selector';
import { noop } from 'lodash-es';
import { isIEorEdge } from '@milesight/shared/src/utils/userAgent';
import {
    acceptPropAsAcceptAttr,
    pickerOptionsFromAccept,
    canUseFileSystemAccessAPI,
    handleDocumentDragOver,
    isEvtWithFiles,
    isPropagationStopped,
    allFilesAccepted,
    fileAccepted,
    fileMatchSize,
    composeEventHandlers,
    TOO_MANY_FILES_REJECTION,
    isAbort,
    isSecurityError,
} from './helper';
import {
    UseDropzoneProps,
    DropzoneState,
    FileWithPath,
    FileRejection,
    DropzoneRootProps,
    DropzoneInputProps,
} from './typings';

const initialState = {
    isFocused: false,
    isFileDialogActive: false,
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
    acceptedFiles: [],
    fileRejections: [],
};

// Add default props for react-docgen
const defaultProps = {
    disabled: false,
    getFilesFromEvent: fromEvent,
    maxSize: Infinity,
    minSize: 0,
    multiple: true,
    maxFiles: 0,
    preventDropOnDocument: true,
    noClick: false,
    noKeyboard: false,
    noDrag: false,
    noDragEventsBubbling: false,
    useFsAccessApi: false,
    autoFocus: false,
};

/**
 * State Reducer
 * @param {DropzoneState} state
 * @param {{type: string} & DropzoneState} action
 * @returns {DropzoneState}
 */
function reducer(state: DropzoneState, action: DropzoneState & { type: string }) {
    switch (action.type) {
        case 'focus':
            return {
                ...state,
                isFocused: true,
            };
        case 'blur':
            return {
                ...state,
                isFocused: false,
            };
        case 'openDialog':
            return {
                ...initialState,
                isFileDialogActive: true,
            };
        case 'closeDialog':
            return {
                ...state,
                isFileDialogActive: false,
            };
        case 'setDraggedFiles':
            return {
                ...state,
                isDragActive: action.isDragActive,
                isDragAccept: action.isDragAccept,
                isDragReject: action.isDragReject,
            };
        case 'setFiles':
            return {
                ...state,
                acceptedFiles: action.acceptedFiles,
                fileRejections: action.fileRejections,
                isDragReject: action.isDragReject,
            };
        case 'reset':
            return {
                ...initialState,
            };
        default:
            return state;
    }
}

/**
 * Hook for Dropzone
 */
const useDropzone = (props?: UseDropzoneProps) => {
    const {
        accept,
        disabled,
        getFilesFromEvent,
        maxSize,
        minSize,
        multiple,
        maxFiles,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
        onDropAccepted,
        onDropRejected,
        onFileDialogOpen,
        onFileDialogCancel,
        useFsAccessApi,
        autoFocus,
        preventDropOnDocument,
        noClick,
        noKeyboard,
        noDrag,
        noDragEventsBubbling,
        onError,
        validator,
    } = {
        ...defaultProps,
        ...props,
    };

    const acceptAttr = useMemo(() => acceptPropAsAcceptAttr(accept), [accept]);
    const pickerTypes = useMemo(() => pickerOptionsFromAccept(accept), [accept]);

    const handleFileDialogOpen = useMemo(
        () => (typeof onFileDialogOpen === 'function' ? onFileDialogOpen : noop),
        [onFileDialogOpen],
    );
    const handleFileDialogCancel = useMemo(
        () => (typeof onFileDialogCancel === 'function' ? onFileDialogCancel : noop),
        [onFileDialogCancel],
    );

    const rootRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [state, dispatch] = useReducer(reducer, initialState);
    const { isFocused, isFileDialogActive } = state;

    const fsAccessApiWorksRef = useRef(
        typeof window !== 'undefined' &&
            window.isSecureContext &&
            useFsAccessApi &&
            canUseFileSystemAccessAPI(),
    );

    // Update file dialog active state when the window is focused on
    const onWindowFocus = useCallback(() => {
        // Execute the timeout only if the file dialog is opened in the browser
        if (!fsAccessApiWorksRef.current && isFileDialogActive) {
            setTimeout(() => {
                if (inputRef.current) {
                    const { files } = inputRef.current;

                    if (!files?.length) {
                        dispatch({ type: 'closeDialog' });
                        handleFileDialogCancel();
                    }
                }
            }, 300);
        }
    }, [isFileDialogActive, handleFileDialogCancel]);

    useEffect(() => {
        window.addEventListener('focus', onWindowFocus, false);
        return () => {
            window.removeEventListener('focus', onWindowFocus, false);
        };
    }, [inputRef, isFileDialogActive, onFileDialogCancel, fsAccessApiWorksRef, onWindowFocus]);

    const dragTargetsRef = useRef<HTMLElement[]>([]);
    const handleDocumentDrop = (event: DragEvent) => {
        if (rootRef.current && rootRef.current.contains(event.target as HTMLElement)) {
            // If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
            return;
        }
        event.preventDefault();
        dragTargetsRef.current = [];
    };

    useEffect(() => {
        if (preventDropOnDocument) {
            document.addEventListener('dragover', handleDocumentDragOver, false);
            document.addEventListener('drop', handleDocumentDrop, false);
        }

        return () => {
            if (preventDropOnDocument) {
                document.removeEventListener('dragover', handleDocumentDragOver);
                document.removeEventListener('drop', handleDocumentDrop);
            }
        };
    }, [rootRef, preventDropOnDocument]);

    // Auto focus the root when autoFocus is true
    useEffect(() => {
        if (!disabled && autoFocus && rootRef.current) {
            rootRef.current.focus();
        }
        return () => {};
    }, [rootRef, autoFocus, disabled]);

    const handleError = useCallback<NonNullable<UseDropzoneProps['onError']>>(
        e => {
            if (onError) {
                onError(e);
            } else {
                // Let the user know something's gone wrong if they haven't provided the onError cb.
                console.error(e);
            }
        },
        [onError],
    );

    const stopPropagation = useCallback(
        (event: Event | React.ChangeEvent) => {
            if (noDragEventsBubbling) {
                event.stopPropagation();
            }
        },
        [noDragEventsBubbling],
    );

    const handleDragEnter = useCallback<NonNullable<UseDropzoneProps['onDragEnter']>>(
        event => {
            event.preventDefault();
            // Persist here because we need the event later after getFilesFromEvent() is done
            // event.persist();
            stopPropagation(event);

            dragTargetsRef.current = [...dragTargetsRef.current, event.target as HTMLElement];

            if (isEvtWithFiles(event)) {
                Promise.resolve(getFilesFromEvent(event))
                    .then(files => {
                        if (isPropagationStopped(event) && !noDragEventsBubbling) {
                            return;
                        }

                        const fileCount = files.length;
                        const isDragAccept =
                            fileCount > 0 &&
                            allFilesAccepted({
                                files: files as File[],
                                accept: acceptAttr,
                                minSize,
                                maxSize,
                                multiple,
                                maxFiles,
                                validator,
                            });
                        const isDragReject = fileCount > 0 && !isDragAccept;

                        dispatch({
                            isDragAccept,
                            isDragReject,
                            isDragActive: true,
                            type: 'setDraggedFiles',
                        });

                        if (onDragEnter) {
                            onDragEnter(event);
                        }
                    })
                    .catch(e => handleError(e));
            }
        },
        [
            getFilesFromEvent,
            onDragEnter,
            handleError,
            stopPropagation,
            noDragEventsBubbling,
            acceptAttr,
            minSize,
            maxSize,
            multiple,
            maxFiles,
            validator,
        ],
    );

    const handleDragOver = useCallback<NonNullable<UseDropzoneProps['onDragOver']>>(
        event => {
            event.preventDefault();
            // event.persist();
            stopPropagation(event);

            const hasFiles = isEvtWithFiles(event);
            if (hasFiles && event.dataTransfer) {
                try {
                    event.dataTransfer.dropEffect = 'copy';
                } catch {} /* eslint-disable-line no-empty */
            }

            if (hasFiles && onDragOver) {
                onDragOver(event);
            }

            return false;
        },
        [stopPropagation, onDragOver],
    );

    const handleDragLeave = useCallback<NonNullable<UseDropzoneProps['onDragLeave']>>(
        event => {
            event.preventDefault();
            // event.persist();
            stopPropagation(event);

            // Only deactivate once the dropzone and all children have been left
            const targets = dragTargetsRef.current.filter(
                target => rootRef.current && rootRef.current.contains(target),
            );
            // Make sure to remove a target present multiple times only once
            // (Firefox may fire dragenter/dragleave multiple times on the same element)
            const targetIdx = targets.indexOf(event.target as HTMLElement);
            if (targetIdx !== -1) {
                targets.splice(targetIdx, 1);
            }
            dragTargetsRef.current = targets;
            if (targets.length > 0) {
                return;
            }

            dispatch({
                type: 'setDraggedFiles',
                isDragActive: false,
                isDragAccept: false,
                isDragReject: false,
            });

            if (isEvtWithFiles(event) && onDragLeave) {
                onDragLeave(event);
            }
        },
        [stopPropagation, onDragLeave],
    );

    const setFiles = useCallback(
        (files: FileWithPath[], event: DragEvent) => {
            const acceptedFiles: FileWithPath[] = [];
            const fileRejections: FileRejection[] = [];

            files.forEach(file => {
                const [accepted, acceptError] = fileAccepted(file, acceptAttr);
                const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);
                const customErrors = validator ? validator(file) : null;

                if (accepted && sizeMatch && !customErrors) {
                    acceptedFiles.push(file);
                } else {
                    let errors = [acceptError, sizeError];

                    if (customErrors) {
                        errors = errors.concat(customErrors);
                    }

                    fileRejections.push({ file, errors: errors.filter(e => !!e) });
                }
            });

            if (
                (!multiple && acceptedFiles.length > 1) ||
                (multiple && maxFiles >= 1 && acceptedFiles.length > maxFiles)
            ) {
                // Reject everything and empty accepted files
                acceptedFiles.forEach(file => {
                    fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
                });
                acceptedFiles.splice(0);
            }

            dispatch({
                acceptedFiles,
                fileRejections,
                isDragReject: fileRejections.length > 0,
                type: 'setFiles',
            });

            if (onDrop) {
                onDrop(acceptedFiles, fileRejections, event);
            }

            if (fileRejections.length > 0 && onDropRejected) {
                onDropRejected(fileRejections, event);
            }

            if (acceptedFiles.length > 0 && onDropAccepted) {
                onDropAccepted(acceptedFiles, event);
            }
        },
        [
            dispatch,
            multiple,
            acceptAttr,
            minSize,
            maxSize,
            maxFiles,
            onDrop,
            onDropAccepted,
            onDropRejected,
            validator,
        ],
    );

    const handleDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            // Persist here because we need the event later after getFilesFromEvent() is done
            // event.persist();
            stopPropagation(event);

            dragTargetsRef.current = [];

            if (isEvtWithFiles(event)) {
                Promise.resolve(getFilesFromEvent(event))
                    .then(files => {
                        if (isPropagationStopped(event) && !noDragEventsBubbling) {
                            return;
                        }
                        setFiles(files as File[], event);
                    })
                    .catch(e => handleError(e));
            }
            dispatch({ type: 'reset' });
        },
        [stopPropagation, getFilesFromEvent, noDragEventsBubbling, setFiles, handleError],
    );

    // Fn for opening the file dialog programmatically
    const openFileDialog = useCallback(() => {
        // No point to use FS access APIs if context is not secure
        // https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts#feature_detection
        if (fsAccessApiWorksRef.current) {
            dispatch({ type: 'openDialog' });
            handleFileDialogOpen();
            // https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
            const opts = {
                multiple,
                types: pickerTypes,
            };
            (window as any)
                .showOpenFilePicker(opts)
                .then((handles: any) => getFilesFromEvent(handles))
                .then((files: FileWithPath[]) => {
                    setFiles(files, {} as DragEvent);
                    dispatch({ type: 'closeDialog' });
                })
                .catch((e: Error) => {
                    // AbortError means the user canceled
                    if (isAbort(e)) {
                        handleFileDialogCancel(e);
                        dispatch({ type: 'closeDialog' });
                    } else if (isSecurityError(e)) {
                        fsAccessApiWorksRef.current = false;
                        // CORS, so cannot use this API
                        // Try using the input
                        if (inputRef.current) {
                            inputRef.current.value = '';
                            inputRef.current.click();
                        } else {
                            handleError(
                                new Error(
                                    'Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided.',
                                ),
                            );
                        }
                    } else {
                        handleError(e);
                    }
                });
            return;
        }

        if (inputRef.current) {
            dispatch({ type: 'openDialog' });
            handleFileDialogOpen();
            inputRef.current.value = '';
            inputRef.current.click();
        }
    }, [
        getFilesFromEvent,
        handleError,
        handleFileDialogCancel,
        handleFileDialogOpen,
        multiple,
        pickerTypes,
        setFiles,
    ]);

    // Callback to open the file dialog when SPACE/ENTER occurs on the dropzone
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Ignore keyboard events bubbling up the DOM tree
            if (!rootRef.current || !rootRef.current.isEqualNode(event.target as HTMLElement)) {
                return;
            }

            if (
                event.key === ' ' ||
                event.key === 'Enter' ||
                event.keyCode === 32 ||
                event.keyCode === 13
            ) {
                event.preventDefault();
                // openFileDialog();
            }
        },
        [rootRef],
    );

    // Update focus state for the dropzone
    const handleFocus = useCallback(() => {
        dispatch({ type: 'focus' });
    }, []);

    const handleBlur = useCallback(() => {
        dispatch({ type: 'blur' });
    }, []);

    // Callback to open the file dialog when click occurs on the dropzone
    const handleClick = useCallback(() => {
        if (noClick) {
            return;
        }

        // In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
        // to ensure React can handle state changes
        // See: https://github.com/react-dropzone/react-dropzone/issues/450
        if (isIEorEdge()) {
            setTimeout(openFileDialog, 0);
        } else {
            openFileDialog();
        }
    }, [noClick, openFileDialog]);

    const composeHandler = useCallback(
        <T extends (...args: any[]) => any>(fn: T) => {
            return disabled ? undefined : fn;
        },
        [disabled],
    );

    const composeKeyboardHandler = useCallback(
        <T extends (...args: any[]) => any>(fn: T) => {
            return noKeyboard ? undefined : composeHandler(fn);
        },
        [composeHandler, noKeyboard],
    );

    const composeDragHandler = useCallback(
        <T extends (...args: any[]) => any>(fn: T) => {
            return noDrag ? undefined : composeHandler(fn);
        },
        [composeHandler, noDrag],
    );

    const getRootProps = useMemo<(props?: DropzoneRootProps) => DropzoneRootProps>(
        () =>
            ({
                refKey = 'ref',
                role,
                onKeyDown,
                onFocus,
                onBlur,
                onClick,
                onDragEnter,
                onDragOver,
                onDragLeave,
                onDrop,
                ...rest
            } = {}) => ({
                onKeyDown: composeKeyboardHandler(composeEventHandlers(onKeyDown, handleKeyDown)),
                onFocus: composeKeyboardHandler(composeEventHandlers(onFocus, handleFocus)),
                onBlur: composeKeyboardHandler(composeEventHandlers(onBlur, handleBlur)),
                onClick: composeHandler(composeEventHandlers(onClick, handleClick)),
                onDragEnter: composeDragHandler(composeEventHandlers(onDragEnter, handleDragEnter)),
                onDragOver: composeDragHandler(composeEventHandlers(onDragOver, handleDragOver)),
                onDragLeave: composeDragHandler(composeEventHandlers(onDragLeave, handleDragLeave)),
                onDrop: composeDragHandler(composeEventHandlers(onDrop, handleDrop)),
                role: typeof role === 'string' && role !== '' ? role : 'presentation',
                [refKey]: rootRef,
                ...(!disabled && !noKeyboard ? { tabIndex: 0 } : {}),
                ...rest,
            }),
        [
            composeKeyboardHandler,
            handleKeyDown,
            handleFocus,
            handleBlur,
            composeHandler,
            handleClick,
            composeDragHandler,
            handleDragEnter,
            handleDragOver,
            handleDragLeave,
            handleDrop,
            disabled,
            noKeyboard,
        ],
    );

    const onInputElementClick = useCallback((event: React.ChangeEvent) => {
        event.stopPropagation();
    }, []);

    const getInputProps = useMemo<(props?: DropzoneInputProps) => DropzoneInputProps>(
        () =>
            ({ refKey = 'ref', onChange, onClick, ...rest } = {}) => {
                const inputProps = {
                    accept: acceptAttr,
                    multiple,
                    type: 'file',
                    style: {
                        border: 0,
                        clip: 'rect(0, 0, 0, 0)',
                        clipPath: 'inset(50%)',
                        height: '1px',
                        margin: '0 -1px -1px 0',
                        overflow: 'hidden',
                        padding: 0,
                        position: 'absolute',
                        width: '1px',
                        whiteSpace: 'nowrap',
                    } as React.CSSProperties,
                    onChange: composeHandler(composeEventHandlers(onChange, handleDrop)),
                    onClick: composeHandler(composeEventHandlers(onClick, onInputElementClick)),
                    tabIndex: -1,
                    [refKey]: inputRef,
                };

                return {
                    ...inputProps,
                    ...rest,
                };
            },
        [acceptAttr, multiple, composeHandler, handleDrop, onInputElementClick],
    );

    return {
        ...state,
        isFocused: isFocused && !disabled,
        /**
         * Get props for the root element.
         */
        getRootProps,
        /**
         * Get props for the input element.
         */
        getInputProps,
        /**
         * Ref for the root element.
         */
        rootRef,
        /**
         * Ref for the input element.
         */
        inputRef,
        open: composeHandler(openFileDialog)!,
    };
};

export default useDropzone;
