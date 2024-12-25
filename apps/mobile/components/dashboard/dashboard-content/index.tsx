import Toast from 'react-native-toast-message';
import { RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useMemoizedFn } from 'ahooks';

import {
    useModal, Text, ScrollView, HStack, ActionsheetItemText, ActionsheetItem, ActionsheetContent, ActionsheetBackdrop,
    Actionsheet
} from '@ms-mobile-ui/themed';
import { WidgetDetail, DashboardDetail } from '@/services/http/dashboard';
import { isRequestSuccess, dashboardAPI, awaitWrap } from '@/services/http';
import useGetPluginConfigs from '@/plugin/hooks/useGetPluginConfigs';

import Widget from '../widget';
import AddWidgetButton from '../add-widget-button';

type Props = {
  dashboardDetail: DashboardDetail;
  getDashboards: () => Promise<void>;
};

const DashboardContent: React.FC<Props> = (props) => {
  const { dashboardDetail, getDashboards } = props;
  const [widgets, setWidgets] = useState<WidgetDetail[]>([]);
  const [refreshing, setRefreshing] = useState(false)
  const { pluginsConfigs } = useGetPluginConfigs();
  const modal = useModal();

  const [showActionsheet, setShowActionsheet] = useState(false);
  const [curWidgetId, setCurWidgetId] = useState<ApiKey>();
  const [curWidgetName, setCurWidgetName] = useState<string>();
  const handleToggle = () => setShowActionsheet(!showActionsheet);
  const router = useRouter();

  const handleSelect = (config: any) => {
    router.push({
      pathname: '/add-widget',
      params: {
        config: JSON.stringify(config), // 通过 params 传递参数
        dashboardDetail: JSON.stringify(dashboardDetail),
      }
    });
  };

  const handleLongPress = useMemoizedFn((widgetId: ApiKey | undefined, name: string) => {
    setCurWidgetId(widgetId);
    setCurWidgetName(name);
    setShowActionsheet(true);
  })

  const handleDelete = useMemoizedFn(() => {
    setShowActionsheet(false);
    modal.showModal({
      enableMaskClose: false,
      title: `Are you sure you want to delete ${curWidgetName || ''}?`,
      orientation: 'horizontal',
      buttons: [
        {
          text: 'Cancel',
          variant: 'outline',
          borderColor: '$Gray3',
          textStyle: { color: '#272E3B' },
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const newWidgets = widgets.filter(item => item.widget_id !== curWidgetId);
              const [_, res] = await awaitWrap(
                dashboardAPI.updateDashboard({
                  widgets: newWidgets,
                  dashboard_id: dashboardDetail.dashboard_id,
                  name: dashboardDetail.name,
                }),
              );
              if (isRequestSuccess(res)) {
                setWidgets(newWidgets);
                Toast.show({
                  type: 'success',
                  text1: 'Deleted successfully',
                });
              }
            } catch (error) {
            } finally {
              modal.hideModal();
            }
          },
        },
      ],
    });
  })

  const onRefresh = useMemoizedFn(async () => {
    try {
      setRefreshing(true);
      await getDashboards();
    } catch (error) {
      // handle error
    } finally {
      setRefreshing(false);
    }
  })

  useEffect(() => {
    // 将数据库里的数据与本地的进行合并，确保组件配置是本地最新的
    const newWidgets = dashboardDetail.widgets?.map((item: WidgetDetail) => {
      const sourceJson = pluginsConfigs.find(plugin => item.data.type === plugin.type);
      if (sourceJson) {
        return {
          ...item,
          data: {
            ...item.data,
            ...sourceJson,
          },
        };
      }
      return item;
    });
    const sortedWidgets = newWidgets?.sort((a, b) => {
      const aY = (a.data && a.data.pos && a.data.pos.y) ?? 0;
      const bY = (b.data && b.data.pos && b.data.pos.y) ?? 0;
      const aX = (a.data && a.data.pos && a.data.pos.x) ?? 0;
      const bX = (b.data && b.data.pos && b.data.pos.x) ?? 0;

      //优先根据Y排序，Y小的在前面，如果Y相同，则根据X排序，X小的在前面
      return aY - bY || aX - bX;
    });

    setWidgets([...(newWidgets || [])]);
  }, [dashboardDetail.widgets, pluginsConfigs]);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          padding: 8,
          backgroundColor: '#f0f0f0',
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <HStack
          flexWrap="wrap"  // 允许内容换行
          justifyContent="space-between"  // 从左开始排列
          style={{
            rowGap: 8,
            columnGap: 8,
          }}
        >
          {
            widgets.map((item: WidgetDetail) => (
              <Widget key={item.widget_id} data={item} onLongPress={handleLongPress} />
            ))
          }
        </HStack>
        <Actionsheet isOpen={showActionsheet} onClose={handleToggle} zIndex={999}>
          <ActionsheetBackdrop />
          <ActionsheetContent h='$40' $web-h='$24' pt='$2' zIndex={999}>
            <Text fontWeight='bold' fontSize='$fs_18' lineHeight={36}>{curWidgetName}</Text>
            {/* <ActionsheetItem onPress={console.log}>
              <ActionsheetItemText>编辑</ActionsheetItemText>
            </ActionsheetItem> */}
            <ActionsheetItem onPress={handleDelete}>
              <ActionsheetItemText color='$Red6'>Delete</ActionsheetItemText>
            </ActionsheetItem>
            <ActionsheetItem />
          </ActionsheetContent>
        </Actionsheet>
      </ScrollView>
      <AddWidgetButton onSelect={handleSelect} />
    </>
  );
};

export default React.memo(DashboardContent);
