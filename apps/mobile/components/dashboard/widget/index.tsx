import React from 'react';
import { Pressable } from 'react-native';
import plugins from '@/plugin/plugins';
import { WidgetDetail } from '@/services/http/dashboard';
import RenderView from '@/plugin/render/render-view';


type Props = {
  data: WidgetDetail;
  onLongPress: (widgetId: ApiKey | undefined, name: string) => void
};

const Widget: React.FC<Props> = ({ data, onLongPress }) => {
  const ComponentView = (plugins as any)[`${data.data.type}View`];

  const handleLongPress = () => {
    onLongPress(data.widget_id, data.data.config?.title || data.data.config?.label);
  };

  return (
    <>
      <Pressable onLongPress={handleLongPress}>
        {ComponentView ? (
          <ComponentView
            config={data.data.config}
            configJson={data.data}
            onLongPress={handleLongPress}
          />
        ) : (
          <RenderView
            configJson={data.data as any}
            config={data.data.config}
          />
        )}
      </Pressable>
    </>
  );
};

export default React.memo(Widget);
