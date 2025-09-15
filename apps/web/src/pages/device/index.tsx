import { useTheme } from '@milesight/shared/src/hooks';
import Entry from './entry';
import MobileEntry from './mobile-entry';

export default () => {
    const { matchTablet } = useTheme();

    if (matchTablet) {
        return <MobileEntry />;
    }

    return <Entry />;
};
