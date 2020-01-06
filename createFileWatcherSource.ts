import * as fs from "fs";
import { TMP_FOLDER } from "./consts";
import { exec } from "child_process";

// This is our events source, it will keep track of
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

      // Remove tmp dir
      if (fs.existsSync(TMP_FOLDER)) {
        fs.readdir(TMP_FOLDER, (err, files) => {
          files.forEach(file => fs.unlinkSync(`${TMP_FOLDER}/${file}`))
          fs.rmdirSync(TMP_FOLDER);
        })
      }
    }
  });

  // Keep a copy of the original files
  fs.readdir(path, (err, files) => {
    if (err) {
      sink(2, err);
    } else {
      if (!fs.existsSync(TMP_FOLDER)) {
        fs.mkdirSync(TMP_FOLDER);
      }

      files.forEach(filename => {
        fs.copyFileSync(`${path}/${filename}`, `${TMP_FOLDER}/${filename}`);
        sink(1, { event: "found", filename });
      });
    }
  });

  // Start watcher
  watcher = fs.watch(path, (event, filename) => {
    // Continue if filename is available and sink is subscribed
    if (filename && !ended) {
      // Keep a copy of new files
      if (event === "rename") {
        try {
          // If the file exists the file was renamed
          if (fs.existsSync(`${path}/${filename}`)) {
            fs.copyFileSync(`${path}/${filename}`, `${TMP_FOLDER}/${filename}`);
            sink(1, { event: "rename", filename });
            // If the file does not exist it was removed
          } else {
            sink(1, { event: "delete", filename });
          }
        } catch (e) {
          console.error(`Fail to create ${TMP_FOLDER}/${filename}`);
        }
      } else if (event === "change") {
        exec(
          `diff ${path}/${filename} ${TMP_FOLDER}/${filename}`,
          (err, stdout, stderr) => {
            sink(1, { event: "change", filename, diff: stdout });
          }
        );
      } else {
        sink(1, { event, filename });
      }
    }
  });

  console.log("Watcher started");
};
