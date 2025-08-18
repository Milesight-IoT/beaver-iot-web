import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Button, IconButton, CircularProgress } from '@mui/material';
import { useForm, useWatch, Controller, type SubmitHandler } from 'react-hook-form';
import { isEqual } from 'lodash-es';
import { useSize } from 'ahooks';
import { useI18n, useCopy } from '@milesight/shared/src/hooks';
import { linkDownload } from '@milesight/shared/src/utils/tools';
import {
    Modal,
    SaveAltIcon,
    ContentCopyIcon,
    AutoAwesomeIcon,
    BrokenImageIcon,
    toast,
    type ModalProps,
} from '@milesight/shared/src/components';
import {
    Empty,
    Tooltip,
    ToggleRadio,
    ImageAnnotation,
    CodeEditor,
    type PointType,
    type ImageAnnotationInstance,
} from '@/components';
import { useEntityFormItems, IMAGE_ENTITY_KEYWORD, type EntityFormDataProps } from '@/hooks';
import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { type InteEntityType } from '../../../../hooks';
import { convertPointsData } from '../../helper';
import type { InferenceResponse } from '../../typings';
import './style.less';

interface Props extends Omit<ModalProps, 'onOk'> {
    /** AI model name */
    modelName?: string;

    /** Entity list that used to generate form items */
    entities?: InteEntityType[];
}

type ResultType = 'image' | 'json';

const DEFAULT_RESULT_TYPE: ResultType = 'image';
const resultOptionConfigs: {
    labelIntlKey: string;
    value: ResultType;
}[] = [
    { labelIntlKey: 'common.label.image', value: 'image' },
    { labelIntlKey: 'common.label.json', value: 'json' },
];

/** Default result container width */
const DEFAULT_RESULT_CONTAINER_WIDTH = 800;
/** Default result container height */
const DEFAULT_RESULT_CONTAINER_HEIGHT = 643;
/** Default result container header height */
const DEFAULT_RESULT_CONTAINER_HEADER_HEIGHT = 45;
/** Default result container gap */
const DEFAULT_RESULT_CONTAINER_GAP = 16;

/** The AI model supported image accept */
const imageAccept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
};

const TestModal: React.FC<Props> = ({ modelName, entities, visible, onCancel, ...props }) => {
    const { getIntlText, getIntlHtml, mergeIntlText } = useI18n();

    // ---------- Render dynamic form items ----------
    const { control, formState, handleSubmit, reset } = useForm<EntityFormDataProps>();
    const { formItems, decodeFormParams } = useEntityFormItems({
        entities,
        imageUploadProps: { accept: imageAccept, autoUpload: false, tempLiveMinutes: 360 },
    });
    const isLoading = formState.isSubmitting;
    const formValues = useWatch({ control });
    const previousValues = useRef<Record<string, any>>();

    const onSubmit: SubmitHandler<EntityFormDataProps> = async params => {
        const finalParams = decodeFormParams(params);

        if (!finalParams) {
            console.warn(`params is empty, the origin params is ${JSON.stringify(params)}`);
            return;
        }

        setImageError(null);
        setOutput(null);
        setOriginalImageUrl(null);
        const [error, resp] = await awaitWrap(entityAPI.callService({ exchange: finalParams }));

        if (error || !isRequestSuccess(resp)) return;
        const result = getResponseData(resp) as InferenceResponse;
        const imageEntity = entities?.find(entity =>
            entity.valueAttribute.format?.includes(IMAGE_ENTITY_KEYWORD),
        );
        const imageUrl = finalParams[imageEntity?.key || ''];

        setOutput(result?.outputs?.data);
        setOriginalImageUrl(imageUrl);
        setResultType(DEFAULT_RESULT_TYPE);
    };

    // Reset the result when the form values change
    useEffect(() => {
        if (isEqual(formValues, previousValues)) return;

        previousValues.current = formValues;
        setOutput(null);
        setImageError(null);
    }, [formValues]);

    // ---------- Handle actions in header ----------
    const { handleCopy } = useCopy();
    const stageRef = useRef<ImageAnnotationInstance>(null);
    const resultOptions = useMemo(
        () =>
            resultOptionConfigs.map(config => ({
                label: getIntlText(config.labelIntlKey),
                value: config.value,
            })),
        [getIntlText],
    );
    const [resultType, setResultType] = useState<ResultType>(DEFAULT_RESULT_TYPE);
    const copyTip = useMemo(() => {
        switch (resultType) {
            case 'image':
                return mergeIntlText(['common.label.copy', 'common.label.image']);
            case 'json':
                return mergeIntlText(['common.label.copy', 'common.label.json']);
            default:
                return '';
        }
    }, [resultType, mergeIntlText]);

    const handleInnerCopy = (container?: HTMLElement | null) => {
        switch (resultType) {
            case 'image': {
                const dataUri = stageRef.current?.toDataURL();
                if (!dataUri) return;
                handleCopy(dataUri, container);
                break;
            }
            case 'json': {
                if (!output?.length) return;
                handleCopy(JSON.stringify(output, null, 2), container);
                break;
            }
            default: {
                break;
            }
        }
    };

    // ---------- Render Result ----------
    const inferResultRef = useRef<HTMLDivElement>(null);
    const inferResultSize = useSize(inferResultRef);
    const imageSize = useMemo(() => {
        const width = inferResultSize?.width || DEFAULT_RESULT_CONTAINER_WIDTH;
        const height = inferResultSize?.height || DEFAULT_RESULT_CONTAINER_HEIGHT;

        return {
            width: width - 2 * DEFAULT_RESULT_CONTAINER_GAP,
            height:
                height - DEFAULT_RESULT_CONTAINER_HEADER_HEIGHT - 2 * DEFAULT_RESULT_CONTAINER_GAP,
        };
    }, [inferResultSize]);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>();
    const [output, setOutput] = useState<InferenceResponse['outputs']['data'] | null>();
    const [points, setPoints] = useState<PointType[]>([]);
    const [imageError, setImageError] = useState<boolean | null>();

    // Generate points when output change
    useEffect(() => {
        if (!output?.length) {
            setPoints([]);
            return;
        }
        const result = convertPointsData(output);

        // console.log({ result });
        setPoints(result);
    }, [output]);

    // Clear data when modal close
    useEffect(() => {
        if (visible) return;
        reset();
        setImageError(null);
        setOutput(null);
        setOriginalImageUrl(null);
        setResultType(DEFAULT_RESULT_TYPE);
    }, [visible, reset]);

    // http://192.168.43.48:9000/beaver-iot-resource/beaver-iot-public/abc856a0-5d17-46e3-bdd3-26b3aa7ec343-20200108-213609-uqZwL.jpg
    return (
        <Modal
            {...props}
            showCloseIcon
            width="1200px"
            className="ms-test-modal"
            visible={visible}
            title={getIntlText('setting.integration.ai_infer_service_title', { 1: modelName })}
            onCancel={() => {
                reset();
                onCancel?.();
            }}
        >
            <div className="ms-test-modal-content">
                <div className="ms-test-modal-form">
                    <div className="ms-test-modal-form-items">
                        {formItems.map(props => (
                            <Controller<EntityFormDataProps>
                                {...props}
                                key={props.name}
                                control={control}
                            />
                        ))}
                    </div>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                        onClick={handleSubmit(onSubmit)}
                    >
                        {getIntlText('setting.integration.generate_infer_result')}
                    </Button>
                </div>
                <div className="ms-test-modal-result">
                    {!output || !originalImageUrl ? (
                        <Empty text={getIntlHtml('setting.integration.ai_model_param_input_tip')} />
                    ) : (
                        <div className="result-main" ref={inferResultRef}>
                            <div className="result-main-header">
                                <div className="result-main-header-title">
                                    {getIntlText('common.label.result')}
                                </div>
                                <ToggleRadio
                                    size="small"
                                    value={resultType}
                                    options={resultOptions}
                                    onChange={val => setResultType(val as ResultType)}
                                />
                                <div className="result-main-header-action">
                                    {resultType === 'image' && (
                                        <Tooltip
                                            title={mergeIntlText([
                                                'common.label.download',
                                                'common.label.image',
                                            ])}
                                        >
                                            <IconButton
                                                onClick={() => {
                                                    if (!originalImageUrl) return;
                                                    const fileName = `${modelName}-inference-image`;
                                                    const dataUri = stageRef.current?.toDataURL({
                                                        pixelRatio: 2,
                                                    });

                                                    if (!dataUri) {
                                                        toast.error({
                                                            content: getIntlText(
                                                                'setting.integration.ai_infer_canvas_unable_to_download',
                                                            ),
                                                        });
                                                        return;
                                                    }
                                                    linkDownload(dataUri, fileName);
                                                }}
                                            >
                                                <SaveAltIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title={copyTip}>
                                        <IconButton
                                            onClick={e =>
                                                handleInnerCopy(
                                                    (e.target as HTMLElement).closest('div'),
                                                )
                                            }
                                        >
                                            <ContentCopyIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                            {resultType === 'image' && (
                                <div className="result-main-content result-main-image">
                                    {imageError && (
                                        <div className="result-main-image-error">
                                            <BrokenImageIcon />
                                        </div>
                                    )}
                                    <ImageAnnotation
                                        ref={stageRef}
                                        imgSrc={originalImageUrl}
                                        points={points}
                                        containerWidth={imageSize.width}
                                        containerHeight={imageSize.height}
                                        onImageError={() => {
                                            setImageError(true);
                                            toast.error(
                                                getIntlText(
                                                    'setting.integration.ai_infer_load_image_error',
                                                ),
                                            );
                                        }}
                                        // onPointsChange={setPoints}
                                    />
                                </div>
                            )}
                            {resultType === 'json' && (
                                <div className="result-main-content result-main-code">
                                    <CodeEditor
                                        readOnly
                                        editorLang="json"
                                        value={!output ? '' : JSON.stringify(output, null, 2)}
                                        editable={false}
                                        renderHeader={() => null}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default React.memo(TestModal);
