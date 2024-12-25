import { useMemo, useState, useCallback, useEffect } from 'react';

import * as Icons from '@milesight/shared/src/components/icons';
import { useI18n } from '@milesight/shared/src/hooks';
import Switch from '@/plugin/components/switch';
import { useModel } from '@/adapter/models/getEntityStatus';
import { entityAPI } from '@/services/http';
import { Tooltip } from '../../../view-components';

import styles from './style.module.less';

export interface ViewProps {
    config: {
        entity?: EntityOptionType;
        title?: string;
        offIcon?: string;
        offIconColor?: string;
        onIcon?: string;
        onIconColor?: string;
    };
    configJson: CustomComponentProps;
}

const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, title, onIconColor, offIconColor, offIcon, onIcon } = config || {};
    const { isPreview } = configJson || {};

    const { getIntlText } = useI18n();
    const [isSwitchOn, setIsSwitchOn] = useState(false);

    const { data } = useModel({
        viewProps: props,
        adapter: {
            model: 'entityStatus',
        },
    });
    const { value } = data || {};

    useEffect(() => {
        setIsSwitchOn(value === 'true');
    }, [value]);

    /**
     * 切换 switch 状态时，
     * 更新所选实体的状态数据
     */
    const handleEntityStatus = useCallback(
        async (switchVal: boolean) => {
            const entityKey = entity?.rawData?.entityKey;

            /**
             * 非预览状态，则可以进行数据更新
             */
            if (!entityKey || Boolean(isPreview)) return;

            entityAPI.updateProperty({
                exchange: { [entityKey]: switchVal },
            });
        },
        [entity, isPreview],
    );

    const handleSwitchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, val: boolean) => {
            setIsSwitchOn(val);

            handleEntityStatus(val);
        },
        [handleEntityStatus],
    );

    /**
     * 右边大 icon 的展示的颜色
     */
    const iconColor = useMemo(() => {
        return isSwitchOn ? onIconColor : offIconColor;
    }, [isSwitchOn, onIconColor, offIconColor]);

    /**
     * switch title
     */
    const switchTitle = useMemo(() => {
        return isSwitchOn
            ? getIntlText('dashboard.switch_title_on')
            : getIntlText('dashboard.switch_title_off');
    }, [isSwitchOn, getIntlText]);

    /**
     * Icon 组件
     */
    const IconComponent = useMemo(() => {
        const iconName = isSwitchOn ? onIcon : offIcon;
        if (!iconName) return null;

        const Icon = Reflect.get(Icons, iconName);
        if (!Icon) return null;

        return <Icon sx={{ color: iconColor || '#9B9B9B', fontSize: 32 }} />;
    }, [isSwitchOn, onIcon, offIcon, iconColor]);

    return (
        <div
            className={`${styles['switch-wrapper']} ${isPreview ? styles['switch-wrapper-preview'] : ''}`}
        >
            <div className={styles.icon}>{IconComponent}</div>
            <div className={styles.content}>
                <Tooltip className={styles.text} autoEllipsis title={title} />
                <div className={styles.body}>
                    <Switch value={isSwitchOn} title={switchTitle} onChange={handleSwitchChange} />
                </div>
            </div>
        </div>
    );
};

export default View;
