import React, { useEffect, useState } from "react";

import { Autocomplete, Box, Center, Code, Group, NumberInput, Text, Button, useMantineTheme } from "@mantine/core";
import { AnimatedAxis, AnimatedLineSeries, darkTheme, Grid, Tooltip, XYChart } from "@visx/xychart";
import { curveNatural } from "@visx/curve";
import { accessors, Function3D, Grid2D, Node2D, parseFunction, useGrid1D } from "../../numeric-methods";
import { methodRungeKutta } from "../../numeric-methods/cauchy-problem";
import { useMove } from "@mantine/hooks";
import { Label } from "./function-roots-tab";


export const CauchyProblemTab = () => {

    const theme = useMantineTheme();

    const [ startingConstraints, setStartingConstraints ] = useState({
        minX: -2,
        minY: -2,
        maxX: 3,
        maxY: 5
    });

    const [ startingPoint, setStartingPoint ] = useState({ x: 0.2, y: 0.6 });

    const { ref, active } = useMove(
        ({ x, y }) => setStartingPoint({
            x: (startingConstraints.maxX - startingConstraints.minX) * x + startingConstraints.minX,
            y: (startingConstraints.maxY - startingConstraints.minY) * (1.0 - y) + startingConstraints.minY
        })
    );


    const [ functionsData, setFunctionsData ] = useState<Array<{
        key: string,
        data: Grid2D
    }>>([]);

    const [ solutionsAmount, setSolutionsAmount ] = useState<number>(0);
    const incrementSolutionsAmount = () => setSolutionsAmount(amount => amount + 1);

    const addFunctionData = (data: Grid2D) => {
        setFunctionsData([
            ...functionsData,
            {
                key: `Solution ${solutionsAmount}; `,
                data: data
            }
        ]);
        incrementSolutionsAmount();
    }

    const cleatFunctionsData = () => {
        setFunctionsData([]);
        setSolutionsAmount(0);
    }


    const [ methodParams, setMethodParams ] = useState<{
        function3D: Function3D,
        stringFunction3D: string,
        step: number,
        segments: number,

    }>({
        function3D: (x, y) => x * x * y,
        stringFunction3D: 'f(x, y) = x^2 * y',
        step: 0.01,
        segments: 100
    })

    const [analyticSolution, setAnalyticSolution] = useState({
        stringFunction: `f(x) = ${(startingPoint.y) / (Math.exp((startingPoint.x ** 3) / 3))} * exp(x ** 3 / 3)`,
        function2D: (x: number) => ((startingPoint.y) / (Math.exp((startingPoint.x ** 3) / 3))) * Math.exp((x ** 3) / 3)
    })

    useEffect(() => {
        addFunctionData(
            methodRungeKutta(
                methodParams.function3D,
                startingPoint,
                methodParams.step,
                methodParams.segments
            )
        );
    }, []);

    const [ phaseSurfaceSplit, setPhaseSurfaceSplit ] = useState({
        xSplitStep: 0.2,
        ySplitStep: 0.2
    });

    const phasePlane = () => {

        let data = [];

        let i = 0;

        for (let x = startingConstraints.minX; x <= startingConstraints.maxX; x += phaseSurfaceSplit.xSplitStep) {
            for (let y = startingConstraints.minY; y <= startingConstraints.maxY; y += phaseSurfaceSplit.ySplitStep) {
                i++;
                data.push({
                    key: `Solution ${solutionsAmount + i}; `,
                    data: methodRungeKutta(
                        methodParams.function3D,
                        { x: x, y: y },
                        methodParams.step,
                        methodParams.segments
                    )
                })

            }
        }

        console.log(data);

        setFunctionsData([
            ...functionsData,
            ...data
        ])

    }


    const formatNumber = (x: number, digit: number) => {
        return Math.round(x * (10 ** digit)) / (10 ** digit);
    }

    const onFunctionChange = (value: string) => {
        setMethodParams({
            ...methodParams,
            stringFunction3D: value,
            function3D: parseFunction(value)
        });
    }

    const [inaccuracy, setInaccuracy] = useState(0);


    return (
        <Center>
            <Group>
                <XYChart height={500} width={700} xScale={{ type: 'linear' }} yScale={{ type: 'linear' }}
                         theme={darkTheme}>
                    <AnimatedAxis orientation={'bottom'}/>
                    <AnimatedAxis orientation={'left'}/>
                    {/*<Grid columns={true} rows={true} numTicks={6}/>*/}
                    {
                        functionsData.map(data =>
                            <AnimatedLineSeries dataKey={data.key} data={data.data}
                                                curve={curveNatural} {...accessors}  />
                        )
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
            <Group direction={"column"}>
                <>
                    <div
                        ref={ref}
                        style={{
                            width: 400,
                            height: 120,
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                left: `calc(${(startingPoint.x - startingConstraints.minX) / (startingConstraints.maxX - startingConstraints.minX) * 100}% - 8px)`,
                                bottom: `calc(${(startingPoint.y - startingConstraints.minY) / (startingConstraints.maxY - startingConstraints.minY) * 100}% - 8px)`,
                                width: 16,
                                height: 16,
                                backgroundColor: active ? theme.colors.teal[7] : theme.colors.blue[7],
                            }}
                        />
                    </div>
                    <Text>
                        Starting
                        point: <Code>{`{ x: ${formatNumber(startingPoint.x, 4)}, y: ${formatNumber(startingPoint.y, 4)} }`}</Code>
                    </Text>
                </>
                <Group>
                    <Group direction={'column'}>
                        <NumberInput
                            step={10}
                            value={methodParams.segments}
                            onChange={(value) => setMethodParams({
                                ...methodParams,
                                segments: value || 100
                            })}
                            placeholder="100"
                            label="Grid segments number"
                            description="Defines method's segments amount"
                            radius="xs"
                            required
                        />
                        <NumberInput
                            step={0.0001}
                            precision={8}
                            value={methodParams.step}
                            onChange={(value) => setMethodParams({
                                ...methodParams,
                                step: value || 0.01
                            })}
                            placeholder="1000"
                            label="Step"
                            description="Defines method's  step"
                            radius="xs"
                            required
                        />
                        <Autocomplete
                            data={[]}
                            value={methodParams.stringFunction3D}
                            onChange={onFunctionChange}
                            placeholder="f(x, y) = 2 * sin(x ^ 2 / 3)"
                            label="f(x, y)"
                            description="For dy/dx = f(x, y)"
                            required
                        />
                    </Group>
                    <Box
                        sx={(theme) => ({
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                            textAlign: 'center',
                            display: 'block',
                            padding: theme.spacing.xs,
                            borderRadius: theme.radius.md,
                        })}
                        style={{
                            marginRight: '2em'
                        }}
                    >
                        <Group direction={'column'}>
                            <NumberInput
                                defaultValue={-2}
                                placeholder="-2.0"
                                label="Min x value"
                                variant="filled"
                                radius="xs"
                                size="xs"
                                value={startingConstraints.minX}
                                onChange={(value) => {
                                    setStartingConstraints({
                                        ...startingConstraints,
                                        minX: value || startingConstraints.minX
                                    })
                                }}
                                required
                            />
                            <NumberInput
                                defaultValue={5}
                                placeholder="-2.0"
                                label="Max x value"
                                variant="filled"
                                radius="xs"
                                size="xs"
                                value={startingConstraints.maxX}
                                onChange={(value) => {
                                    setStartingConstraints({
                                        ...startingConstraints,
                                        maxX: value || startingConstraints.maxX
                                    })
                                }}
                                required
                            />
                            <NumberInput
                                defaultValue={-2}
                                placeholder="-2.0"
                                label="Min y value"
                                variant="filled"
                                radius="xs"
                                size="xs"
                                value={startingConstraints.minY}
                                onChange={(value) => {
                                    setStartingConstraints({
                                        ...startingConstraints,
                                        minY: value || startingConstraints.minY
                                    })
                                }}
                                required
                            />
                            <NumberInput
                                defaultValue={3}
                                placeholder="-2.0"
                                label="Max y value"
                                variant="filled"
                                radius="xs"
                                size="xs"
                                value={startingConstraints.maxY}
                                onChange={(value) => {
                                    setStartingConstraints({
                                        ...startingConstraints,
                                        maxY: value || startingConstraints.maxY
                                    })
                                }}
                                required
                            />
                        </Group>
                    </Box>
                    <Group direction={'column'}>
                        <NumberInput
                            step={0.1}
                            precision={2}
                            value={phaseSurfaceSplit.xSplitStep}
                            onChange={(value) => {
                                setPhaseSurfaceSplit({
                                    ...phaseSurfaceSplit,
                                    xSplitStep: Number(value)
                                })
                            }}
                            placeholder="-2.0"
                            label="x split"
                            variant="filled"
                            size="xs"
                            required
                        />
                        <NumberInput
                            step={0.1}
                            precision={2}
                            value={phaseSurfaceSplit.ySplitStep}
                            onChange={(value) => {
                                setPhaseSurfaceSplit({
                                    ...phaseSurfaceSplit,
                                    ySplitStep: Number(value)
                                })
                            }}
                            placeholder="-2.0"
                            label="y split"
                            variant="filled"
                            size="xs"
                            required
                        />
                        <Button onClick={() => phasePlane()}>
                            Plot phase map
                        </Button>
                    </Group>
                    <Box
                        sx={(theme) => ({
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                            textAlign: 'center',
                            display: 'block',
                            padding: theme.spacing.xs,
                            borderRadius: theme.radius.md,
                        })}>
                        <Autocomplete
                            data={[]}
                            value={analyticSolution.stringFunction}
                            onChange={(value) => {
                                setAnalyticSolution({
                                    stringFunction: value,
                                    function2D: parseFunction(value)
                                })
                            }}
                            placeholder="f(y) = 1,671 * exp(x ^ 3 / 3)"
                            label="f(y)"
                            description="Analytic solution for dy/dx = f(x, y) in chosen point"
                            required
                        />
                        <br/>
                        <Label>
                            Inaccuracy
                        </Label>
                        <Label>
                            {inaccuracy}
                        </Label>
                    </Box>
                </Group>
                <Group>
                    <Button onClick={() => {

                        let result = methodRungeKutta(
                            methodParams.function3D,
                            startingPoint,
                            methodParams.step,
                            methodParams.segments
                        )

                        let inaccuracy = 0;

                        result.forEach((node) => {
                            console.log(node.x, node.y, analyticSolution.function2D(node.x))
                            inaccuracy += (node.y - analyticSolution.function2D(node.x)) ** 2;
                        })

                        addFunctionData(result);
                        setInaccuracy(Math.sqrt(inaccuracy));

                    }}>
                        Add to plot
                    </Button>
                    <Button onClick={() => cleatFunctionsData()}>
                        Clear plot
                    </Button>
                </Group>
            </Group>
        </Center>
    );

}