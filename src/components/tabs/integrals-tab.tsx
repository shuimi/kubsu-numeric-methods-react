import React, { FC, useEffect, useState } from "react";

import {
    Autocomplete,
    Box,
    Center,
    Code,
    Group,
    List,
    NumberInput,
    Title,
    Text,
    Switch,
    Skeleton,
    Loader,
    Notification, NativeSelect, Slider, Select
} from "@mantine/core";

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
    integrateTrapezoidMethod, withEpsilon, getGrid1D
} from "../../numeric-methods";

import { Label } from "./function-roots-tab";
import { useWebWorker } from "../../numeric-methods/web-workers";
import { useNotifications } from "@mantine/notifications";

const ChartTooltip = (props: { tooltipData: any, colorScale: any }) => (
    <div>
        {/*// @ts-ignore*/}
        <div style={{ color: props.colorScale(props.tooltipData.nearestDatum.key) }}>
            {/*// @ts-ignore*/}
            {props.tooltipData.nearestDatum.key}
        </div>
        {/*// @ts-ignore*/}
        {accessors.xAccessor(props.tooltipData.nearestDatum.datum)}
        {', '}
        {/*// @ts-ignore*/}
        {accessors.yAccessor(props.tooltipData.nearestDatum.datum)}
    </div>
)

const Card = (props: {title: string, value: number, inaccuracy: number, loading: boolean}) => {

    const CodeBlockStyle = {margin: '0.1em', padding: '0.3em'}

    return (
        <Skeleton visible={ props.loading }>
            <Title order={4}>{ props.title }</Title>
            <Code style={CodeBlockStyle} block>{props.value}</Code>
            <Label>
                <Text size="sm">Inaccuracy:</Text>
                <Code style={CodeBlockStyle} block>{props.inaccuracy}</Code>
            </Label>
        </Skeleton>
    )
}

const GroupBox: FC = (props) => {
    return (
        <Box
            // @ts-ignore
            sx={(theme) => ({
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                textAlign: 'center',
                display: 'block',
                width: '14em',
                padding: theme.spacing.xs,
                borderRadius: theme.radius.md,
            })}
        >
            <Group>
                {props.children}
            </Group>
        </Box>
    )
}

const EPSILONS = [
    { num: 1e-4, label: '1e-4' },
    { num: 1e-6, label: '1e-6' },
    { num: 1e-8, label: '1e-8' },
    { num: 1e-12, label: '1e-12' },
    { num: 1e-16, label: '1e-16' },
    { num: 1e-18, label: '1e-18' },
];

export const IntegralsTab = () => {

    const [ grid, setGrid ] = useState<GridDescriptor>({
        leftBound: 0,
        rightBound: 10,
        num: 10,
    });

    const [ function2D, setFunction2D ] = useState({
        functionString: 'f(x) = 0.02 * (x * x) * sin(2 * x)',
        function2D: (x: number) => 0.02 * (x * x) * Math.sin(2 * x),
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
        setFunction2D({
            ...function2D,
            functionString: value,
            function2D: parseFunction(value)
        });
    }


    const [epsilon, setEpsilon] = useState(1e-6);

    const plottingPrecisionGrid = useGrid1DSegmentsNum(grid.leftBound, grid.rightBound, 200);

    const functionData = useFunctionData2D(
        plottingPrecisionGrid,
        function2D.function2D
    );

    const [rectangleIntegral, setRectangleIntegral] = useState<number>(0);
    const [trapezoidIntegral, setTrapezoidIntegral] = useState<number>(0);
    const [simpsonIntegral, setSimpsonIntegral] = useState<number>(0);

    const [analyticIntegral, setAnalyticIntegral] = useState<number>(0);


    // const {result, run} = useWebWorker(withEpsilon(
    //     function2D.function2D,
    //     grid.leftBound,
    //     grid.rightBound,
    //     grid.num,
    //     integrateRectangleMethod,
    //     epsilon
    // ))

    const [doubling, setDoubling] = useState(false);
    const [processing, setProcessing] = useState(false);

    const notifications = useNotifications();


    useEffect(() => {

        setProcessing(true);

        let notificationId = notifications.showNotification({
            title: 'Please wait!',
            message: `We're processing your data`,
        })


        setTimeout(async () => {

            let grid1D = getGrid1D(grid.leftBound, grid.rightBound, grid.num);

            setRectangleIntegral(
                doubling
                    ?
                    withEpsilon(
                        function2D.function2D,
                        grid.leftBound,
                        grid.rightBound,
                        grid.num,
                        integrateRectangleMethod,
                        epsilon
                    )
                    :
                    integrateRectangleMethod(function2D.function2D, grid1D)
            );

            setTrapezoidIntegral(
                doubling
                    ?
                    withEpsilon(
                        function2D.function2D,
                        grid.leftBound,
                        grid.rightBound,
                        grid.num,
                        integrateTrapezoidMethod,
                        epsilon
                    )
                    :
                    integrateTrapezoidMethod(function2D.function2D, grid1D)
            );

            setSimpsonIntegral(
                doubling
                    ?
                    withEpsilon(
                        function2D.function2D,
                        grid.leftBound,
                        grid.rightBound,
                        grid.num,
                        integrateSimpsonMethod,
                        epsilon
                    )
                    :
                    integrateSimpsonMethod(function2D.function2D, grid1D)
            );

            let analyticSolution = (x: number) => 0.005 * (2 * x * Math.sin(2 * x) + (1 - 2 * x * x) * Math.cos(2 * x));
            let _analiticIntegral = (-analyticSolution(grid.leftBound) + analyticSolution(grid.rightBound));
            setAnalyticIntegral(_analiticIntegral);

            notifications.hideNotification(notificationId);
            setProcessing(false);

        }, 100)


    }, [grid, epsilon, doubling]);

    // const rectangleIntegral = integrateRectangleMethod(parameters.function2D, plottingPrecisionGrid);
    // const trapezoidIntegral = integrateTrapezoidMethod(parameters.function2D, plottingPrecisionGrid);
    // const simpsonIntegral = integrateSimpsonMethod(parameters.function2D, plottingPrecisionGrid);
    //

    const formatNumber = (x: number, digit: number) => {
        return Math.round(x * (10 ** digit)) / (10 ** digit);
    }

    const inaccuracy = (analytic: number, numeric: number) => {
        return formatNumber(Math.abs(analytic - numeric), 16);
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
                        // @ts-ignore
                        renderTooltip={ChartTooltip}
                    />
                </XYChart>
            </Group>
            <Group>
                <GroupBox>
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
                </GroupBox>
                <GroupBox>
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
                        value={function2D.functionString}
                        required
                    />
                    {
                        processing
                            ?
                            <Loader />
                            :
                            <Switch label='Use doubling the precision of meshing' checked={doubling}
                                    onChange={(event) => {
                                        setDoubling(event.currentTarget.checked)
                                    }}
                            />
                    }
                </GroupBox>
                <GroupBox>
                    <Card title={'Rectangle'}
                          value={rectangleIntegral}
                          inaccuracy={inaccuracy(analyticIntegral, rectangleIntegral)}
                          loading={processing}
                    />
                    <Card title={'Trapezoid'}
                          value={trapezoidIntegral}
                          inaccuracy={inaccuracy(analyticIntegral, trapezoidIntegral)}
                          loading={processing}
                    />
                    <Card title={'Simpson'}
                          value={simpsonIntegral}
                          inaccuracy={inaccuracy(analyticIntegral, simpsonIntegral)}
                          loading={processing}
                    />
                </GroupBox>
            </Group>
        </Center>
    );

}