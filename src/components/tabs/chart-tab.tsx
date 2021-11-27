import React, { useState } from 'react';

import { Autocomplete, Blockquote, Center, Checkbox, Group, NumberInput } from "@mantine/core";
import { Cross1Icon } from "@radix-ui/react-icons";

import { curveNatural } from "@visx/curve";
import { LegendOrdinal } from "@visx/legend";
import { scaleOrdinal } from "@visx/scale";
import {
    AnimatedAxis,
    Grid,
    AnimatedLineSeries,
    XYChart,
    Tooltip,
    AnimatedGlyphSeries,
    darkTheme,
} from '@visx/xychart';

import nj from 'numjs';

import { interpolateLagrange } from "../../interpolation/lagrange";
import { interpolateSpline } from "../../interpolation/spline";
import { parseFunction } from "../../functions-parser";


export type FunctionData = Array<{
    x: number,
    y: number
}>;

const useFunctionInterpolator = (
    xLeftBound: number,
    xRightBound: number,
    interpolationStep: number,
    estimationStep: number,
    function2D: (x: number) => number
) => {

    const createLinspace = (step: number) => {
        let nodes = nj.arange(xLeftBound, xRightBound, step).tolist();
        nodes.push(xRightBound);
        return nodes;
    }

    const interpolationNodes = createLinspace(interpolationStep).map(x => {
        return {
            x: x,
            y: function2D(x)
        };
    });

    const sourceFunctionData = createLinspace(estimationStep).map(x => {
        return {
            x: x,
            y: function2D(x)
        };
    });

    const lagrangePolyData = createLinspace(estimationStep).map(x => {
        return {
            x: x,
            y: interpolateLagrange(x, interpolationNodes)
        };
    });

    const splinesData = createLinspace(estimationStep).map(x => {
        return {
            x: x,
            y: interpolateSpline(x, interpolationNodes)
        };
    });

    const diffRMS = (one: FunctionData, another: FunctionData) => {
        let sum = 0;
        one.forEach((point, index) => {
            sum += (point.y - another[index].y) ** 2;
        })
        return Math.sqrt(sum);
    }

    const inaccuracyLagrange = () => {
        return diffRMS(sourceFunctionData, lagrangePolyData);
    }

    const inaccuracySpline = () => {
        return diffRMS(sourceFunctionData, splinesData);
    }

    return {
        interpolationNodes,
        sourceFunctionData,
        lagrangePolyData,
        splinesData,
        inaccuracyLagrange,
        inaccuracySpline,
    }
}


const accessors = {
    xAccessor: (d: { x: number, y: number }): number => d.x,
    yAccessor: (d: { x: number, y: number }): number => d.y,
};


export const ChartTab = () => {

    const [ params, setParams ] = useState({
        left: 0,
        right: 10,
        interpolationStep: 1.5,
        estimationStep: 0.1,
        funcString: 'f(x) = 2 * sin(x ^ 2 / 14)',
        func: (x: number) => 2 * Math.sin(x ** 2 / 14),
    });

    const onLeftBoundChange = (value?: number) => {
        setParams({
            ...params,
            left: value || params.left
        });
    }

    const onRightBoundChange = (value?: number) => {
        setParams({
            ...params,
            right: value || params.right
        });
    }

    const onInterpolationStepChange = (value?: number) => {
        setParams({
            ...params,
            interpolationStep: value || params.interpolationStep
        });
    }

    const onEstimationStepChange = (value?: number) => {
        setParams({
            ...params,
            estimationStep: value || params.estimationStep
        });
    }

    const onFunctionChange = (value: string) => {
        setParams({
            ...params,
            funcString: value,
            func: parseFunction(value)
        });
    }

    const {
        interpolationNodes,
        sourceFunctionData,
        lagrangePolyData,
        splinesData,
        inaccuracyLagrange,
        inaccuracySpline,
    } = useFunctionInterpolator(params.left, params.right, params.interpolationStep, params.estimationStep, params.func);


    const [ showNodes, setShowNodes ] = useState(true);
    const [ showSourceFunction, setShowSourceFunction ] = useState(true);
    const [ showLagrange, setShowLagrange ] = useState(true);
    const [ showSplines, setShowSplines ] = useState(true);

    const ordinals = scaleOrdinal({
        domain: [
            'Interpolation nodes',
            'Source function',
            'Lagrange',
            'Splines',
        ],
        range: [
            '#1cabe5',
            '#a5cce7',
            '#eae06c',
            '#fa7c46'
        ],
    });


    return (
        <Center>
            <Group>
                <XYChart height={500} width={700} xScale={{ type: 'linear' }} yScale={{ type: 'linear' }}
                         theme={darkTheme}>
                    <AnimatedAxis orientation={'bottom'}/>
                    <AnimatedAxis orientation={'left'}/>
                    <Grid columns={true} rows={true} numTicks={6}/>
                    {
                        showNodes &&
                        <AnimatedGlyphSeries dataKey="Interpolation Nodes" data={interpolationNodes} {...accessors} />
                    }
                    {
                        showSourceFunction &&
                        <AnimatedLineSeries dataKey="Source function" data={sourceFunctionData}
                                            curve={curveNatural} {...accessors}  />
                    }
                    {
                        showLagrange &&
                        <AnimatedLineSeries dataKey="Lagrange" data={lagrangePolyData}
                                            curve={curveNatural} {...accessors}  />
                    }
                    {
                        showSplines &&
                        <AnimatedLineSeries dataKey="Splines" data={splinesData} curve={curveNatural} {...accessors}  />
                    }
                    <Tooltip
                        snapTooltipToDatumX
                        snapTooltipToDatumY
                        showVerticalCrosshair
                        showSeriesGlyphs
                        renderTooltip={({ tooltipData, colorScale }) => (
                            <div>
                                {/*// @ts-ignore*/}
                                <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>
                                    {/*// @ts-ignore*/}
                                    {tooltipData.nearestDatum.key}
                                </div>
                                {/*// @ts-ignore*/}
                                {accessors.xAccessor(tooltipData.nearestDatum.datum)}
                                {', '}
                                {/*// @ts-ignore*/}
                                {accessors.yAccessor(tooltipData.nearestDatum.datum)}
                            </div>
                        )}
                    />
                </XYChart>
            </Group>
            <Group>
                <LegendOrdinal
                    scale={ordinals}
                    direction="column-reverse"
                    itemDirection="row-reverse"
                    style={{
                        color: '#cccccc',
                        fontSize: 13,
                    }}
                />
                <NumberInput
                    defaultValue={0}
                    precision={2}
                    step={0.05}
                    value={params.left}
                    onChange={onLeftBoundChange}
                    placeholder="0"
                    label="Left x bound"
                    description="Defines start of interval"
                    radius="xs"
                    required
                />
                <NumberInput
                    defaultValue={0}
                    precision={2}
                    step={0.05}
                    value={params.right}
                    onChange={onRightBoundChange}
                    placeholder="10"
                    label="Right x bound"
                    description="Defines end of interval"
                    radius="xs"
                    required
                />
                <NumberInput
                    defaultValue={0.5}
                    precision={2}
                    step={0.05}
                    value={params.interpolationStep}
                    onChange={onInterpolationStepChange}
                    placeholder="0.5"
                    label="Interpolation step"
                    description="Defines split step"
                    radius="xs"
                    required
                />
                <Autocomplete
                    data={[
                        { value: 'f(x) = 2 * sin(x ^ 2 / 3)', label: 'f(x) = 2 * sin(x ^ 2 / 3)' },
                        { value: 'f(x) = sin(x^x)', label: 'f(x) = sin(x^x)' },
                    ]}
                    placeholder="f(x) = 2 * sin(x ^ 2 / 3)"
                    label="Function"
                    description="f(x) function to interpolate"
                    onChange={onFunctionChange}
                    value={params.funcString}
                    required
                />
                <NumberInput
                    defaultValue={0.1}
                    step={0.01}
                    precision={2}
                    value={params.estimationStep}
                    onChange={onEstimationStepChange}
                    placeholder="0.1"
                    label="Estimation step"
                    description="Defines estimation split step"
                    radius="xs"
                    required
                />
                <Blockquote cite="Inaccuracy (computes as DeltaRMS)" icon={<Cross1Icon/>}>
                    Lagrange: {inaccuracyLagrange()} <br/>
                    Spline: {inaccuracySpline()}
                </Blockquote>
                <Group>
                    <Checkbox label='Interpolation nodes' checked={showNodes}
                              onChange={(event) => setShowNodes(event.currentTarget.checked)}/>
                    <Checkbox label='Source function' checked={showSourceFunction}
                              onChange={(event) => setShowSourceFunction(event.currentTarget.checked)}/>
                    <Checkbox label='Lagrange' checked={showLagrange}
                              onChange={(event) => setShowLagrange(event.currentTarget.checked)}/>
                    <Checkbox label='Splines' checked={showSplines}
                              onChange={(event) => setShowSplines(event.currentTarget.checked)}/>
                </Group>
            </Group>
        </Center>
    );
}