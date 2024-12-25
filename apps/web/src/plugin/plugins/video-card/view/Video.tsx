import { cloneDeep } from 'lodash-es';
import React, { forwardRef, useImperativeHandle } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

const VideoJS = forwardRef<
    { getInstance: () => Player },
    { options: any; onReady?: (player: Player) => void }
>((props, ref) => {
    const videoRef = React.useRef<HTMLDivElement>(null);
    const playerRef = React.useRef<Player | null>(null);
    const { options, onReady } = props;
    useImperativeHandle(ref, () => {
        return {
            getInstance: () => playerRef.current as Player,
        };
    });

    React.useEffect(() => {
        // Make sure Video.js player is only initialized once
        // console.log('options', cloneDeep(options));
        // console.log('videoRef', cloneDeep(videoRef));
        // console.log('onReady', cloneDeep(onReady));
        if (!playerRef.current) {
            // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
            const videoElement = document.createElement('video-js');
            videoElement.classList.add('vjs-big-play-centered');
            if (videoRef.current) {
                videoRef.current.appendChild(videoElement);
            }

            // 初始化 video.js 播放器
            const player = videojs(videoElement, options, () => {
                videojs.log('player is ready');
                if (onReady) {
                    onReady(player);
                }
            });

            // 存储播放器实例
            playerRef.current = player;

            // You could update an existing player in the `else` block here
            // on prop change, for example:
        } else {
            playerRef.current.src(options.sources);
            playerRef.current.autoplay(options.autoplay);
            // playerRef.current.play();
        }
    }, [onReady, options, videoRef]);

    // Dispose the Video.js player when the functional component unmounts
    React.useEffect(() => {
        const player = playerRef.current;
        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    // React.useEffect(() => {
    //     if (options.sources && playerRef.current) {
    //         playerRef.current?.src(options.sources);
    //     }
    // }, [options]);

    return (
        <div data-vjs-player>
            <div ref={videoRef} />
        </div>
    );
});

export default VideoJS;
