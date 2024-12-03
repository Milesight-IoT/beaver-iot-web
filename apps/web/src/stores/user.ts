import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type GlobalAPISchema } from '@/services/http';

interface UserStore {
    /**
     * 用户信息
     */
    userInfo?: null | GlobalAPISchema['getUserInfo']['response'];

    /**
     * 更新用户信息
     *
     * @param userInfo 用户信息
     */
    setUserInfo: (userInfo: UserStore['userInfo']) => void;
}

const useUserStore = create(
    immer<UserStore>(set => ({
        userInfo: null,

        setUserInfo: userInfo => set({ userInfo }),
    })),
);

export default useUserStore;
