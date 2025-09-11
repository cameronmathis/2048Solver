import * as fs from "fs";
import * as path from "path";

export class Logger {
  private static instance: Logger;
  private logFile: string;
  private logStream: fs.WriteStream;

  private constructor() {
    const logsDir: string = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    const timestamp: string = new Date().toISOString().replace(/[:.]/g, "-");
    this.logFile = path.join(logsDir, `${timestamp}.log`);
    this.logStream = fs.createWriteStream(this.logFile, { flags: "a" });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  log(message: string, ...optionalParams: any[]) {
    const timestamp: string = new Date().toISOString();
    const logMessage: string = `[${timestamp}] ${message}`;

    console.log(logMessage, ...optionalParams);
    const formattedParams: string[] = optionalParams.map((param) =>
      typeof param === "object" ? JSON.stringify(param, null, 2) : param
    );
    this.logStream.write(`${logMessage} ${formattedParams.join(" ")}\n`);
  }

  close() {
    this.logStream.end();
  }
}
