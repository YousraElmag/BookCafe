//logInfo
export const logInfo = (message) => {
  // eslint-disable-next-line no-console
  console.log(message);
};

//logError
export const logError = (errorMessage) => {
  if (errorMessage instanceof Error) {
    // You can pass an Error to this function and we will post the stack
    // eslint-disable-next-line no-console
    console.error(errorMessage.message, errorMessage.stack);
  } else {
    // eslint-disable-next-line no-console
    console.error("ERROR: ", errorMessage);
  }
};
