import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Text} from '@ms-mobile-ui/themed';
import useI18n from '@milesight/shared/src/hooks/useI18n';

import { useSession } from '@/hooks/useSession';
import { DrawerContent } from '@/components/DrawerContent';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { getIntlText } = useI18n();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Drawer
      drawerContent={() => <DrawerContent />}
      screenOptions={{
        headerLeft: (props) => {
          return <DrawerToggleButton {...props} tintColor='#1c1c1e' />;
        }
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: getIntlText('common.label.dashboard'),
          headerStyle: {
            borderBottomWidth: 0,
            backgroundColor: '#fff',
            elevation: 0,
            shadowColor: 'transparent',
            shadowOpacity: 0,
            shadowOffset: {
              width: 0,
              height: 0
            },
          },
          headerTitleStyle: {
            color: '#1c1c1e',
          },
        }}
      />
      <Drawer.Screen
        name="user"
        options={{
          title: getIntlText('common.label.setting'),
        }}
      />
      <Drawer.Screen
        name="add-widget"
        options={{
          title: getIntlText('common.label.setting'),
          headerShown: false,
        }}
      />
    </Drawer>
  );
}