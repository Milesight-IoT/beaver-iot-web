import { createContext } from 'react';

import { type TableRowDataType } from './hooks';

export interface AlarmContextProps {
    data?: TableRowDataType[];
    showMobileSearch?: boolean;
    setShowMobileSearch?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AlarmContext = createContext<AlarmContextProps | null>(null);
