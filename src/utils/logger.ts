import logger from "pino";

const log = logger({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:mm-dd-yyyy hh:mm:ss TT",
    },
  },
  base: { pid: true },
});

export default log;
