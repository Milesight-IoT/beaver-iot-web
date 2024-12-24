import {
    Dispatch,
    FC,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useMemo,
    useState,
} from 'react';
import { MarkerType } from '../view/typings';

interface IToiletContextType {
    markers: MarkerType[];
    setMarkers: Dispatch<SetStateAction<MarkerType[]>>;
    selectedId: number | null;
    setSelectedId: Dispatch<SetStateAction<number | null>>;
    imageUrl: string;
    setImageUrl: Dispatch<SetStateAction<string>>;
}

const ToiletContext = createContext<IToiletContextType | undefined>(undefined);

type TProps = {
    children: ReactNode;
};
export const ToiletProvider: FC<TProps> = ({ children }) => {
    const [markers, setMarkers] = useState<MarkerType[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');

    const contextValue = useMemo(
        () => ({
            markers,
            setMarkers,
            selectedId,
            setSelectedId,
            imageUrl,
            setImageUrl,
        }),
        [imageUrl, markers, selectedId],
    );

    return <ToiletContext.Provider value={contextValue}>{children}</ToiletContext.Provider>;
};

export const useToiletContext = (): IToiletContextType => {
    const context = useContext(ToiletContext);
    if (context === void 0) {
        throw new Error('Must be used within a ToiletProvider');
    }
    return context;
};
