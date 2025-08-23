export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || "");
  }

  static error(message: string, error?: any): void {
    console.error(
      `[ERROR] ${new Date().toISOString()}: ${message}`,
      error || ""
    );
  }

  static debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.log(
        `[DEBUG] ${new Date().toISOString()}: ${message}`,
        data || ""
      );
    }
  }

  static step(step: string): void {
    console.log(`[STEP] ${step}`);
  }

  static attachFile(name: string, content: string, contentType: string): void {
    console.log(`[ATTACHMENT] ${name} (${contentType}):`, content);
  }
}
