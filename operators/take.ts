// This will take the first N events and unsubscribe after
export const take = total => source => (start, sink) => {
  if (start !== 0) return;
  let taken = 0;
  let originalTalkback;
  let end;

  function talkback(t, d) {
    if (t === 2) {
      end = true;
      originalTalkback(t, d);
    } else if (taken < total) originalTalkback(t, d);
  }

  source(0, (t, d) => {
    if (t === 0) {
      originalTalkback = d;
      sink(0, talkback);
    } else if (t === 1) {
      if (taken < total) {
        taken++;
        sink(t, d);
        if (taken === total && !end) {
          end = true;
          sink(2);
          originalTalkback(2);
        }
      }
    } else {
      sink(t, d);
    }
  });
};
