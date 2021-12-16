import nj from "numjs";

import { Grid1D, Grid2D, Node2D } from "../interpolation/__shared-types";
import { Accessor, Function2D } from "../__shared-types";


export const useEuclideanDistance = (one: Grid2D, another: Grid2D): number => {
    let sum = 0;
    one.forEach((point, index) => {
        sum += (point.y - another[index].y) ** 2;
    })
    return Math.sqrt(sum);
}

export const useGrid1DSegmentsNum = (xLeftBound: number, xRightBound: number, num: number) => {

    if (xRightBound <= xLeftBound) {
        throw new Error('Incorrect grid boundaries are specified');
    }

    let nodes = nj
        .arange(xLeftBound, xRightBound, (xRightBound - xLeftBound) / num)
        .tolist();

    return nodes;
}

export const useGrid1D = (xLeftBound: number, xRightBound: number, step: number) => {

    if (xRightBound <= xLeftBound) {
        throw new Error('Incorrect grid boundaries are specified');
    }

    let nodes = nj
        .arange(xLeftBound, xRightBound, step)
        .tolist();
    nodes
        .push(xRightBound);

    return nodes;
}

export const useFunctionData2D = (grid: Grid1D, function2D: Function2D): Grid2D => {
    return grid.map(x => {
        return {
            x: x,
            y: function2D(x)
        };
    });
}

export const accessors: { xAccessor: Accessor, yAccessor: Accessor } = {
    xAccessor: (d: Node2D): number => d.x,
    yAccessor: (d: Node2D): number => d.y,
};