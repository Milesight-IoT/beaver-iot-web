/// <reference types="@milesight/shared/types/config" />
/// <reference types="@milesight/shared/types/device" />
/// <reference types="@milesight/shared/types/entity" />
/// <reference types="@milesight/shared/types/common" />

/**
 * forwardRef 定义 Hack
 *
 * Inspired by: https://fettblog.eu/typescript-react-generic-forward-refs/
 */
type FixedForwardRef = <T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode,
) => (props: P & React.RefAttributes<T>) => React.ReactNode;
