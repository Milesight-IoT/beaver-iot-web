import React from 'react';
import './index.less';

interface IProps {
    children: React.ReactNode;
}
export default React.memo(({ children }: IProps) => {
    return (
        <>
            {children}
            <div className="ms-background__gradient" />
            <div className="ms-background__image" />
            <div className="ms-background__blur" />
        </>
    );
});
