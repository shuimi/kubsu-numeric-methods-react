import * as math from "mathjs";

const parser = math.parser();

export type FunctionsParser = (func: string) => (x: number) => number;

export const parseFunction: FunctionsParser = (func) => {
    try {
        return parser.evaluate(func);
    }
    catch (error) {
        return (x: number) => x;
    }
}