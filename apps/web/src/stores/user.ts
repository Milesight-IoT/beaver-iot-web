import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type GlobalAPISchema } from '@/services/http';

interface UserStore {
    /**
     * User information
     */
    userInfo?: null | GlobalAPISchema['getUserInfo']['response'];

    /**
     * Update User information
     *
     * @param userInfo User information
     */
    setUserInfo: (userInfo: UserStore['userInfo'] | null) => void;
}

const useUserStore = create(
    immer<UserStore>(set => ({
        userInfo: null,

        setUserInfo: userInfo => set({ userInfo }),
    })),
);

export default useUserStore;
