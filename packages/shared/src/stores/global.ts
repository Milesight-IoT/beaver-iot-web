import { unstable_batchedUpdates as unstableBatchedUpdates } from 'react-dom';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { onLangChange } from '../services/i18n';
import { getCurrentTheme, type ThemeType } from '../services/theme';
import { getTimezone, changeTimezone } from '../services/time';

interface GlobalStore {
    /** Current Language */
    lang?: LangType;

    /** Current Theme */
    theme: ThemeType;

    /** Current Timezone */
    timezone: string;

    /** Set theme */
    setTheme: (theme: ThemeType) => void;

    /** Set timezone */
    setTimezone: (tz: string) => void;
}

const useGlobalStore = create(
    immer<GlobalStore>(set => ({
        /**
         * The init language is not set by default, so that the page can be updated after the
         * language source is loaded.
         */
        lang: undefined,

        theme: getCurrentTheme(),

        timezone: getTimezone(),

        setTheme: theme => set({ theme }),

        setTimezone: tz => {
            changeTimezone(tz);
            set(state => {
                state.timezone = tz;
            });
        },
    })),
);

// Listen the language change event and update the global language state.
onLangChange(lang => {
    /**
     * Calling actions outside a React event handler in pre React 18
     * https://docs.pmnd.rs/zustand/guides/event-handler-in-pre-react-18
     */
    unstableBatchedUpdates(() => {
        useGlobalStore.setState({ lang });
    });
});

export default useGlobalStore;
