// This applies op to all data events
export const map = op => source => (start, sink) => {
  if (start !== 0) return;

  source(0, (status, payload) => {
    if (status === 1) {
      sink(1, op(payload));
    } else {
      sink(status, payload);
    }
  });
};
