/*
Event-broker implementation based on the Callbags specs.

This will watch changes happening in the ./logs folder, logging the name of the first changed file
and also logging the first 5 change events. After all subscribers finish the watcher is closed.

To use this run:
$ yarn start

And change files inside the ./logs folder.

The expected output is something like:

Watcher started
foo just changed.
{ event: 'rename', filename: 'foo' }
{ event: 'change', filename: 'foo' }
{ event: 'rename', filename: 'bar' }
{ event: 'change', filename: 'bar' }
{ event: 'change', filename: 'bar' }
Watcher closed
*/

import { take, pipe, observe, share, map } from "./operators";
import { createFileWatchSource } from "./createFileWatchSource";

const logsChangesSource = createFileWatchSource("./logs");

// This will handle multiple subscribers to share the same source
const sharedSource = share(logsChangesSource);

// Create our observable logger sink
const observableLogger = observe(message => console.log(message));

// Let's log the first file change
pipe(
  sharedSource,
  take(1),
  map(event => `${event.filename} just changed.`),
  observableLogger
);

// And the first 5 file change events - after this the execution should finish
pipe(sharedSource, take(5), observableLogger);
