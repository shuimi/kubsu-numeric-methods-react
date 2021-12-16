export type Node2D = { x: number, y: number };

export type GridDescriptor = {
    leftBound: number,
    rightBound: number,
    num: number,
};

export type Grid1D = Array<number>;
export type Grid2D = Array<Node2D>;

export type InterpolationFunction = (x: number, interpolationNodes: Grid2D) => number;