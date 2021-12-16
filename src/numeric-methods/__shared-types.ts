import { Grid1D, Grid2D, InterpolationFunction, Node2D } from "./interpolation/__shared-types";

export type Function2D = (x: number) => number;
export type Function3D = (x: number, y: number) => number;

export type Precision = number;

export type Accessor = (node: Node2D) => number;

export type Interpolation = (
    estimationGrid: Grid1D,
    interpolationNodes: Grid2D,
    interpolator: InterpolationFunction,
) => Grid2D;

export * from './interpolation/__shared-types';
export * from './equation-roots/__shared-types';