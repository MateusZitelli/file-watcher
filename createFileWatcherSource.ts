import * as fs from "fs";

// Creates a callbag source that delivers filesystem events of a given folder
export const createFileWatcherSource = path => (start, sink) => {
  if (start !== 0) return;

  let ended = false;
  let watcher: fs.FSWatcher;

  sink(0, status => {
    // Sink unsubscribed
    if (status === 2) {
      ended = true;
      if (watcher) {
        // Close watcher
        watcher.close();
        console.log("Watcher closed");
      }
    }
  });

  // Start watcher
  watcher = fs.watch(path, (event, filename) => {
    // Send event to the sink if it is subscribed
    if (filename && !ended) {
      sink(1, { event, filename });
    }
  });
  console.log("Watcher started");
};
