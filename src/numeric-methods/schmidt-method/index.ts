import { Function1D, Function2D, Grid2D, GridSet2D } from "../__shared-types";
import nj from "numjs";


export interface TemporalCondition {
    startingMoment: number,
    condition: Function1D & Function2D
}

export interface SpatialCondition {
    leftBound: number,
    rightBound: number,
    conditionLeft: Function1D & Function2D,
    conditionRight: Function1D & Function2D,
}

export interface GridDescriptor {
    temporalStep: number,
    temporalCounts: number,
    spatialStep: number,
}


/**
 * Schmidt method.
 * For problems like du/dt = d^2^u/dt^2^
 */
export const methodSchmidt1D = (
    temporalCondition: TemporalCondition,
    spatialCondition: SpatialCondition,
    grid: GridDescriptor
): Array<GridSet2D> => {

    let gridMesh = grid.temporalStep / (grid.spatialStep ** 2);

    if (gridMesh <= 0 || gridMesh > 0.5) {
        throw new Error(`The method is not applicable for the given partitions, gridMesh is ${gridMesh}`);
    }


    let initialConditionGrid: GridSet2D = nj
        .arange(
            spatialCondition.leftBound,
            spatialCondition.rightBound,
            grid.spatialStep
        )
        .tolist()
        .map(x => {
            return {
                x: x,
                y: temporalCondition.condition(x)
            }
        });


    let spatialSize = initialConditionGrid.length;
    let temporalSize = grid.temporalCounts;


    let heatmapsHistory: Array<GridSet2D> = [initialConditionGrid];


    for (let j = 0; j < temporalSize; j++) {

        let heatmap: GridSet2D = [];
        let lastHeatmap = heatmapsHistory[heatmapsHistory.length - 1];

        heatmap.push({
            x: spatialCondition.leftBound,
            y: spatialCondition.conditionLeft(spatialCondition.leftBound)
        });

        let truncatedMesh = nj
            .arange(
                spatialCondition.leftBound,
                spatialCondition.rightBound,
                grid.spatialStep
            )
            .tolist()

        truncatedMesh.shift()
        truncatedMesh.pop()

        let truncatedMeshNodes = truncatedMesh.map((x, i) => {
            return {
                x: x,
                y: gridMesh * lastHeatmap[i].y + (1 - 2 * gridMesh) * lastHeatmap[i + 1].y + gridMesh * lastHeatmap[i + 2].y
            }
        })

        heatmap.push(...truncatedMeshNodes)

        heatmap.push({
            x: spatialCondition.rightBound,
            y: spatialCondition.conditionRight(temporalCondition.startingMoment + (j) * grid.temporalStep)
        });
        heatmapsHistory.push(heatmap);

    }

    return heatmapsHistory;
}