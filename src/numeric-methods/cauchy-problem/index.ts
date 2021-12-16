import { Function3D, Grid2D, Node2D } from "../__shared-types";

/**
 * Runge-Kutta 4th order method.
 * For Cauchy problems like y'=f(x,y).
 *
 * dy/dx = f(x,y)
 *
 * y_{i+1} = y_i + (h/6) * (k_0 + 2k_1 + 2k_2 + k_3)
 * x_{i+1} = x_i + step
 *
 * k_0 = f(x_i, y_i)
 * k_1 = f(x_i + h / 2, y_i + (h * k_0) / 2)
 * k_2 = f(x_i + h / 2, y_i + (h * k_1) / 2)
 * k_3 = f(x_i + h, y_i + h * k_2)
 *
 * @param {Function3D} function3D - math function ((x, y) => number)
 * @param {Node2D} startingPoint - the initial condition (starting point)
 * @param {number} step - method's calculation step
 * @param {number} iterationsLimit - iterations limit
 * @returns {number}
 */
export const methodRungeKutta = (function3D: Function3D, startingPoint: Node2D, step: number, iterationsLimit: number): Grid2D => {

    let resultFunctionData: Grid2D = [];

    let x = startingPoint.x;
    let y = startingPoint.y;

    for (let i = 0; i < iterationsLimit; i++){

        let k0 = function3D(x, y);
        let k1 = function3D(x + 0.5 * step, y + 0.5 * step * k0);
        let k2 = function3D(x + 0.5 * step, y + 0.5 * step * k1);
        let k3 = function3D(x + step, y + step * k2);

        x = x + step;
        y = y + (step / 6) * (k0 + 2 * k1 + 2 * k2 + k3);

        resultFunctionData.push({
            x: x,
            y: y
        });

    }

    return resultFunctionData;

}