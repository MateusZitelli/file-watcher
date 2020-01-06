// Given operations f1, f2, ..., fn if returns fn(...(f2(f1)))
export const pipe = (...ops) => ops.reduce((res, op) => op(res));
