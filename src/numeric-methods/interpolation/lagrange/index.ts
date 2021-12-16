import { InterpolationFunction } from '../__shared-types';


export const interpolateLagrange: InterpolationFunction = (x, interpolationNodes) => {

    let sum = 0.0;

    for (let k = 0; k < interpolationNodes.length; k++) {
        let product = 1.0;

        for (let j = 0; j < interpolationNodes.length; j++) {
            if (k === j) continue;
            product *= (x - interpolationNodes[j].x) / (interpolationNodes[k].x - interpolationNodes[j].x);
        }
        sum += product * interpolationNodes[k].y;
    }

    return sum;
}