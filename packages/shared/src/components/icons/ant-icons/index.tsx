import React, { ReactElement, JSXElementConstructor } from 'react';
import { createSvgIcon } from '@mui/material/utils';
import { loadSvgSource } from '../helper';
import svgSource from './source';

loadSvgSource(svgSource);

const CustomCreateSvgIcon = (
    svg: ReactElement<any, string | JSXElementConstructor<any>>,
    displayName: string,
) => {
    const Component = (props: Record<string, any>) => {
        const { className, ...otherProps } = props;
        return React.cloneElement(svg, {
            className: `${svg.props.className} ${className || ''}`,
            ...otherProps,
        });
    };
    Component.displayName = displayName;
    return createSvgIcon(<Component />, displayName);
};

export const AntToiletPaperIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-toilet-paper" />
    </svg>,
    'AntToiletPaperIcon',
);

export const AntTrashcanIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-trashcan" />
    </svg>,
    'AntTrashcanIcon',
);

export const AntPm10Icon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-pm10" />
    </svg>,
    'AntPm10Icon',
);

export const AntAirConditionerIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-air-conditioner" />
    </svg>,
    'AntAirConditionerIcon',
);

export const AntShoppingCartEmptyIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-shopping-cart-empty" />
    </svg>,
    'AntShoppingCartEmptyIcon',
);

export const AntEmojiGoodIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-emoji-good" />
    </svg>,
    'AntEmojiGoodIcon',
);

export const AntEmojiAngryIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-emoji-angry" />
    </svg>,
    'AntEmojiAngryIcon',
);

export const AntCleanServiceIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-clean-service" />
    </svg>,
    'AntCleanServiceIcon',
);

export const AntEmergencyIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-emergency" />
    </svg>,
    'AntEmergencyIcon',
);

export const AntStaffIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-staff" />
    </svg>,
    'AntStaffIcon',
);

export const AntEmojiBadIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-emoji-bad" />
    </svg>,
    'AntEmojiBadIcon',
);

export const AntFemaleIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-female" />
    </svg>,
    'AntFemaleIcon',
);

export const AntEmojiNormalIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-emoji-normal" />
    </svg>,
    'AntEmojiNormalIcon',
);

export const AntShoppingCartFullIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-shopping-cart-full" />
    </svg>,
    'AntShoppingCartFullIcon',
);

export const AntShoppingCartHalfIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-shopping-cart-half" />
    </svg>,
    'AntShoppingCartHalfIcon',
);

export const AntChildIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-child" />
    </svg>,
    'AntChildIcon',
);

export const AntMaleIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-male" />
    </svg>,
    'AntMaleIcon',
);

export const AntVapeIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-vape" />
    </svg>,
    'AntVapeIcon',
);

export const AntRestroomIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-restroom" />
    </svg>,
    'AntRestroomIcon',
);

export const AntFallAttentionIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-fall-attention" />
    </svg>,
    'AntFallAttentionIcon',
);

export const AntClosestoolIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-closestool" />
    </svg>,
    'AntClosestoolIcon',
);

export const AntLiquidSoapLogoIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-liquid-soap-logo" />
    </svg>,
    'AntLiquidSoapLogoIcon',
);

export const AntAirQualityIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-air-quality" />
    </svg>,
    'AntAirQualityIcon',
);

export const AntPhoneCallIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-phone-call" />
    </svg>,
    'AntPhoneCallIcon',
);

export const AntLiquidSoapIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-liquid-soap" />
    </svg>,
    'AntLiquidSoapIcon',
);

export const AntLiquidSoapFullIcon = CustomCreateSvgIcon(
    <svg aria-hidden="true" className="ms-icon">
        <use xlinkHref="#ant-liquid-soap-full" />
    </svg>,
    'AntLiquidSoapFullIcon',
);
