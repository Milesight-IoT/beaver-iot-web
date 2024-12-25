import Toast from 'react-native-toast-message';
import { useState, useEffect, useCallback } from 'react';

import { Spinner, Box } from '@ms-mobile-ui/themed';
import eventEmitter from '@milesight/shared/src/utils/event-emitter';
import { DashboardDetail } from '@/services/http/dashboard';
import { isRequestSuccess, getResponseData, dashboardAPI, awaitWrap } from '@/services/http';
import { useWebsocket } from '@/hooks';
import { Tabs } from '@/components/Tabs';
import { DashboardContent } from '@/components/dashboard';

interface Tab {
  key: string;
  title: string;
}

export default function HomeScreen() {
  const [tabs, setTabs] = useState<DashboardDetail[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);;

  const getDashboards = async () => {
    try {
      const [_, res] = await awaitWrap(dashboardAPI.getDashboards());

      if (isRequestSuccess(res)) {
        const data = getResponseData(res) ?? [];

        setTabs(data);
      }
    } catch (error: any) {
      console.error('getDashboards error:', error);
      Toast.show({
        type: 'error',
        text1: error.message ?? JSON.stringify(error),
      });
    }
  };

  const onTabChange = useCallback((_tab: Tab, index: number) => {
    setActiveIndex(index);
  }, []);



  const renderTabView = useCallback((tab: Tab, _index: number) => {
    const dashboardDetail = tabs.find(t => t.dashboard_id.toString() === tab.key);

    if (!dashboardDetail) {
      return null;
    }

    return (
      <DashboardContent
        dashboardDetail={dashboardDetail!}
        getDashboards={getDashboards}
      />
    );
  }, [tabs, getDashboards]);

  useEffect(() => {
    getDashboards();
    eventEmitter.subscribe('REFRESH_DASHBOARD', getDashboards);
    return () => {
      eventEmitter.unsubscribe('REFRESH_DASHBOARD', getDashboards);
    }
  }, []);

  useWebsocket();

  if (tabs.length === 0) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box flex={1}>
      <Tabs
        tabs={tabs.map(tab => ({ key: tab.dashboard_id.toString(), title: tab.name }))}
        activeIndex={activeIndex}
        onTabChange={onTabChange}
        renderTabView={renderTabView}
      />
    </Box>
  );
}

