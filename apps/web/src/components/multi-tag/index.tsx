import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Chip, ChipProps, Stack, Tooltip } from '@mui/material';
import { useDebounceEffect, useSize } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';

import './style.less';

export type MultiTagType<T extends Record<string, unknown>> = T & {
    /** List unique key */
    key: ApiKey;
    label: string;
    desc?: string;
};

export interface MultiTagProps<T extends Record<string, unknown>>
    extends Pick<ChipProps, 'size' | 'className' | 'color' | 'sx'> {
    /**
     * Data list
     */
    data: MultiTagType<T>[];
    /**
     * The maximum display length of the item label exceeds the display ...
     * @default 200
     */
    maxItemWidth?: number;
    /**
     * The content displayed when the data list is empty
     */
    emptySlot?: React.ReactNode;
    /**
     * Render value item component
     */
    renderItem?: (value: MultiTagType<T>, maxWidth?: number) => React.ReactNode;
    /**
     * Item component click event
     */
    onClick?: (value: MultiTagType<T>) => void;
    /**
     * Render rest can click reactNode
     */
    renderRestNode?: (onClick: () => void) => React.ReactNode;
}

const SMALL_CHAR_WIDTH = 8;

/**
 * Multi tag show components
 */
const MultiTag = <T extends Record<string, unknown>>({
    data,
    renderItem,
    onClick,
    renderRestNode,
    maxItemWidth = 200,
    emptySlot = '-',
    size = 'small',
    sx,
    ...rest
}: MultiTagProps<T>) => {
    const { getIntlText } = useI18n();
    const [showNumber, setShowNumber] = useState<number>(data.length);
    const [actualNumber, setActualNumber] = useState<number>(0);
    const [showMore, setShowMore] = useState<boolean>(false);

    const wrapRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const wrapSize = useSize(wrapRef);

    const handleShowMore = () => {
        setShowMore(true);
    };

    const renderTagList = useCallback(
        (number: number) => {
            if (!data.length) {
                return emptySlot;
            }
            const tags = data
                .filter((item, index) => index <= number - 1)
                .map(tag => {
                    return renderItem ? (
                        renderItem(tag, maxItemWidth)
                    ) : (
                        <Tooltip
                            key={tag.key}
                            title={tag.desc}
                            enterDelay={1000}
                            enterNextDelay={500}
                        >
                            <Chip
                                label={tag.label}
                                size={size}
                                onClick={() => onClick?.(tag)}
                                className="ms-multi-tag-tooltip"
                                sx={{ maxWidth: maxItemWidth, ...sx }}
                                {...rest}
                            />
                        </Tooltip>
                    );
                });

            if (tags.length && number < data.length) {
                tags.push(
                    renderRestNode ? (
                        renderRestNode(handleShowMore)
                    ) : (
                        <Tooltip
                            key="more"
                            title={getIntlText('common.label.view_all_tags')}
                            enterDelay={1000}
                            enterNextDelay={500}
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                className="ms-multi-tag-more"
                                onClick={handleShowMore}
                            >
                                ...
                            </Button>
                        </Tooltip>
                    ),
                );
            }
            return tags;
        },
        [data, maxItemWidth, rest, renderItem, renderRestNode],
    );

    const tagList = useMemo(() => {
        return renderTagList(actualNumber);
    }, [actualNumber, data]);

    const testTagList = useMemo(() => {
        return renderTagList(showNumber);
    }, [showNumber, data]);

    useDebounceEffect(
        () => {
            if (wrapSize?.width) {
                // Recalculate the number that needs to be displayed
                setShowNumber(estimatingTagNumber(wrapSize?.width));
            }
        },
        [wrapSize?.width, data.length],
        { wait: 10 },
    );

    useDebounceEffect(
        () => {
            if (wrapRef.current && innerRef.current) {
                const wrapWidth = wrapRef.current.getBoundingClientRect().width;
                const innerWidth = innerRef.current.getBoundingClientRect().width;

                if (innerWidth > wrapWidth) {
                    !!showNumber && setShowNumber(showNumber - 1);
                } else {
                    setActualNumber(showNumber);
                }
            }
        },
        [wrapSize?.width, testTagList],
        { wait: 10 },
    );

    /**
     * Estimate the optimal number of tags that can be accommodated
     * and calculate with the width of each character being 8
     * @param containerWidth
     * @returns number
     */
    const estimatingTagNumber = (containerWidth: number) => {
        let charLen = 0;
        let index = 0;
        for (; index < data.length && charLen <= containerWidth; index++) {
            charLen += SMALL_CHAR_WIDTH * data[index].label.length;
        }
        return Math.max(index, data.length ? 1 : 0);
    };

    return (
        <div className="ms-multi-tag" ref={wrapRef}>
            <Stack sx={{ position: 'relative' }}>
                <Stack
                    ref={innerRef}
                    sx={{
                        opacity: 0,
                    }}
                >
                    {testTagList}
                </Stack>
                <Stack>{tagList}</Stack>
            </Stack>
            <Modal
                size="lg"
                visible={showMore}
                title={getIntlText('common.label.view_tags')}
                className="ms-multi-tag-modal"
                onCancel={() => setShowMore(false)}
                showCloseIcon
                footer={null}
            >
                <div>
                    {data.map(tag => {
                        return renderItem ? (
                            renderItem(tag)
                        ) : (
                            <Tooltip
                                key={tag.key}
                                title={tag.desc}
                                enterDelay={1000}
                                enterNextDelay={500}
                            >
                                <Chip
                                    label={tag.label}
                                    size={size}
                                    onClick={() => {
                                        setShowMore(false);
                                        onClick?.(tag);
                                    }}
                                    className="ms-multi-tag-tooltip"
                                    {...rest}
                                />
                            </Tooltip>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
};

export default React.memo(MultiTag) as typeof MultiTag;
