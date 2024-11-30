import { Modal } from '@milesight/shared/src/components';
import { Tooltip } from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

export const height = 1080 * 0.5;
export const width = 1920 * 0.5;

const AiModal: React.FC<{
    title: string;
    onClose: () => void;
    visible: boolean;
    list: any[];
    playerRef?: React.RefObject<ReactPlayer>;
    pngUrl: string;
}> = ({ title, onClose, visible, list, playerRef, pngUrl }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const ColorObj = useMemo(() => {
        const getColorObj = (list: any[]) => {
            const obj: Record<string, string> = {};
            list.forEach(i => {
                if (!obj[i.label]) {
                    // 分配随机颜色
                    obj[i.label] = `#${Math.random().toString(16).substring(2, 8)}`;
                }
            });

            return obj;
        };
        return getColorObj(list);
    }, [list]);
    if (!visible) return null;
    console.log(
        '%c AT-[ list ]-16-「Modal」',
        'font-size:13px; background:pink; color:#bf2c9f;',
        `${new Date().toLocaleString()},`,
        { list },
    );
    return (
        <Modal
            onCancel={onClose}
            onOk={() => {}}
            title={title}
            width="960px"
            footer={null}
            showCloseIcon
            visible={visible}
        >
            <div className="config-plugin-container">
                <img
                    src={pngUrl}
                    alt="png"
                    width={width - 24 * 2}
                    height={height}
                    style={{ zIndex: 1 }}
                />
                <svg
                    ref={svgRef}
                    style={{
                        position: 'absolute',
                        width: `${width - 24 * 2}px`,
                        height: `${height}px`,
                        zIndex: 1000000,
                    }}
                >
                    {list.map(({ box, score, label }, index) => {
                        // const internalPlayer = playerRef.current?.getInternalPlayer();
                        // if (!internalPlayer) return;
                        // const heightScale =
                        //     internalPlayer.clientHeight / internalPlayer.videoHeight;
                        // const widthScale = internalPlayer.clientWidth / internalPlayer.videoWidth;

                        return (
                            <rect
                                onMouseEnter={e => {
                                    // 将其他 rect 元素的透明度设置为0 ，当前 rect 元素的透明度设置为1
                                    const rects = document.querySelectorAll('rect');
                                    rects.forEach(rect => {
                                        rect.setAttribute('opacity', '0');
                                    });
                                    (e.target as SVGRectElement).setAttribute('opacity', '1');
                                }}
                                onMouseLeave={e => {
                                    const rects = document.querySelectorAll('rect');
                                    rects.forEach(rect => {
                                        rect.setAttribute('opacity', '0.5');
                                    });
                                }}
                                x={box.xmin * ((960 - 24 * 2) / 960)}
                                y={box.ymin}
                                width={box.xmax - box.xmin}
                                height={box.ymax - box.ymin}
                                stroke={ColorObj[label]}
                                strokeWidth="2"
                                fill={ColorObj[label]}
                                opacity={0.5}
                                fillOpacity={0.5}
                                cursor="pointer"
                            >
                                <title>{`名称：${label} 准确度：${score * 100}%`}</title>
                            </rect>
                        );
                    })}
                </svg>
            </div>
        </Modal>
    );
};

export default AiModal;
