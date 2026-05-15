import * as signalR from '@microsoft/signalr';

export type HubConnection = signalR.HubConnection;

export function buildConnection(hubUrl: string): HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build();
}

export async function startConnection(conn: HubConnection) {
  return conn.start();
}

export async function stopConnection(conn: HubConnection) {
  return conn.stop();
}

export function addReceiveConfirmationHandler(
  conn: HubConnection,
  handler: (routeId: string, status: string) => void,
) {
  conn.on('ReceiveConfirmation', handler);
}

export async function joinShipperGroup(conn: HubConnection, group: string) {
  return conn.invoke('JoinShipperGroup', group);
}

export function attachLifecycleHandlers(conn: HubConnection, tag = '') {
  conn.onreconnecting(err => {
    console.log(`[SignalR:${tag}] reconnecting`, err);
  });
  conn.onreconnected(connId => {
    console.log(`[SignalR:${tag}] reconnected, connectionId=`, connId);
  });
  conn.onclose(err => {
    console.log(`[SignalR:${tag}] connection closed`, err);
  });
}

export default {
  buildConnection,
  startConnection,
  stopConnection,
  addReceiveConfirmationHandler,
  joinShipperGroup,
  attachLifecycleHandlers,
};
