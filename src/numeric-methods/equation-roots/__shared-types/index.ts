//@@@

import { Function1D, Precision } from "../../__shared-types";

export interface OneRootResult {
    root: number,
}

export interface ManyRootsResult {
    roots: Array<number>,
}

export interface IterativeMethodResult {
    iterations: number
}

export interface RecursiveMethodResult {
    maxRecursionDepth: number
}

export type BisectionIterativeMethod = (
    xLeftBound: number,
    xRightBound: number,
    function2D: Function1D,
    epsilon: Precision,
    iterationsLimit?: number
) => OneRootResult & IterativeMethodResult;

export type BisectionRecursiveMethod = (
    xLeftBound: number,
    xRightBound: number,
    function2D: Function1D,
    epsilon: Precision,
    depthLimit?: number
) => ManyRootsResult & RecursiveMethodResult;

export type SecantMethod = (
    xLeftBound: number,
    xRightBound: number,
    function2D: Function1D,
    epsilon: Precision
) => OneRootResult & IterativeMethodResult;
