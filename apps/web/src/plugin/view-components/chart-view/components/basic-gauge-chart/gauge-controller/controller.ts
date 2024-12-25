import Chart, { DoughnutController, type Element, type UpdateMode } from 'chart.js/auto';
import {
    toPercentage,
    toDimension,
    toRadians,
    addRoundedRectPath,
    PI,
    TAU,
    HALF_PI,
    _angleBetween,
} from 'chart.js/helpers';
import { type TRBLCorners } from 'chart.js/dist/types/geometric';
import type { extraDatasets, GaugeMeta, GaugeChart, GaugeOptions } from './types';

const getRatioAndOffset = (
    rotation: number,
    circumference: number,
    cutout: number,
    needleOpts: GaugeOptions['needle'],
) => {
    // 初始化比例和偏移量
    let ratioX = 1;
    let ratioY = 1;
    let offsetX = 0;
    let offsetY = 0;

    // 如果圆周不是完整圆，则计算比例和偏移量
    if (circumference < TAU) {
        // 计算起始角度、中间角度和结束角度
        const startAngle = rotation;
        const halfAngle = startAngle + circumference / 2;
        const endAngle = startAngle + circumference;

        // 计算起始点和结束点的坐标
        const startX = Math.cos(startAngle);
        const startY = Math.sin(startAngle);
        const endX = Math.cos(endAngle);
        const endY = Math.sin(endAngle);

        // 计算指针的宽度
        const { radiusPercentage, widthPercentage, lengthPercentage } = needleOpts;
        const needleWidth = Math.max(radiusPercentage / 100, widthPercentage / 2 / 100);

        // 辅助函数，用于计算最大和最小值
        const calcMax = (angle: number, a: number, b: number) =>
            _angleBetween(angle, startAngle, endAngle)
                ? Math.max(1, lengthPercentage / 100)
                : Math.max(a, a * cutout, b, b * cutout, needleWidth);
        const calcMin = (angle: number, a: number, b: number) =>
            _angleBetween(angle, startAngle, endAngle)
                ? Math.min(-1, -lengthPercentage / 100)
                : Math.min(a, a * cutout, b, b * cutout, -needleWidth);

        // 计算最大和最小的 X 和 Y 坐标
        const maxX = calcMax(0, startX, endX);
        const maxY = calcMax(HALF_PI, startY, endY);
        const minX = calcMin(PI, startX, endX);
        const minY = calcMin(PI + HALF_PI, startY, endY);

        // 计算比例和偏移量
        ratioX = (maxX - minX) / 2;
        ratioY = (maxY - minY) / 2;
        offsetX = -(maxX + minX) / 2;
        offsetY = -(maxY + minY) / 2;
    }
    return { ratioX, ratioY, offsetX, offsetY };
};

export default class GaugeController extends DoughnutController {
    static version: string;
    static overrides: GaugeOptions;

    declare chart: GaugeChart;
    declare _cachedMeta: GaugeMeta;
    declare options: GaugeOptions;
    declare offsetX: number;
    declare offsetY: number;
    declare outerRadius: number;
    declare innerRadius: number;

    declare getDataset: () => ReturnType<DoughnutController['getDataset']> & extraDatasets;
    declare getMaxBorderWidth: () => number;
    declare getMaxOffset: (arcs: any[]) => number;
    declare _getRotation: () => number;
    declare _getCircumference: () => number;
    declare _getRingWeight: (index: number) => number;
    declare _getVisibleDatasetWeightTotal: () => number;
    declare _getRingWeightOffset: (index: number) => number;
    declare _circumference: (start: number, reset: boolean) => number;
    declare _getRotationExtents: () => { circumference: number; rotation: number };

    parse(start: number, count: number) {
        super.parse(start, count);
        const dataset = this.getDataset();
        const meta = this._cachedMeta;
        meta.minValue = dataset.minValue || 0;
        meta.value = dataset.value;
    }

    update(mode: UpdateMode) {
        const { chart } = this;
        const { chartArea } = chart;
        const meta = this._cachedMeta;
        const arcs = meta.data;
        const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs);
        const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
        const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
        const chartWeight = this._getRingWeight(this.index);

        // Compute the maximal rotation & circumference limits.
        // If we only consider our dataset, this can cause problems when two datasets
        // are both less than a circle with different rotations (starting angles)
        const { circumference, rotation } = this._getRotationExtents();
        const { ratioX, ratioY, offsetX, offsetY } = getRatioAndOffset(
            rotation,
            circumference,
            cutout,
            this.options.needle,
        );
        const maxWidth = (chartArea.width - spacing) / ratioX;
        const maxHeight = (chartArea.height - spacing) / ratioY;
        const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
        const outerRadius = toDimension(this.options.radius!, maxRadius);
        const innerRadius = Math.max(outerRadius * cutout, 0);
        const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
        this.offsetX = offsetX * outerRadius;
        this.offsetY = offsetY * outerRadius;

        meta.total = this.calculateTotal();

        this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
        this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);

        this.updateElements(arcs, 0, arcs.length, mode);
    }

    calculateTotal() {
        const meta = this._cachedMeta;
        const metaData = meta.data;
        let total = 0;

        // get Min/Max
        let valueMin = meta.minValue;
        let valueMax = meta.minValue;
        let i;
        for (i = 0; i < metaData.length; i++) {
            const value = meta._parsed[i];
            if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i)) {
                if (value < valueMin) valueMin = value;
                if (value > valueMax) valueMax = value;
            }
        }

        meta.minValue = valueMin;

        // calc total
        if (valueMin !== null && !isNaN(valueMin) && valueMax !== null && !isNaN(valueMax)) {
            total = Math.abs(valueMax - valueMin);
        }
        return total;
    }

    updateElements(arcs: Element[], start: number, count: number, mode: UpdateMode) {
        const reset = mode === 'reset';
        const { chart } = this;
        const { chartArea } = chart;
        const opts = chart.options;
        const animationOpts = opts.animation;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        const animateScale = reset && animationOpts.animateScale;
        const innerRadius = animateScale ? 0 : this.innerRadius;
        const outerRadius = animateScale ? 0 : this.outerRadius;
        const firstOpts = this.resolveDataElementOptions(start, mode);
        const sharedOptions = this.getSharedOptions(firstOpts);
        const includeOptions = this.includeOptions(mode, sharedOptions!);
        const rotation = this._getRotation();
        let startAngle = rotation;

        let i;
        if (start > 0) startAngle = this._circumference(start, reset) + rotation;

        for (i = start; i < start + count; ++i) {
            const endAngle = this._circumference(i, reset) + rotation;
            const arc = arcs[i];
            const properties = {
                x: centerX + this.offsetX,
                y: centerY + this.offsetY,
                startAngle,
                endAngle,
                circumference: endAngle - startAngle,
                outerRadius,
                innerRadius,
            };
            if (includeOptions) {
                (properties as Record<string, any>).options =
                    sharedOptions || this.resolveDataElementOptions(i, mode);
            }
            startAngle = endAngle;

            this.updateElement(arc, i, properties, mode);
        }
        this.updateSharedOptions(sharedOptions!, mode, firstOpts);
    }

    calculateCircumference(value: number) {
        const { total, minValue } = this._cachedMeta;
        if (total > 0 && !isNaN(value) && !isNaN(minValue)) {
            const circumference = this._getCircumference();
            const minCircumference = (minValue * circumference) / TAU;
            return TAU * (Math.abs(value - minCircumference) / total);
        }
        return 0;
    }

    getTranslation(chart: Chart) {
        const { chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        const dx = centerX + this.offsetX || 0;
        const dy = centerY + this.offsetY || 0;
        return { dx, dy };
    }

    drawNeedle() {
        const { ctx, chartArea } = this.chart;
        const { innerRadius, outerRadius } = this;
        const { radiusPercentage, widthPercentage, lengthPercentage, color } = this.options.needle;

        const width = chartArea.right - chartArea.left;
        const needleRadius = (radiusPercentage / 100) * width;
        const needleWidth = (widthPercentage / 100) * width;
        const needleLength = (lengthPercentage / 100) * (outerRadius - innerRadius) + innerRadius;

        // center
        const { dx, dy } = this.getTranslation(this.chart);

        // interpolate
        const meta = this._cachedMeta;
        const circumference = this._getCircumference();
        const rotation = this._getRotation();
        const angle = this.calculateCircumference((meta.value * circumference) / TAU) + rotation;

        // draw
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(angle);
        ctx.fillStyle = color;

        // draw circle
        ctx.beginPath();
        ctx.ellipse(0, 0, needleRadius, needleRadius, 0, 0, 2 * Math.PI);
        ctx.fill();

        // draw needle
        ctx.beginPath();
        ctx.moveTo(0, needleWidth / 2);
        ctx.lineTo(needleLength, 0);
        ctx.lineTo(0, -needleWidth / 2);
        ctx.fill();

        ctx.restore();
    }

    drawValueLabel() {
        if (!this.options.valueLabel.display) return;
        const { ctx, config, chartArea } = this.chart;
        const { defaultFontFamily } = config.options;
        const dataset = config.data.datasets[this.index];
        const {
            formatter,
            fontSize,
            color,
            backgroundColor,
            borderRadius,
            padding,
            bottomMarginPercentage,
            leftMarginPercentage,
        } = this.options.valueLabel;

        const width = chartArea.right - chartArea.left;
        const height = chartArea.bottom - chartArea.top;
        const bottomMargin = ((bottomMarginPercentage || 0) / 100) * width;
        const leftMargin = ((leftMarginPercentage || 0) / 100) * height;

        const fmt = formatter || (value => value);
        const valueText = fmt((dataset as Record<string, any>).value).toString();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        if (fontSize) {
            ctx.font = `${fontSize}px ${defaultFontFamily}`;
        }

        // const { width: textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(valueText);
        // const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;

        const { width: textWidth } = ctx.measureText(valueText);
        // approximate height until browsers support advanced TextMetrics
        const textHeight = Math.max(ctx.measureText('m').width, ctx.measureText('\uFF37').width);

        const { top = 0, left = 0, right = 0, bottom = 0 } = padding || {};
        const x = -(left + textWidth / 2);
        const y = -(top + textHeight / 2);
        const w = left + textWidth + right;
        const h = top + textHeight + bottom;

        // center
        let { dx, dy } = this.getTranslation(this.chart);
        // add rotation
        const rotation = toRadians(this.chart.options.rotation) % (Math.PI * 2.0);
        dx += leftMargin * Math.cos(rotation + Math.PI / 2);
        dy += bottomMargin * Math.sin(rotation + Math.PI / 2);

        // draw
        ctx.save();
        ctx.translate(dx, dy);

        // draw background
        ctx.beginPath();
        addRoundedRectPath(ctx, {
            x,
            y,
            w,
            h,
            radius: borderRadius as unknown as TRBLCorners,
        });
        ctx.fillStyle = backgroundColor;
        ctx.fill();

        // draw value text
        ctx.fillStyle = color || config.options.defaultFontColor;
        const magicNumber = 0.075; // manual testing
        ctx.fillText(valueText, 0, textHeight * magicNumber);

        ctx.restore();
    }

    drawTicks() {
        const { ctx, chartArea } = this.chart;
        const { innerRadius } = this;
        const {
            tickCount,
            tickColor,
            tickFontSize,
            tickInnerPadding,
            tickOuterPadding,
            tickLineLength,
        } = this.options.ticks;

        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        // 计算刻度线和刻度值的半径
        const tickRadius = innerRadius - (tickInnerPadding || 10); // 刻度值的半径
        const lineRadius = tickRadius - (tickLineLength || 5); // 刻度线的起点半径
        const textRadius = lineRadius - (tickOuterPadding || 5); // 刻度值的半径，调整数字与刻度线的距离

        // 计算每个刻度的角度
        const totalTicks = tickCount || 10;
        const angleStep = this._getCircumference() / totalTicks;
        const rotation = this._getRotation();

        ctx.save();
        ctx.translate(centerX + this.offsetX, centerY + this.offsetY);
        ctx.fillStyle = tickColor || '#000';
        ctx.strokeStyle = tickColor || '#000';
        ctx.font = `${tickFontSize || 10}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= totalTicks; i++) {
            const angle = rotation + i * angleStep;
            const xStart = lineRadius * Math.cos(angle);
            const yStart = lineRadius * Math.sin(angle);
            const xEnd = tickRadius * Math.cos(angle);
            const yEnd = tickRadius * Math.sin(angle);
            const xText = textRadius * Math.cos(angle);
            const yText = textRadius * Math.sin(angle);
            const value = this._cachedMeta.minValue + (i / totalTicks) * this._cachedMeta.total;

            // 绘制刻度线
            ctx.beginPath();
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            // 绘制刻度值
            ctx.fillText(value.toFixed(0), xText, yText);
        }

        ctx.restore();
    }

    draw() {
        super.draw();
        this.drawNeedle();

        this.drawValueLabel();
        this.drawTicks();
    }
}

GaugeController.id = 'gauge';

GaugeController.version = Chart.version;

GaugeController.overrides = {
    needle: {
        // Needle circle radius as the percentage of the chart area width
        radiusPercentage: 2,
        // Needle width as the percentage of the chart area width
        widthPercentage: 3.2,
        // Needle length as the percentage of the interval between inner radius (0%) and outer radius (100%) of the arc
        lengthPercentage: 80,
        // The color of the needle
        color: 'rgba(0, 0, 0, 1)',
    },
    valueLabel: {
        // fontSize: undefined
        display: true,
        formatter: null,
        color: 'rgba(255, 255, 255, 1)',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        borderRadius: 5,
        padding: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5,
        },
        bottomMarginPercentage: 5,
        leftMarginPercentage: 0,
    },
    ticks: {
        tickCount: 10,
        tickColor: 'rgba(0, 0, 0, 1)',
        tickFontSize: 12,
        tickInnerPadding: 4,
        tickOuterPadding: 12,
        tickLineLength: 4,
    },
    // The percentage of the chart that we cut out of the middle.
    cutout: '50%',
    // The rotation of the chart, where the first data arc begins.
    rotation: -90,
    // The total circumference of the chart.
    circumference: 180,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            enabled: false,
        },
    },
};
