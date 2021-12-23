import React, { useEffect, useState } from "react";

import {
    Autocomplete,
    Box,
    Center,
    Code,
    Group,
    NumberInput,
    Text,
    Button,
    useMantineTheme,
    Skeleton, Title
} from "@mantine/core";
import { AnimatedAxis, AnimatedLineSeries, darkTheme, Grid, Tooltip, XYChart } from "@visx/xychart";
import { curveNatural } from "@visx/curve";
import {
    accessors,
    Function1D,
    Function2D,
    GridSet2D,
    Node2D,
    parseFunction,
    useGrid1D
} from "../../numeric-methods";
import { methodRungeKutta } from "../../numeric-methods/cauchy-problem";
import { useMove } from "@mantine/hooks";
import { Label } from "./function-roots-tab";
import {
    GridDescriptor,
    methodSchmidt1D,
    SpatialCondition,
    TemporalCondition
} from "../../numeric-methods/schmidt-method";
import { GroupBox } from "./integrals-tab";
//@ts-ignore
import Plot from 'react-plotly.js';


export const Card = (props: { title: string, inaccuracy: number, description?: string, loading: boolean }) => {

    const CodeBlockStyle = { margin: '0.1em', padding: '0.3em' }

    return (
        <Skeleton visible={props.loading}>
            <Title order={4}>{props.title}</Title>
            <Text>{props.description}</Text>
            <Label>
                <Code style={CodeBlockStyle} block>{props.inaccuracy}</Code>
            </Label>
        </Skeleton>
    )
}


export const HeatEquationTab = () => {

    const [ functionsData, setFunctionsData ] = useState<Array<{
        key: string,
        data: GridSet2D
    }>>([]);

    const [ solutionsAmount, setSolutionsAmount ] = useState<number>(0);

    const [ numericSolution, setNumericSolution ] = useState<Array<GridSet2D>>();

    const incrementSolutionsAmount = () => setSolutionsAmount(amount => amount + 1);

    const addFunctionData = (data: GridSet2D) => {
        setFunctionsData([
            ...functionsData,
            {
                key: `Solution ${solutionsAmount}; `,
                data: data
            }
        ]);
        incrementSolutionsAmount();
    }

    const [ methodParams, setMethodParams ] = useState<{
        temporalCondition: TemporalCondition,
        spatialCondition: SpatialCondition,
        grid: GridDescriptor

    }>({
        temporalCondition: {
            startingMoment: 0,
            condition: x => Math.sin(x)
        },
        spatialCondition: {
            leftBound: 0,
            rightBound: Math.PI / 2,
            conditionLeft: t => 0,
            conditionRight: t => Math.exp(-t),
        },
        grid: {
            temporalStep: 0.004,
            temporalCounts: 250,
            spatialStep: 0.1,
        }
    })


    const distance = (solution: GridSet2D, time: number, analyticSolution: Function2D) => {
        let distance = solution
            .map(node => {
                return (analyticSolution(time, node.x) - node.y) ** 2;
            })
            .reduce((sum, value) => sum + value)
        return distance;
    }


    const planeEuclideanDistance = (numericSolution: Array<GridSet2D>, analyticSolution: Function2D) => {

        let _distance = 0;

        for (
            let t = methodParams.temporalCondition.startingMoment, index = 0;
            t < methodParams.grid.temporalStep * methodParams.grid.temporalCounts;
            t += methodParams.grid.temporalStep, index++
        ) {
            _distance += distance(numericSolution[index], t, analyticSolution);
        }

        return Math.sqrt(_distance);
    }


    const maxDistance = (numericSolution: Array<GridSet2D>, analyticSolution: Function2D) => {

        let maxDistance = 0;

        for (
            let t = methodParams.temporalCondition.startingMoment, index = 0;
            t < methodParams.grid.temporalStep * methodParams.grid.temporalCounts;
            t += methodParams.grid.temporalStep, index++
        ) {

            numericSolution[index]
                .forEach(node => {
                    maxDistance = Math.max(Math.abs(analyticSolution(t, node.x) - node.y), maxDistance)
                })
        }

        return maxDistance;
    }

    const maxEuclideanDistance = (numericSolution: Array<GridSet2D>, analyticSolution: Function2D) => {

        let _distance = 0;

        for (
            let t = methodParams.temporalCondition.startingMoment, index = 0;
            t < methodParams.grid.temporalStep * methodParams.grid.temporalCounts;
            t += methodParams.grid.temporalStep, index++
        ) {
            _distance = Math.max(Math.sqrt(distance(numericSolution[index], t, analyticSolution)), _distance);
        }

        return _distance;
    }

    const meanSquaredError = (numericSolution: Array<GridSet2D>, analyticSolution: Function2D) => {
        let _distance = 0;
        let amount = 0;

        for (
            let t = methodParams.temporalCondition.startingMoment, index = 0;
            t < methodParams.grid.temporalStep * methodParams.grid.temporalCounts;
            t += methodParams.grid.temporalStep, index++
        ) {
            amount++;
            _distance += distance(numericSolution[index], t, analyticSolution);
        }

        return _distance / amount;
    }


    useEffect(() => {


        let result = methodSchmidt1D(methodParams.temporalCondition, methodParams.spatialCondition, methodParams.grid);

        setNumericSolution(result);

        setFunctionsData(
            result
                .map((data, index) => {
                    return {
                        key: `Solution ${index}; `,
                        data: data
                    }
                })
        )

    }, []);


    const formatNumber = (x: number, digit: number) => {
        return Math.round(x * (10 ** digit)) / (10 ** digit);
    }


    return (
        <Center>
            <Group>
                <Group>
                    <XYChart height={540} width={860} xScale={{ type: 'linear' }} yScale={{ type: 'linear' }}
                             theme={darkTheme}>
                        <AnimatedAxis orientation={'bottom'}/>
                        <AnimatedAxis orientation={'left'}/>
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
                <GroupBox>
                    {
                        numericSolution &&
                        <Card title={'Plane euclidean distance'}
                              description={'through all time'}
                              inaccuracy={planeEuclideanDistance(numericSolution, (x, y) => Math.exp(-x) * Math.sin(y))}
                              loading={false}
                        />
                    }
                    {
                        numericSolution &&
                        <Card title={'Mean squared error'}
                              description={'through all time'}
                              inaccuracy={meanSquaredError(numericSolution, (x, y) => Math.exp(-x) * Math.sin(y))}
                              loading={false}
                        />
                    }
                    {
                        numericSolution &&
                        <Card title={'Max euclidean distance'}
                              description={'through all time'}
                              inaccuracy={maxEuclideanDistance(numericSolution, (x, y) => Math.exp(-x) * Math.sin(y))}
                              loading={false}
                        />
                    }
                    {
                        numericSolution &&
                        <Card title={'Max distance'}
                              description={'through all time on fixed time step'}
                              inaccuracy={maxDistance(numericSolution, (x, y) => Math.exp(-x) * Math.sin(y))}
                              loading={false}
                        />
                    }
                </GroupBox>
                <GroupBox>
                    <Plot
                        style={{
                            display: 'block'
                        }}
                        data={[
                            {
                                z: numericSolution?.map(solution => solution.map(grid => grid.y).reverse()),
                                //@ts-ignore
                                type: 'surface',
                            },
                        ]}
                        layout={ {
                            title: 'Heat Equation Solution',
                            autosize: true,
                            width: 500,
                            height: 500,
                            margin: {
                                l: 65,
                                r: 50,
                                b: 65,
                                t: 90,
                            }
                        } }
                    />
                </GroupBox>
            </Group>
        </Center>
    );

}