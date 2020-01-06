/*
Event-broker implementation based on the Callbags specs.

This will watch changes happening in the ./logs folder, It will log the first 10 change in files inside the folder.
Then it will clear tmp data and stop the watcher.

To use this run:
$ yarn start

And change files inside the ./logs folder.

The expected output is something like:

Watcher started
filename: foo
event: rename
timestamp: 2020-01-06T16:55:13.446Z
########
filename: foo
event: change
timestamp: 2020-01-06T16:55:13.457Z
########
filename: bar
event: rename
timestamp: 2020-01-06T16:55:15.754Z
########
filename: bar
event: change
timestamp: 2020-01-06T16:55:15.762Z
########
filename: foo
event: change
timestamp: 2020-01-06T16:55:26.590Z
diff:
1d0
< hey there

########
filename: foo
event: change
timestamp: 2020-01-06T16:55:26.592Z
diff:
1d0
< hey there

########
filename: bar
event: change
timestamp: 2020-01-06T16:55:39.791Z
diff:
1d0
< hello

########
filename: bar
event: change
timestamp: 2020-01-06T16:55:39.793Z
diff:
1d0
< hello

########
filename: bar
event: change
timestamp: 2020-01-06T16:55:49.314Z
diff:
1d0
< hello

########
filename: foo
event: change
timestamp: 2020-01-06T16:55:52.335Z
diff:
1d0
< hey there

########
Watcher closed
*/

import {
  pipe,
  observe,
  map,
  take
} from "./operators";
import { createFileWatcherSource } from "./createFileWatcherSource";

const path = "./logs";

const folderChangesSource = createFileWatcherSource(path);

pipe(
  folderChangesSource,
  // Add timestamp
  map(event => ({ 
    timestamp: new Date().toISOString(), 
    ...event 
  })),
  // Take the first 10 events
  take(10),
  // Log
  observe(({event, filename, timestamp, diff}) => {
    console.log(`filename: ${filename}`)
    console.log(`event: ${event}`)
    console.log(`timestamp: ${timestamp}`)
    if (diff) {
      console.log(`diff:`);
      console.log(`${diff}`);
    }
    console.log("########")
  }),
);