import * as signalR from '@microsoft/signalr';
import Config from '../config/env';

let connection: signalR.HubConnection | null = null;

export async function connectShippingHub(
  handlers?: Record<string, (...args: any[]) => void>,
) {
  try {
    if (!connection) {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(Config.SIGNAL)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
    }

    // register handlers
    if (handlers && connection) {
      Object.keys(handlers).forEach(key => {
        connection!.on(key, handlers[key]);
      });
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      await connection.start();
    }

    return connection;
  } catch (err) {
    console.error('[signalrService] connectShippingHub error', err);
    throw err;
  }
}

export async function joinRouteGroup(routeId: string) {
  if (!connection) {
    await connectShippingHub();
  }
  try {
    await connection!.invoke('JoinRouteGroup', routeId);
  } catch (err) {
    console.error('[signalrService] joinRouteGroup error', err);
    throw err;
  }
}

export function on(eventName: string, handler: (...args: any[]) => void) {
  connection?.on(eventName, handler);
}

export function off(eventName: string, handler?: (...args: any[]) => void) {
  if (handler) connection?.off(eventName, handler);
  else connection?.off(eventName);
}

export async function disconnect() {
  if (!connection) return;
  try {
    await connection.stop();
  } catch (err) {
    console.error('[signalrService] disconnect error', err);
  } finally {
    connection = null;
  }
}
