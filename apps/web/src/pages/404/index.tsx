import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@milesight/shared/src/hooks';
import notfoundImg from '@/assets/404.svg';
import './style.less';

export default () => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();

    return (
        <div className="ms-view-404">
            <img src={notfoundImg} alt="404" />
            <div className="ms-view-404__title">{getIntlText('common.label.404_not_found')}</div>
            <div className="ms-view-404__desc">{getIntlText('error.http.page_not_found')}</div>
            <Button
                variant="contained"
                className="ms-view-404__btn"
                onClick={() => {
                    navigate('/', { replace: true });
                }}
            >
                {getIntlText('common.label.back_to_home')}
            </Button>
        </div>
    );
};
