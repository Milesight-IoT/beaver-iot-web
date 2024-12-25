import React, { useState } from 'react';

import {
    Text, FabIcon, Fab, AddIcon, ActionsheetItemText, ActionsheetItem, ActionsheetContent, ActionsheetBackdrop,
    Actionsheet
} from '@ms-mobile-ui/themed';
import useI18n from '@milesight/shared/src/hooks/useI18n';
import useGetPluginConfigs from '@/plugin/hooks/useGetPluginConfigs';

type Props = {
  onSelect: (plugin: any) => void;
};

const AddWidgetButton: React.FC<Props> = ({ onSelect }) => {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const { pluginsConfigs } = useGetPluginConfigs();
  const { getIntlText } = useI18n();

  const handleClose = () => setShowActionsheet(!showActionsheet);

  const handleSelect = (plugin: any) => {
    onSelect(plugin);
    handleClose();
  };

  return (
    <>
      <Fab
        size="md"
        position='absolute'
        placement="bottom right"
        isHovered={false}
        isDisabled={false}
        isPressed={false}
        bottom='$16'
        onPress={handleClose}
        right='$4'
      >
        <FabIcon as={AddIcon} />
      </Fab>
      <Actionsheet isOpen={showActionsheet} onClose={handleClose} zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent h="$72" zIndex={999}>
          <Text fontWeight='bold' fontSize='$fs_18' lineHeight={36}>{getIntlText('dashboard.add_widget')}</Text>
          {pluginsConfigs?.map((plugin: any, index: number) => (
            <ActionsheetItem key={index} onPress={() => handleSelect(plugin)}>
              <ActionsheetItemText>{plugin.name}</ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
};

export default React.memo(AddWidgetButton);
