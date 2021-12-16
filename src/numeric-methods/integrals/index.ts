import { Grid1D } from "../interpolation/__shared-types";
import { Function2D } from "../__shared-types";
import { useGrid1DSegmentsNum } from "../charting-tools";
import nj from "numjs";

export const integrateRectangleMethod = (function2D: Function2D, grid: Grid1D): number => {

    let sum: number = 0;
    let sectionLength: number = grid[1] - grid[0];

    for (let i = 0; i < grid.length - 1; i++) {
        sum += sectionLength * function2D((grid[i] + (sectionLength / 2)));
    }

    return sum;

}

export const integrateTrapezoidMethod = (function2D: Function2D, grid: Grid1D) => {

    let sum: number = 0;
    let sectionLength: number = grid[1] - grid[0];

    for (let i = 0; i < grid.length - 1; i++) {
        sum += sectionLength * (
            function2D(grid[i]) + function2D(grid[i + 1])
        ) / 2;
    }

    return sum;

}

export const integrateSimpsonMethod = (function2D: Function2D, grid: Grid1D) => {

    let sum: number = 0;

    for (let i = 0; i < grid.length - 1; i++) {
        sum += ((grid[i + 1] - grid[i]) / 6) * (function2D(grid[i]) + 4 * function2D((grid[i] + grid[i + 1]) / 2) + function2D(grid[i + 1]));
    }

    return sum;
}


export const getGrid1D = (xLeftBound: number, xRightBound: number, num: number) => {

    if (xRightBound <= xLeftBound) {
        throw new Error('Incorrect grid boundaries are specified');
    }

    let nodes = nj
        .arange(xLeftBound, xRightBound, (xRightBound - xLeftBound) / num)
        .tolist();

    return nodes;
}


export const withEpsilon = (
    function2D: Function2D,
    xLeftBound: number,
    xRightBound: number,
    num: number,
    integrationFunction: (function2D: Function2D, grid: Grid1D) => number,
    epsilon: number
) => {

    let precisionCoefficient = 2;

    let grid = getGrid1D(xLeftBound, xRightBound, num);
    let preciseGrid = getGrid1D(xLeftBound, xRightBound, precisionCoefficient * num);

    let result = integrationFunction(function2D, grid);
    let preciseResult = integrationFunction(function2D, preciseGrid);

    while (Math.abs(result - preciseResult) > epsilon) {

        precisionCoefficient *= 2;

        result = preciseResult;

        preciseGrid = getGrid1D(xLeftBound, xRightBound, precisionCoefficient * num);
        preciseResult = integrationFunction(function2D, preciseGrid);

    }

    return result;

}