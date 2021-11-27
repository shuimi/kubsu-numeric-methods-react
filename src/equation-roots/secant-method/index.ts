import { SecantMethod } from "../__shared-types";


//@@@


export const secantMethod: SecantMethod = (
    xLeftBound,
    xRightBound,
    function2D,
    epsilon
) => {

    if (xLeftBound > xRightBound) {
        throw new Error('Segment boundaries are set incorrectly');
    }
    if (epsilon >= 1) {
        throw new Error(`Expected epsilon to be smaller than 1, but got ${epsilon}`);
    }

    let a = xLeftBound;
    let b = xRightBound;
    let iterations = 0;

    while(Math.abs(b - a) > epsilon) {
        a = b - (b - a) * function2D(b) / (function2D(b) - function2D(a));
        b = a - (a - b) * function2D(a) / (function2D(a) - function2D(b));
        iterations++;
    }

    return {
        root: b,
        iterations: iterations
    };

}