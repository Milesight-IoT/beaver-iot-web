import { useState, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { URL_TAB_SEARCH_KEY } from '@milesight/shared/src/config';

/**
 * 用于路由 Tab 切换
 * @param defaultTab 默认 Tab
 * @returns [当前 Tab, 切换 Tab 回调]
 */
const useRouteTab = <T extends string>(defaultTab: T): [T, (tab: T) => void] => {
    const [tab, setTab] = useState<T>(defaultTab);
    const [searchParams, setSearchParams] = useSearchParams();
    const routeTab = searchParams.get(URL_TAB_SEARCH_KEY);

    useLayoutEffect(() => {
        if (routeTab && routeTab !== tab) {
            setTab(routeTab as T);
        }
    }, [tab, routeTab]);

    const handleTabChange = (tab: T) => {
        setTab(tab);
        searchParams.set(URL_TAB_SEARCH_KEY, tab);
        setSearchParams(searchParams);
    };

    return [tab, handleTabChange];
};

export default useRouteTab;
