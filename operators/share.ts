// This will share a source among many sinks, keeping track of how many sinks are subscribed.
// Once all sinks unsubscribe it unsubscribes from the source.

export const share = source => {
  let sinks = [];
  let originalTalkback;

  return (start, sink) => {
    if (start !== 0) return;
    sinks.push(sink);

    const talkback = (status, payload) => {
      if (status === 2) {
        const idx = sinks.indexOf(sink);
        if (idx >= 0) sinks.splice(idx, 1);
        if (sinks.length === 0) originalTalkback(status, payload);
      } else {
        originalTalkback(status, payload);
      }
    };

    if (sinks.length === 1) {
      source(0, (status, payload) => {
        if (status === 0) {
          originalTalkback = payload;
          sink(0, talkback);
        } else {
          sinks.slice(0).forEach(sink => sink(status, payload));
        }
        if (status === 2) sinks = [];
      });
      return;
    }

    sink(0, talkback);
  };
};
