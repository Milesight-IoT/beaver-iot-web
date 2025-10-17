import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { MobileTopbar } from '@/components';

import notPermissionImg from './assets/403.svg';

import './style.less';

export default () => {
    const { getIntlText } = useI18n();
    const { matchTablet } = useTheme();
    const navigate = useNavigate();

    return (
        <div className="ms-view-403">
            {matchTablet && <MobileTopbar />}
            <div className="ms-view-403__wrapper">
                <div className="ms-view-403__img">
                    <img src={notPermissionImg} alt="not-permission" />
                </div>
                <div className="ms-view-403__title">
                    {getIntlText('common.label.403_forbidden')}
                </div>
                <div className="ms-view-403__description">
                    {getIntlText('common.label.page_not_permission')}
                </div>
                <Button
                    variant="contained"
                    onClick={() => {
                        navigate('/', { replace: true });
                        window.location.reload();
                    }}
                >
                    {getIntlText('common.label.refresh')}
                </Button>
            </div>
        </div>
    );
};
