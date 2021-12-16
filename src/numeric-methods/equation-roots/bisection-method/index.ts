import { BisectionIterativeMethod, BisectionRecursiveMethod } from '../__shared-types';


//@@@


export const bisectionIterativeMethod: BisectionIterativeMethod = (
    xLeftBound,
    xRightBound,
    function2D,
    epsilon,
    iterationsLimit
) => {

    if (xLeftBound > xRightBound) {
        throw new Error('Segment boundaries are set incorrectly');
    }
    if (epsilon >= 1) {
        throw new Error(`Expected epsilon to be smaller than 1, but got ${epsilon}`);
    }
    if (iterationsLimit !== undefined) {
        if (Number.isInteger(iterationsLimit)) {
            if (iterationsLimit <= 0) {
                throw new Error(`Expected iterations limit to be larger than 0, but got ${iterationsLimit}`);
            }
        } else {
            throw new Error('Iterations limit expected to be integer value');
        }
    }


    const isSameDigit = (x: number, y: number): boolean | undefined => {
        return x === 0 || y === 0
            ? undefined
            : x * y > 0;
    }

    let xLeft = xLeftBound;
    let xRight = xRightBound;
    let xCenter = (xLeftBound + xRightBound) / 2;

    if (Math.abs(function2D(xLeft)) < epsilon) {
        return {
            root: xLeft,
            iterations: 0
        }
    }
    if (Math.abs(function2D(xCenter)) < epsilon) {
        return {
            root: xCenter,
            iterations: 0
        }
    }
    if (Math.abs(function2D(xRight)) < epsilon) {
        return {
            root: xRight,
            iterations: 0
        }
    }

    let iterationsNumber = 0;

    while (Math.abs(function2D(xCenter)) >= epsilon) {

        if (!isSameDigit(function2D(xLeft), function2D(xCenter))) {
            xRight = xCenter;
            xCenter = (xLeft + xCenter) / 2;
        } else if (!isSameDigit(function2D(xCenter), function2D(xRight))) {
            xLeft = xCenter;
            xCenter = (xCenter + xRight) / 2;
        }

        iterationsNumber++;

        if (iterationsNumber > (iterationsLimit ?? 10000)) break;
    }

    return {
        root: xCenter,
        iterations: iterationsNumber
    }

}


//@@@


export const bisectionRecursiveMethod: BisectionRecursiveMethod = (
    xLeftBound,
    xRightBound,
    function2D,
    epsilon,
    depthLimit?
) => {

    if (xLeftBound > xRightBound) {
        throw new Error('Segment boundaries are set incorrectly');
    }
    if (epsilon >= 1) {
        throw new Error(`Expected epsilon to be smaller than 1, but got ${epsilon}`);
    }
    if (depthLimit !== undefined) {
        if (Number.isInteger(depthLimit)) {
            if (depthLimit <= 0) {
                throw new Error(`Expected depth limit to be larger than 0, but got ${depthLimit}`);
            }
        } else {
            throw new Error('Depth limit expected to be integer value');
        }
    }


    let roots: Array<number> = [];
    let maxRecursionDepth = 0;

    const checkSubInterval = (xLeft: number, xRight: number, depth: number) => {

        if (depth >= (depthLimit || 16)) return;

        let xCenter = (xLeft + xRight) / 2;

        if (Math.abs(function2D(xCenter)) < epsilon) {
            roots.push(xCenter);
        }

        checkSubInterval(xLeft, xCenter, depth + 1);
        checkSubInterval(xCenter, xRight, depth + 1);

        maxRecursionDepth = Math.max(maxRecursionDepth, depth);
    }

    checkSubInterval(xLeftBound, xRightBound, 0);

    return {
        roots: roots,
        maxRecursionDepth: maxRecursionDepth
    }

}