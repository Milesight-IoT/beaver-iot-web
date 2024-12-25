import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import pica from 'pica';
import { LoadingButton } from '@milesight/shared/src/components';
import dayjs from 'dayjs';
import Player from 'video.js/dist/types/player';
import { useI18n } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/plugin/view-components';
import type { ViewConfigProps } from '../typings';
import './style.less';
import { DateTimePicker, useConfirm } from '@/components';
import { awaitWrap, deviceAPI } from '@/services/http';
import VideoPlayer from './Video';
import { CallServiceType, useEntityApi } from '@/plugin/hooks';
import AiModal, { height, width } from './Modal';

interface Props {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}
const View = (props: Props) => {
    const { getEntityChildren, callService, updateProperty } = useEntityApi();
    const confirm = useConfirm();
    const { getIntlText } = useI18n();
    const currentTimeRef = useRef();
    const [showAi, setShowAi] = useState(false);
    const { config, configJson } = props;
    const { title, entity, playbackEntity } = config || {};
    const [list, setList] = useState<any[]>([]);
    const { isPreview } = configJson || {};
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const playerRef = useRef<ReactPlayer>(null);
    const [pngUrl, setPngUrl] = useState('');
    const videoRef = useRef<{ getInstance: () => Player }>(null);

    const init = useCallback(async () => {
        if (!entity) return;
        const entityKey = (entity as any).rawData?.entityKey;
        const { error, res } = await callService({
            entity_id: (entity as any)?.value as ApiKey,
            exchange: {
                [entityKey]: null,
            },
        });
        if (!error) {
            setVideoUrl(res.hls_url);
        }
    }, [callService, entity]);

    const onSuccess = useCallback(async () => {
        // value 如果不合法，则不进行回放
        const currentTime = dayjs(currentTimeRef.current);
        // 拿到秒的时间戳
        const timestamp = currentTime.unix();

        if (!playbackEntity || !currentTimeRef.current || isNaN(timestamp)) return;
        // todo 这里需要调接口，返回url
        const { res, error } = await callService({
            entity_id: playbackEntity?.value as ApiKey,
            exchange: {
                [playbackEntity.rawData?.entityKey || '']: null,
                [`${playbackEntity.rawData?.entityKey}.start_time`]: timestamp,
            },
        } as CallServiceType);
        if (!error) {
            setVideoUrl(res.hls_vod_url || '');
        }
        currentTimeRef.current = undefined;
    }, [callService, playbackEntity]);

    const sumbitAi = useCallback(async () => {
        const videoInstance = videoRef.current?.getInstance();

        // 暂停视频
        // videoInstance?.pause();

        // 获取当前截屏
        // const video = playerRef.current?.getInternalPlayer();
        if (videoInstance) {
            const canvas = document.createElement('canvas');
            canvas.width = videoInstance.videoWidth(); // 设置画布宽度
            canvas.height = videoInstance.videoHeight(); // 设置画布高度
            const context = canvas.getContext('2d');

            context?.drawImage(
                videoInstance.el().firstChild as HTMLVideoElement,
                0,
                0,
                canvas.width,
                canvas.height,
            ); // 绘制当前帧
            setPngUrl(canvas.toDataURL());
            setShowAi(true);

            // 创建一个新的 canvas 作为目标
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = width; // 目标宽度（例如缩小到原始尺寸的一半）
            outputCanvas.height = height; // 目标高度

            const picaInstance = pica();

            picaInstance
                .resize(canvas, outputCanvas, { quality: 3 })
                .then(result => picaInstance.toBlob(result, 'image/jpeg', 0.8))
                .then(async blob => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const compressedBase64 = reader.result as string;
                        setLoading(true);
                        // 压缩大小
                        const [error, resp] = await awaitWrap(
                            deviceAPI.imageAnalyze({
                                image: compressedBase64.replace(
                                    /^data:image\/(png|jpg|jpeg);base64,/,
                                    '',
                                ),
                            }),
                        );
                        setLoading(false);
                        setList((resp?.data.data as any[]) || []);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => {
                    setLoading(false);
                    setShowAi(false);
                    console.error('压缩失败:', error);
                });
        }
    }, []);

    const showSelectTime = useCallback(() => {
        confirm({
            title: '设置回放时间',
            description: (
                <DateTimePicker
                    playbackEntity={playbackEntity}
                    onSuccess={time => {
                        currentTimeRef.current = time;
                    }}
                />
            ),
            confirmButtonText: getIntlText('common.button.confirm'),
            onConfirm: async () => {
                onSuccess();
            },
        });
    }, [confirm, getIntlText, onSuccess, playbackEntity]);

    useEffect(() => {
        init();
    }, []);

    return (
        <div className={`video-view ${isPreview ? 'video-view-preview' : ''}`}>
            <AiModal
                title={loading ? 'AI快照分析中...' : 'AI快照分析'}
                onClose={() => {
                    setShowAi(false);
                    setList([]);
                    setPngUrl('');
                }}
                visible={showAi}
                list={list}
                playerRef={playerRef}
                pngUrl={pngUrl}
            />
            <div className="video-view__video">
                <Tooltip
                    className="video-view__title"
                    autoEllipsis
                    title={title}
                    suffix={
                        <div className="video-view__title-suffix">
                            <LoadingButton
                                type="button"
                                onClick={() => {
                                    showSelectTime();
                                }}
                                disabled={showAi || isPreview}
                            >
                                设置回放时间
                            </LoadingButton>
                            <LoadingButton type="button" onClick={() => init()} disabled={showAi}>
                                实时播放
                            </LoadingButton>
                            <LoadingButton
                                type="button"
                                onClick={() => sumbitAi()}
                                loading={loading}
                                disabled={showAi || isPreview}
                            >
                                AI快照分析
                            </LoadingButton>
                        </div>
                    }
                />

                <div className="video-view__container">
                    <div className="player-wrapper">
                        <div style={{ position: 'relative' }}>
                            {videoUrl && (
                                <VideoPlayer
                                    ref={videoRef}
                                    options={{
                                        autoplay: true,
                                        controls: true,
                                        responsive: true,
                                        fluid: true,
                                        auto: true,
                                        // 展示进度条
                                        progress: true,
                                        sources: [
                                            {
                                                src: videoUrl,
                                                // m3u8
                                                type: 'application/x-mpegURL',
                                            },
                                        ],
                                        poster: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default View;
