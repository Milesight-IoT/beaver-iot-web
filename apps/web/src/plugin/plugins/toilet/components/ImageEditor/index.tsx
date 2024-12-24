/* eslint-disable check-file/folder-naming-convention */
import React, { useState, useRef, ChangeEvent, useEffect, useMemo, useCallback } from 'react';
import { Button, Box, Stack } from '@mui/material';
import { Stage, Layer, Image, Circle } from 'react-konva';
import { styled } from '@mui/material/styles';
import type Konva from 'konva';
import ws, { getExChangeTopic } from '@/services/ws';
import { awaitWrap, entityAPI } from '@/services/http';
import { useToiletContext } from '../ToiletContext';
import toiletAPI from '../../api';
import { MarkerType, ViewConfigToiletProps } from '../../view/typings';
import MarkerModal from './MarkerModal';

// 自定义上传按钮样式
const Input = styled('input')({
    display: 'none',
});

// 在组件顶部添加新的 interface 和状态
interface FormData {
    locationId: string;
    deviceId: string;
}
interface Props {
    onChange: (data: { imageUrl?: string; markers?: MarkerType[] }) => void;
    config?: ViewConfigToiletProps;
    isPreview?: boolean;
}
const ImageEditor = (props: Props) => {
    const { onChange, isPreview, config } = props;
    const { entity } = config || {};
    // 状态管理
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const {
        markers,
        setMarkers: _setMarkers,
        setSelectedId,
        selectedId,
        setImageUrl,
        imageUrl,
    } = useToiletContext();
    const setMarkers = (markers: MarkerType[]) => {
        onChange({ markers });
        _setMarkers(markers);
    };

    const [formData, setFormData] = useState<FormData>({
        locationId: '',
        deviceId: '',
    });

    /**
     * websocket 订阅主题
     */
    const topics = useMemo(() => {
        if (!entity) return;

        const topicList: string[] = [];
        entity.forEach(e => {
            const { entityKey } = e?.rawData || {};
            if (entityKey) {
                topicList.push(getExChangeTopic(entityKey));
            }
        });

        return topicList;
    }, [entity]);

    // 添加一个更新标记颜色的工具函数
    const updateMarkerColor = useCallback((marker: MarkerType, status?: string) => {
        let fill = '#1976d2'; // 默认蓝色
        if (status === '0') fill = '#4caf50'; // 空闲绿色
        if (status === '1') fill = '#f44336'; // 占用红色

        return {
            ...marker,
            fill,
            data: {
                ...marker.data,
                status,
            },
        };
    }, []);

    // 修改 websocket 回调，本来是想精确更新的，参考雷达的实现，目前接到更新，去刷所有数据
    // [
    //     {
    //         "event_type": "Exchange",
    //         "payload": {
    //             "entity_key": [
    //                 "lavatory.device.6617C46747200001.occupancy_status",
    //                 "lavatory.device.6617C46747200001.distance"
    //             ]
    //         }
    //     }
    // ]
    // const cb = useCallback(
    //     (params: any) => {
    //         const { entityId, value } = params;
    //         if (entityId && value !== undefined) {
    //             _setMarkers(prevMarkers => {
    //                 const updatedMarkers = prevMarkers.map(marker => {
    //                     if (marker.data.deviceId === entityId) {
    //                         return updateMarkerColor(marker, value);
    //                     }
    //                     return marker;
    //                 });
    //                 return updatedMarkers;
    //             });
    //         }
    //     },
    //     [_setMarkers, updateMarkerColor],
    // );

    // 修改状态查询函数
    const reqAllStatus = useCallback(async () => {
        if (!entity) return;

        const entityValues = entity.map(o => o.value);
        const promises = entityValues.map(value =>
            awaitWrap(entityAPI.getEntityStatus({ id: value })),
        );

        const results = await Promise.all(promises);

        const statusMap: Record<string, string> = {};
        results.forEach((result, index) => {
            const [error, response] = result;
            if (!error && response?.data?.status === 'Success') {
                statusMap[entityValues[index]] = response?.data?.data.value;
            }
        });

        _setMarkers(prevMarkers => {
            const updatedMarkers = prevMarkers.map(marker =>
                updateMarkerColor(marker, statusMap[marker.data.deviceId as string]),
            );

            return updatedMarkers;
        });
    }, [entity, _setMarkers, updateMarkerColor]);

    useEffect(() => {
        reqAllStatus();
    }, [reqAllStatus]);

    // // 定时刷新
    // useEffect(() => {
    //     if (isPreview) return; // 预览模式下不需要定时刷新

    //     const timer = setInterval(() => {
    //         reqAllStatus();
    //     }, 10000);

    //     return () => clearInterval(timer);
    // }, [reqAllStatus, isPreview]);

    /**
     * websocket 订阅
     */
    useEffect(() => {
        /**
         * 预览状态下不进行订阅
         */
        if (!topics || !topics.length || Boolean(isPreview)) return;

        return ws.subscribe(topics, reqAllStatus);
    }, [topics, reqAllStatus, isPreview]);

    // refs
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (!imageUrl) return;
        const img = new window.Image();
        img.src = imageUrl;
        img.onload = () => {
            setImage(img);
        };
    }, [imageUrl]);

    // 图片加载处理
    const handleImageLoad = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 使用已定义的 API 进行上传
            const data: any = await toiletAPI.uploadImg(formData);
            if (data?.data?.status !== 'Success') return;

            const uploadedImageUrl = data?.data?.data;
            onChange?.({
                imageUrl: uploadedImageUrl,
            });

            // Update image state
            const img = new window.Image();
            img.src = uploadedImageUrl;
            img.onload = () => {
                setImage(img);
                setImageUrl(uploadedImageUrl);
            };
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error uploading image:', error);
        }
    };

    // 添加标记
    const addMarker = () => {
        const newMarker: MarkerType = {
            id: Date.now(),
            x: 100,
            y: 100,
            radius: 20,
            draggable: true,
            fill: '#1976d2', // MUI primary color
            data: { info: '新标记' },
        };
        setMarkers([...markers, newMarker]);
    };

    // 选择标记
    // const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    //     const clickedOnEmpty = e.target === e.target.getStage();
    //     if (clickedOnEmpty) {
    //         setSelectedId(null);
    //         return;
    //     }
    //     const id = Number(e.target.id());
    //     setSelectedId(id);
    // };
    // 修改选标记的处理函数
    const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
        // 检查点击的目标是否是 Layer
        // @ts-ignore
        if (e.target === e.target.getLayer()) {
            setSelectedId(null);
            return;
        }

        // 检查点击的目标是否是 Stage
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
            return;
        }

        const id = Number(e.target.id());
        setSelectedId(id);
    };
    // 修改选择标记的处理函数
    // const handleSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    //     // 阻止事件冒泡
    //     // e.cancelBubble = true;
    //     console.log('object : ==>xxxxxx');
    //     // 如果点击的是 Circle，则设置选中状态
    //     if (e.target.className === 'Circle') {
    //         const id = Number(e.target.id());
    //         setSelectedId(id);
    //     } else {
    //         // 如果点击的不是 Circle，则清除选中状态
    //         setSelectedId(null);
    //     }
    // };

    // 更新标记位置
    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        const id = Number(e.target.id());
        const updatedMarkers = markers.map(marker => {
            if (marker.id === id) {
                return {
                    ...marker,
                    x: e.target.x(),
                    y: e.target.y(),
                };
            }
            return marker;
        });
        setMarkers(updatedMarkers);
    };

    // 删除选中的标记
    const deleteSelectedMarker = () => {
        if (selectedId) {
            setMarkers(markers.filter(marker => marker.id !== selectedId));
            setSelectedId(null);
        }
    };

    // 添加 useEffect 来处理 Transformer 的节点选择
    useEffect(() => {
        if (!selectedId || !transformerRef.current) {
            return;
        }

        // 找到选中的节点
        const node = stageRef.current?.findOne(`#${selectedId}`);
        if (node) {
            // 设置 transformer 的节点
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer()?.batchDraw();
        } else {
            // 如果没有找到节点，清空 transformer
            transformerRef.current.nodes([]);
        }
    }, [selectedId]);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const onCircleClick = (id: number) => {
        setSelectedId(id);
    };
    const onCircleDblClick = (id: number) => {
        setSelectedId(id);
        // 加载已有的数据
        const marker = markers.find(m => m.id === id);
        if (marker) {
            setFormData({
                locationId: marker.data.locationId || '',
                deviceId: marker.data.deviceId || '',
            });
        }
        handleOpen();
    };

    // 添加表单处理函数
    const handleFormChange = (e: any) => {
        const name = e.target.name as keyof FormData;
        const value = e.target.value as string;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 更新选中的标记数据
        const updatedMarkers = markers.map(marker => {
            if (marker.id === selectedId) {
                return {
                    ...marker,
                    data: {
                        ...marker.data,
                        locationId: formData.locationId,
                        deviceId: formData.deviceId,
                    },
                };
            }
            return marker;
        });
        setMarkers(updatedMarkers);
        handleClose();
    };

    return (
        <Box sx={{ p: 3 }}>
            {isPreview && (
                <Stack spacing={2} direction="row" sx={{ mb: 2 }}>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label htmlFor="contained-button-file">
                        <Input
                            accept="image/*"
                            id="contained-button-file"
                            type="file"
                            onChange={handleImageLoad}
                        />
                        <Button variant="contained" component="span">
                            上传图片
                        </Button>
                    </label>
                    <Button variant="contained" onClick={addMarker} disabled={!image}>
                        添加标记
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={deleteSelectedMarker}
                        disabled={!selectedId}
                        color="error"
                    >
                        删除标记
                    </Button>
                </Stack>
            )}

            <Box
                sx={{
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    overflow: 'hidden',
                }}
            >
                <Stage ref={stageRef} width={668} height={400} onClick={handleSelect}>
                    {/* 图片图层 */}
                    <Layer>
                        {image && <Image image={image} width={668} height={400} fit="contain" />}
                    </Layer>

                    {/* 标记图层 */}
                    <Layer>
                        {markers.map(marker => (
                            <Circle
                                key={marker.id}
                                id={marker.id.toString()}
                                x={marker.x}
                                y={marker.y}
                                radius={marker.radius}
                                fill={marker.fill}
                                draggable={isPreview && marker.draggable}
                                onDragEnd={handleDragEnd}
                                onClick={() => isPreview && onCircleClick(marker.id)}
                                onDblClick={() => isPreview && onCircleDblClick(marker.id)}
                                opacity={selectedId === marker.id && isPreview ? 0.6 : 1}
                            />
                        ))}
                        {/* 改变形状、大小 */}
                        {/* {!!selectedId && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    const minSize = 20;
                                    const maxSize = 100;
                                    if (
                                        Math.abs(newBox.width) < minSize ||
                                        Math.abs(newBox.height) < minSize ||
                                        Math.abs(newBox.width) > maxSize ||
                                        Math.abs(newBox.height) > maxSize
                                    ) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )} */}
                    </Layer>
                </Stage>
            </Box>

            <MarkerModal
                open={open}
                onClose={handleClose}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                config={config}
            />
        </Box>
    );
};

export default ImageEditor;
