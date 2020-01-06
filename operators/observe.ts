// Call the subscriber on every data event
export const observe = subscriber => source => {
  source(0, (status, data) => {
    if (status === 1) subscriber(data);
  });
};
