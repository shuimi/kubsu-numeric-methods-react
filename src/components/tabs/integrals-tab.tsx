import React, { useEffect, useState } from "react";

import { Autocomplete, Box, Center, Group, NumberInput } from "@mantine/core";

import {
    AnimatedAxis,
    AnimatedLineSeries,
    darkTheme,
    Grid,
    Tooltip,
    XYChart
} from "@visx/xychart";
import { curveNatural } from "@visx/curve";

import {
    accessors,
    GridDescriptor,
    parseFunction,
    useFunctionData2D,
    useGrid1DSegmentsNum,
    integrateRectangleMethod,
    integrateSimpsonMethod,
    integrateTrapezoidMethod, withEpsilon
} from "../../numeric-methods";

import { Label } from "./function-roots-tab";


export const IntegralsTab = () => {

    const [ grid, setGrid ] = useState<GridDescriptor>({
        leftBound: 0,
        rightBound: 10,
        num: 10,
    });

    const [ parameters, setParameters ] = useState({
        functionString: 'f(x) = 2 * sin(2 * x)',
        function2D: (x: number) => 2 * Math.sin(2 * x),
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

    const onGridStepChange = (value?: number) => {
        setGrid({
            ...grid,
            num: value || grid.num
        });
    }

    const onFunctionChange = (value: string) => {
        setParameters({
            ...parameters,
            functionString: value,
            function2D: parseFunction(value)
        });
    }


    const [epsilon, setEpsilon] = useState(1e-6);

    const plottingPrecisionGrid = useGrid1DSegmentsNum(grid.leftBound, grid.rightBound, 200);

    const functionData = useFunctionData2D(
        plottingPrecisionGrid,
        parameters.function2D
    );

    const [rectangleIntegral, setRectangleIntegral] = useState<number>(0);
    const [trapezoidIntegral, setTrapezoidIntegral] = useState<number>(0);
    const [simpsonIntegral, setSimpsonIntegral] = useState<number>(0);
    const [analyticIntegral, setAnalyticIntegral] = useState<number>(0);

    useEffect(() => {

        setRectangleIntegral(
            withEpsilon(
                parameters.function2D,
                grid.leftBound,
                grid.rightBound,
                grid.num,
                integrateRectangleMethod,
                epsilon
            )
        );

        setTrapezoidIntegral(
            withEpsilon(
                parameters.function2D,
                grid.leftBound,
                grid.rightBound,
                grid.num,
                integrateTrapezoidMethod,
                epsilon
            )
        );

        setSimpsonIntegral(
            withEpsilon(
                parameters.function2D,
                grid.leftBound,
                grid.rightBound,
                grid.num,
                integrateSimpsonMethod,
                epsilon
            )
        );

        let _analiticIntegral = (-Math.cos(2 * grid.rightBound) + Math.cos(2 * grid.leftBound));
        setAnalyticIntegral(_analiticIntegral);

    }, [grid, epsilon]);

    // const rectangleIntegral = integrateRectangleMethod(parameters.function2D, plottingPrecisionGrid);
    // const trapezoidIntegral = integrateTrapezoidMethod(parameters.function2D, plottingPrecisionGrid);
    // const simpsonIntegral = integrateSimpsonMethod(parameters.function2D, plottingPrecisionGrid);
    //

    const formatNumber = (x: number, digit: number) => {
        return Math.round(x * (10 ** digit)) / (10 ** digit);
    }


    return (
        <Center>
            <Group>
                <XYChart height={500} width={700} xScale={{ type: 'linear' }} yScale={{ type: 'linear' }}
                         theme={darkTheme}>
                    <AnimatedAxis orientation={'bottom'}/>
                    <AnimatedAxis orientation={'left'}/>
                    <Grid columns={true} rows={true} numTicks={6}/>
                    <AnimatedLineSeries dataKey="Source function" data={functionData} curve={curveNatural} {...accessors}  />
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
                <Group>
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
                        step={1}
                        value={grid.num}
                        onChange={onGridStepChange}
                        placeholder="1000"
                        label="Grid segments number"
                        description="Defines split step"
                        radius="xs"
                        required
                    />
                    <NumberInput
                        step={0.000000001}
                        precision={12}
                        value={epsilon}
                        onChange={(value) => setEpsilon(value || epsilon)}
                        placeholder="1000"
                        label="Epsilon"
                        description="Defines methods epsilon parameter"
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
                        description="f(x) function to integrate"
                        onChange={onFunctionChange}
                        value={parameters.functionString}
                        required
                    />
                </Group>
                <Box
                    sx={(theme) => ({
                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                        textAlign: 'center',
                        display: 'block',
                        width: '14em',
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                    })}
                >
                    <Label>Rectangle:</Label>
                    <Label>
                        {rectangleIntegral}
                    </Label>
                    <Label>
                        Inaccuracy:
                        {formatNumber(Math.abs(analyticIntegral - rectangleIntegral), 12)}
                    </Label>
                    <Label>Trapezoid:</Label>
                    <Label>
                        {trapezoidIntegral}
                    </Label>
                    <Label>
                        Inaccuracy:
                        {formatNumber(Math.abs(analyticIntegral - trapezoidIntegral), 12)}
                    </Label>
                    <Label>Simpson:</Label>
                    <Label>
                        {simpsonIntegral}
                    </Label>
                    <Label>
                        Inaccuracy:
                        {formatNumber(Math.abs(analyticIntegral - simpsonIntegral), 12)}
                    </Label>
                </Box>
            </Group>
        </Center>
    );

}