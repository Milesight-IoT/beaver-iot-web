/// <reference types="vite/client" />
/// <reference types="@milesight/shared/types" />

/**
 * forwardRef 定义 Hack
 *
 * Inspired by: https://fettblog.eu/typescript-react-generic-forward-refs/
 */
type FixedForwardRef = <T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode,
) => (props: P & React.RefAttributes<T>) => React.ReactNode;
