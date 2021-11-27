export type Node2D = { x: number, y: number };
export type InterpolationNodes = Array<Node2D>;

export type InterpolationFunction = (x: number, interpolationNodes:InterpolationNodes) => number;