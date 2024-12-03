import { Typography } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import './style.less';

export default () => {
    const { getIntlText } = useI18n();

    return (
        <div className="ms-view-404">
            <Typography variant="h2">404</Typography>
            <Typography>{getIntlText('error.http.page_not_found')}</Typography>
        </div>
    );
};
