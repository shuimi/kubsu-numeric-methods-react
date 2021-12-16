import React, { FC, useEffect, useState } from "react";

import { Autocomplete, Box, Checkbox, Group, NumberInput } from "@mantine/core";

import { bisectionIterativeMethod, bisectionRecursiveMethod, secantMethod, parseFunction } from "../../numeric-methods";

import {
    AnimatedAxis,
    AnimatedLineSeries,
    darkTheme,
    Tooltip,
    XYChart
} from "@visx/xychart";
import { curveNatural } from "@visx/curve";

import nj from "numjs";

import { Grid2D, Node2D } from "../../numeric-methods";


export const Label: FC = (props) => {

    return (
        <label style={{
            display: 'block',
            color: '#FFFFFF',
            paddingBottom: '1em',
            fontSize: 14,
        }}>
            {props.children}
        </label>
    );

}


const accessors = {
    xAccessor: (d: Node2D): number => d.x,
    yAccessor: (d: Node2D): number => d.y,
};

const createLinspace = (xLeftBound: number, xRightBound: number, step: number) => {
    let nodes = nj.arange(xLeftBound, xRightBound, step).tolist();
    nodes.push(xRightBound);
    return nodes;
}

export const FunctionRootsTab = () => {

    const [ function2D, setFunction2D ] = useState({
        xLeftBound: -2,
        xRightBound: 7,
        functionString: 'f(x) = x * cos(0.9 * x - 2)',
        function2D: (x: number) => x * Math.cos(0.9 * x - 2),
    });

    const [ iterativeBisectionParams, setIterativeBisectionParams ] = useState({
        epsilon: 10e-8,
        iterationsLimit: 100000,
    });

    const [ recursiveBisectionParams, setRecursiveBisectionParams ] = useState({
        epsilon: 10e-6,
        depthLimit: 22
    });

    const [ secantParams, setSecantParams ] = useState({
        epsilon: 10e-8,
    });


    const onLeftBoundChange = (value?: number) => {
        setFunction2D({
            ...function2D,
            xLeftBound: value || function2D.xLeftBound
        });
        compute();
    }

    const onRightBoundChange = (value?: number) => {
        setFunction2D({
            ...function2D,
            xRightBound: value || function2D.xRightBound
        });
        compute();
    }

    const onFunctionChange = (value: string) => {
        setFunction2D({
            ...function2D,
            functionString: value,
            function2D: parseFunction(value)
        });
        compute();
    }

    const [ result, setResult ] = useState<{
        bisection: {
            iterative: {
                root: number,
                iterations: number
            },
            recursive: {
                roots: Array<number>,
                maxRecursionDepth: number
            }
        },
        secant: {
            root: number,
            iterations: number
        }
    }>({
        bisection: {
            iterative: {
                root: 0,
                iterations: 0
            },
            recursive: {
                roots: [],
                maxRecursionDepth: 0
            }
        },
        secant: {
            root: 0,
            iterations: 0
        }
    });

    const [ sourceFunctionData, setSourceFunctionData ] = useState<Grid2D>([])


    const compute = () => {

        let bisectionIterativeResult = bisectionIterativeMethod(
            function2D.xLeftBound,
            function2D.xRightBound,
            function2D.function2D,
            iterativeBisectionParams.epsilon,
            iterativeBisectionParams.iterationsLimit
        );

        let bisectionRecursiveResult = bisectionRecursiveMethod(
            function2D.xLeftBound,
            function2D.xRightBound,
            function2D.function2D,
            recursiveBisectionParams.epsilon,
            recursiveBisectionParams.depthLimit
        );

        let secantResult = secantMethod(
            function2D.xLeftBound,
            function2D.xRightBound,
            function2D.function2D,
            secantParams.epsilon
        );

        let sourceFunctionData = createLinspace(function2D.xLeftBound, function2D.xRightBound, 0.05).map(x => {
            return {
                x: x,
                y: function2D.function2D(x)
            };
        });

        setResult({
            bisection: {
                iterative: bisectionIterativeResult,
                recursive: bisectionRecursiveResult
            },
            secant: secantResult
        });

        setSourceFunctionData(sourceFunctionData);
    }

    useEffect(() => {
        compute();
    }, []);


    const [showRecursion, setShowRecursion] = useState(false);


    return (
        <Group>
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
                <Label>Function settings</Label>
                <Group>
                    <NumberInput
                        defaultValue={0}
                        precision={2}
                        step={0.05}
                        value={function2D.xLeftBound}
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
                        value={function2D.xRightBound}
                        onChange={onRightBoundChange}
                        placeholder="10"
                        label="Right x bound"
                        description="Defines end of interval"
                        radius="xs"
                        required
                    />
                    <Autocomplete
                        data={[
                            { value: 'f(x) = x * cos(0.9 * x - 2)', label: 'f(x) = x * cos(0.9 * x - 2)' },
                            { value: 'f(x) = x^2 - 3', label: 'f(x) = x^2 - 3' },
                        ]}
                        placeholder="f(x) = 2 * sin(x ^ 2 / 3)"
                        label="Function"
                        description="f(x) function to interpolate"
                        onChange={onFunctionChange}
                        value={function2D.functionString}
                        required
                    />
                </Group>
            </Box>
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
                <Label>Iterative bisection params</Label>
                <Group>
                    <NumberInput
                        defaultValue={0}
                        precision={12}
                        step={0.000000000001}
                        value={iterativeBisectionParams.epsilon}
                        onChange={(value: number) => {
                            setIterativeBisectionParams({
                                ...iterativeBisectionParams,
                                epsilon: value
                            })
                        }}
                        placeholder="0"
                        label="Epsilon"
                        description="Defines method's epsilon"
                        radius="xs"
                        required
                    />
                    <NumberInput
                        defaultValue={0}
                        value={iterativeBisectionParams.iterationsLimit}
                        onChange={(value: number) => {
                            setIterativeBisectionParams({
                                ...iterativeBisectionParams,
                                iterationsLimit: value
                            })
                        }}
                        placeholder="10"
                        label="Iterations limit"
                        description="Defines method's iterations limit"
                        radius="xs"
                        required
                    />
                </Group>
            </Box>
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
                <Label>Recursive bisection params</Label>
                <Group>
                    <NumberInput
                        defaultValue={0}
                        precision={12}
                        step={0.000000000001}
                        value={recursiveBisectionParams.epsilon}
                        onChange={(value: number) => {
                            setRecursiveBisectionParams({
                                ...recursiveBisectionParams,
                                epsilon: value
                            })
                        }}
                        placeholder="0"
                        label="Epsilon"
                        description="Defines method's epsilon"
                        radius="xs"
                        required
                    />
                    <NumberInput
                        defaultValue={0}
                        precision={2}
                        step={0.05}
                        value={recursiveBisectionParams.depthLimit}
                        onChange={(value: number) => {
                            setRecursiveBisectionParams({
                                ...recursiveBisectionParams,
                                depthLimit: value
                            })
                        }}
                        placeholder="10"
                        label="Depth limit"
                        description="Defines recursion depth limit"
                        radius="xs"
                        required
                    />
                </Group>
            </Box>
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
                <Label>Secant method params</Label>
                <Group>
                    <NumberInput
                        defaultValue={0}
                        precision={12}
                        step={0.000000000001}
                        value={secantParams.epsilon}
                        onChange={((value: number) => {
                            setSecantParams({
                                epsilon: value
                            })
                        })}
                        placeholder="0"
                        label="Epsilon"
                        description="Defines method's epsilon"
                        radius="xs"
                        required
                    />
                </Group>
            </Box>
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
                <Label>Iterative bisection roots:</Label>
                <Label>
                    Iterations:<br/>
                    {
                        result.bisection.iterative.iterations
                    }
                </Label>
                <Label>
                    Roots:<br/>
                    {
                        result.bisection.iterative.root
                    }
                </Label>

                <br/><br/>
                <Label>Secant method roots:</Label>
                <Label>
                    Iterations:<br/>
                    {
                        result.secant.iterations
                    }
                </Label>

                <Label>
                    Roots:<br/>
                    {
                        result.secant.root
                    }
                </Label>

                <br/><br/>
                <Label>
                    Non recursive methods inaccuracy:<br/>
                    {
                        Math.abs(result.secant.root - result.bisection.iterative.root)
                    }
                </Label>
            </Box>
            {
                showRecursion &&
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
                        <br/><br/>
                        <Label>Recursive bisection roots:</Label>
                        <Label>
                            Max recursion depth:<br/>
                            {
                                result.bisection.recursive.maxRecursionDepth
                            }
                        </Label>

                        <Label>
                            Roots:<br/>
                            {
                                result.bisection.recursive.roots
                                    .filter(root => Math.abs(Number(root)) > 0.0000225)
                                    .map(root => <p>{root}</p>)
                            }
                        </Label>
                    </Box>
            }
            <Checkbox
                label="Show recursive method result"
                checked={showRecursion} onChange={(event) => setShowRecursion(event.currentTarget.checked)}
            />
            <XYChart height={500} width={700} xScale={{ type: 'linear' }} yScale={{ type: 'linear' }}
                     theme={darkTheme}>
                <AnimatedAxis orientation={'bottom'}/>
                <AnimatedAxis orientation={'left'}/>
                <AnimatedLineSeries dataKey="Source function"
                                    data={sourceFunctionData}
                                    curve={curveNatural} {...accessors}  />
                <AnimatedLineSeries dataKey="Zeroes"
                                    data={[
                                        { x: function2D.xLeftBound, y: 0 },
                                        { x: function2D.xRightBound, y: 0 }
                                    ]}
                                    curve={curveNatural} {...accessors}  />
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
    );

}