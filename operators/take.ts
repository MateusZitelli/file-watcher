// This will take the first N events and unsubscribe after
export const take = total => source => (start, sink) => {
  if (start !== 0) return;
  let taken = 0;
  let originalTalkback;
  let end;

  function talkback(status, payload) {
    if (status === 2) {
      end = true;
      originalTalkback(status, payload);
    } else if (taken < total) originalTalkback(status, payload);
  }

  source(0, (status, payload) => {
    if (status === 0) {
      originalTalkback = payload;
      sink(0, talkback);
    } else if (status === 1) {
      if (taken < total) {
        taken++;
        sink(status, payload);
        if (taken === total && !end) {
          end = true;
          sink(2);
          originalTalkback(2);
        }
      }
    } else {
      sink(status, payload);
    }
  });
};
