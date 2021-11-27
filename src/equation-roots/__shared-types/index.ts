//@@@

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

export type Function2D = (x: number) => number;

export type Precision = number;

export type BisectionIterativeMethod = (
    xLeftBound: number,
    xRightBound: number,
    function2D: Function2D,
    epsilon: Precision,
    iterationsLimit?: number
) => OneRootResult & IterativeMethodResult;

export type BisectionRecursiveMethod = (
    xLeftBound: number,
    xRightBound: number,
    function2D: Function2D,
    epsilon: Precision,
    depthLimit?: number
) => ManyRootsResult & RecursiveMethodResult;

export type SecantMethod = (
    xLeftBound: number,
    xRightBound: number,
    function2D: Function2D,
    epsilon: Precision
) => OneRootResult & IterativeMethodResult;
