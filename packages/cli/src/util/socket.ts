import chalk from "chalk";
import { prefix } from "./prefix.js";
import { WebSocket, WebSocketServer } from "ws";

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocketServer | null = null;

  private constructor() {
    this.ws = new WebSocketServer({ port: 3613 });

    this.ws.on("connection", (ws) => {
      console.log(prefix, chalk.greenBright("connected to extension"));
      ws.on("error", console.error);
      ws.on("message", (m) => {
        if (m.toString() === "disconnecting")
          console.log(prefix, chalk.redBright("extension disconnected"));
        if (m.toString() === "received")
          console.log(prefix, chalk.greenBright.dim("presence updated in extension"));
      });
    });
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public send(message: string): void {
    this.ws?.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export default WebSocketManager.getInstance();
