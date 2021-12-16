import React, { useEffect, useState } from "react";

import { Autocomplete, Box, Center, Code, Group, NumberInput, Text, Button, useMantineTheme } from "@mantine/core";
import { AnimatedAxis, AnimatedLineSeries, darkTheme, Grid, Tooltip, XYChart } from "@visx/xychart";
import { curveNatural } from "@visx/curve";
import {
    accessors,
    Function2D,
    Function3D,
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


export const HeatEquationTab = () => {

    const [ functionsData, setFunctionsData ] = useState<Array<{
        key: string,
        data: GridSet2D
    }>>([]);

    const [ solutionsAmount, setSolutionsAmount ] = useState<number>(0);
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

    const cleatFunctionsData = () => {
        setFunctionsData([]);
        setSolutionsAmount(0);
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
            temporalStep: 0.005,
            temporalCounts: 50,
            spatialStep: 0.1,
        }
    })


    useEffect(() => {
        setFunctionsData(
            methodSchmidt1D(methodParams.temporalCondition, methodParams.spatialCondition, methodParams.grid)
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
                <XYChart height={500} width={700} xScale={{ type: 'linear' }} yScale={{ type: 'linear' }}
                         theme={darkTheme}>
                    <AnimatedAxis orientation={'bottom'}/>
                    <AnimatedAxis orientation={'left'}/>
                    {
                        functionsData.map(data =>
                            <AnimatedLineSeries dataKey={data.key} data={data.data} curve={curveNatural} {...accessors}  />
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
        </Center>
    );

}