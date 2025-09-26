import { useTheme } from '@milesight/shared/src/hooks';
import Entry from './entry';
import MobileEntry from './mobile-entry';

export default () => {
    const { matchTablet } = useTheme();

    return matchTablet ? <MobileEntry /> : <Entry />;
};
