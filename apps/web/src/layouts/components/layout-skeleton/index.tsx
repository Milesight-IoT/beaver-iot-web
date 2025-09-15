import { useMemo, useState } from 'react';
import cls from 'classnames';
import { useMemoizedFn } from 'ahooks';
import { Stack, Skeleton, SkeletonOwnProps } from '@mui/material';
import { useTheme } from '@milesight/shared/src/hooks';
import { isMobile } from '@milesight/shared/src/utils/userAgent';
import { iotLocalStorage, SIDEBAR_COLLAPSE_KEY } from '@milesight/shared/src/utils/storage';
import { Logo } from '@milesight/shared/src/components';
import './style.less';

type CusSkeletonType = {
    variant?: SkeletonOwnProps['variant'];
    animation?: SkeletonOwnProps['animation'];
};

/** custom skeleton */
function CusSkeleton(props: CusSkeletonType) {
    const { variant = 'rectangular', animation = 'wave' } = props;
    return <Skeleton variant={variant} animation={animation} />;
}

/** layout Skeleton */
function LayoutSkeleton() {
    const { matchMobile } = useTheme();

    // init storage status
    const [collapsed, setCollapsed] = useState(
        iotLocalStorage.getItem(SIDEBAR_COLLAPSE_KEY) !== undefined
            ? !!iotLocalStorage.getItem(SIDEBAR_COLLAPSE_KEY)
            : true,
    );

    const renderLeftSideSkeleton = useMemoizedFn(() => {
        // left sidebar skeleton number
        const sideTopLeft = Array.from({ length: 7 });
        return sideTopLeft.map((value: unknown, index: number) => {
            return collapsed ? (
                // eslint-disable-next-line react/no-array-index-key
                <CusSkeleton key={index} />
            ) : (
                // eslint-disable-next-line react/no-array-index-key
                <div key={index} className="ms-skeleton-left-collapsed-left">
                    <CusSkeleton />
                    <CusSkeleton />
                </div>
            );
        });
    });

    const renderBottomLeftSideSkeleton = useMemoizedFn(() => {
        return collapsed ? (
            <>
                <CusSkeleton variant="circular" />
                <CusSkeleton />
            </>
        ) : (
            <div className="ms-skeleton-left-collapsed-bottom">
                <CusSkeleton variant="circular" />
                <CusSkeleton />
                <CusSkeleton />
                <CusSkeleton />
            </div>
        );
    });

    // sidebar left element
    const leftSkeleton = useMemo(() => {
        return (
            <>
                <Logo className="ms-skeleton-left-logo" mini={collapsed} />
                <div>{renderLeftSideSkeleton()}</div>
                <div>{renderBottomLeftSideSkeleton()}</div>
            </>
        );
    }, [collapsed]);

    // top element
    const topSkeleton = useMemo(() => {
        const sideTop = Array.from({ length: 7 });
        return (
            <div>
                {sideTop.map((value: unknown, index: number) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <CusSkeleton key={index} />
                ))}
                <CusSkeleton />
            </div>
        );
    }, []);

    return (
        <Stack direction="row" sx={{ flex: 1 }}>
            {!isMobile() && !matchMobile && (
                <div
                    className={cls('ms-skeleton-left', {
                        'ms-skeleton-left-unCollapsed': !collapsed,
                    })}
                >
                    {leftSkeleton}
                </div>
            )}
            <Stack
                sx={{
                    flex: 1,
                    borderLeft: '1px solid var(--border-color-base)',
                }}
            >
                <div className="ms-skeleton-top">{topSkeleton}</div>
                <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{ flex: 1, backgroundColor: 'var(--gray-2)' }}
                    style={{ marginTop: 0 }}
                />
            </Stack>
        </Stack>
    );
}

export default LayoutSkeleton;
