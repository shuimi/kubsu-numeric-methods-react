import nj from 'numjs';
import { InterpolationFunction } from '../__shared-types';

const linear = require('linear-solve');


export const interpolateSpline: InterpolationFunction = (x, interpolationNodes) => {

    let size = interpolationNodes.length;


    let vectorH = nj.zeros(size);

    for (let i = 1; i < size; i++) {
        vectorH.set(i, interpolationNodes[i].x - interpolationNodes[i - 1].x);
    }


    const vectorA = nj.zeros(size);

    for (let i = 0; i < size; i++) {
        vectorA.set(i, interpolationNodes[i].y);
    }

    // @three-diagonal matrix

    const matrixT = nj.zeros([ size, size ]);

    matrixT.set(0, 0, 1.0);
    matrixT.set(size - 1, size - 1, 1.0);

    for (let i = 1; i < size - 1; i++) {

        matrixT.set(i, i - 1,
            vectorH.get(i)
        );

        matrixT.set(i, i,
            2 * (vectorH.get(i) + vectorH.get(i + 1))
        );

        matrixT.set(i, i + 1,
            vectorH.get(i + 1)
        );
    }


    const vectorF = nj.zeros(size);

    for (let i = 1; i < size - 1; i++) {
        vectorF.set(i,
            6 * ((vectorA.get(i + 1) - vectorA.get(i)) / vectorH.get(i + 1) - (vectorA.get(i) - vectorA.get(i - 1)) / vectorH.get(i))
        )
    }

    // @sle solution

    const vectorC = nj.array(linear.solve(matrixT.tolist(), vectorF.tolist()));

    const vectorD = nj.zeros(size);
    for (let i = 1; i < size; i++) {
        vectorD.set(i,
            (vectorC.get(i) - vectorC.get(i - 1)) / vectorH.get(i)
        )
    }


    const vectorB = nj.zeros(size);

    for (let i = 1; i < size; i++) {
        vectorB.set(i,
            vectorH.get(i) * vectorC.get(i) / 2 - vectorD.get(i) * (vectorH.get(i) ** 2) / 6 + (vectorA.get(i) - vectorA.get(i - 1)) / vectorH.get(i)
        )
    }

    const index = interpolationNodes.findIndex(node => x <= node.x);
    const offsetX = x - interpolationNodes[index].x;

    let result = vectorA.get(index);

    result += offsetX * vectorB.get(index);
    result += offsetX ** 2 * vectorC.get(index) / 2;
    result += offsetX ** 3 * vectorD.get(index) / 6;

    return result;
}