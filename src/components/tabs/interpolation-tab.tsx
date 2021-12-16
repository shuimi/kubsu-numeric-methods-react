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

import {
    accessors,
    interpolateLagrange,
    interpolateSpline,
    parseFunction, useEuclideanDistance,
    useFunctionData2D,
    useGrid1D,
    useInterpolation,
    GridDescriptor
} from "../../numeric-methods";


export const InterpolationTab = () => {

    const [ grid, setGrid ] = useState<GridDescriptor>({
        leftBound: 0,
        rightBound: 10,
        num: 0.1,
    })

    const [ parameters, setParameters ] = useState({
        interpolationStep: 1.5,
        functionString: 'f(x) = 2 * sin(x ^ 2 / 14)',
        function2D: (x: number) => 2 * Math.sin(x ** 2 / 14),
    });

    const onLeftBoundChange = (value?: number) => {
        setGrid({
            ...grid,
            leftBound: value || grid.leftBound
        });
    }

    const onRightBoundChange = (value?: number) => {
        setGrid({
            ...grid,
            rightBound: value || grid.rightBound
        });
    }

    const onEstimationStepChange = (value?: number) => {
        setGrid({
            ...grid,
            num: value || grid.num
        });
    }

    const onInterpolationStepChange = (value?: number) => {
        setParameters({
            ...parameters,
            interpolationStep: value || parameters.interpolationStep
        });
    }

    const onFunctionChange = (value: string) => {
        setParameters({
            ...parameters,
            functionString: value,
            function2D: parseFunction(value)
        });
    }

    const interpolationNodesGrid = useGrid1D(grid.leftBound, grid.rightBound, parameters.interpolationStep);
    const plottingPrecisionGrid = useGrid1D(grid.leftBound, grid.rightBound, grid.num);

    const interpolationNodes = useFunctionData2D(
        interpolationNodesGrid,
        parameters.function2D
    );

    const sourceFunctionData = useFunctionData2D(
        plottingPrecisionGrid,
        parameters.function2D
    );

    const interpolatedDataLagrange = useInterpolation(
        plottingPrecisionGrid,
        interpolationNodes,
        interpolateLagrange
    );

    const interpolatedDataSplines = useInterpolation(
        plottingPrecisionGrid,
        interpolationNodes,
        interpolateSpline
    );

    const inaccuracyLagrange = useEuclideanDistance(
        sourceFunctionData,
        interpolatedDataLagrange
    );

    const inaccuracySpline = useEuclideanDistance(
        sourceFunctionData,
        interpolatedDataSplines
    );


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
                        <AnimatedLineSeries dataKey="Lagrange" data={interpolatedDataLagrange}
                                            curve={curveNatural} {...accessors}  />
                    }
                    {
                        showSplines &&
                        <AnimatedLineSeries dataKey="Splines" data={interpolatedDataSplines} curve={curveNatural} {...accessors}  />
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
                    value={grid.leftBound}
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
                    value={grid.rightBound}
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
                    value={parameters.interpolationStep}
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
                    value={parameters.functionString}
                    required
                />
                <NumberInput
                    defaultValue={0.1}
                    step={0.01}
                    precision={2}
                    value={grid.num}
                    onChange={onEstimationStepChange}
                    placeholder="0.1"
                    label="Estimation step"
                    description="Defines estimation split step"
                    radius="xs"
                    required
                />
                <Blockquote cite="Inaccuracy (computes as Euclidian distance)" icon={<Cross1Icon/>}>
                    Lagrange: {inaccuracyLagrange} <br/>
                    Spline: {inaccuracySpline}
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