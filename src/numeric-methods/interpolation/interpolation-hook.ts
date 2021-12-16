import { Interpolation } from "../__shared-types";

export const useInterpolation: Interpolation = (
    estimationGrid,
    interpolationNodes,
    interpolator,
) => {

    const interpolatedData = estimationGrid.map(x => {
        return {
            x: x,
            y: interpolator(x, interpolationNodes)
        };
    });

    return interpolatedData;

}