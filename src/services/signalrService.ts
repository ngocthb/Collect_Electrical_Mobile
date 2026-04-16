import * as signalR from '@microsoft/signalr';
import Config from '../config/env';

let connection: signalR.HubConnection | null = null;
let callConnection: signalR.HubConnection | null = null;

export async function connectShippingHub(
  handlers?: Record<string, (...args: any[]) => void>,
) {
  try {
    console.log('[signalrService] connectShippingHub - starting connection');
    console.log('[signalrService] SIGNAL URL:', Config.SIGNAL);

    if (!connection) {
      console.log('[signalrService] Creating new shipping hub connection');
      connection = new signalR.HubConnectionBuilder()
        .withUrl(Config.SIGNAL)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
      console.log('[signalrService] Shipping hub connection created');
    } else {
      console.log('[signalrService] Reusing existing shipping hub connection');
    }

    // register handlers
    if (handlers && connection) {
      const handlerKeys = Object.keys(handlers);
      console.log(
        '[signalrService] Registering handlers for shipping hub:',
        handlerKeys,
      );
      handlerKeys.forEach(key => {
        console.log(`[signalrService] Registering handler: ${key}`);
        connection!.on(key, handlers[key]);
      });
      console.log('[signalrService] All handlers registered for shipping hub');
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.log(
        '[signalrService] Shipping connection state:',
        connection.state,
      );
      console.log('[signalrService] Starting shipping hub connection...');
      await connection.start();
      console.log('[signalrService] ✅ Shipping hub connected successfully');
    } else {
      console.log('[signalrService] Shipping hub already connected');
    }

    return connection;
  } catch (err) {
    console.error('[signalrService] ❌ connectShippingHub error:', err);
    throw err;
  }
}

export async function joinRouteGroup(routeId: string) {
  console.log('[signalrService] joinRouteGroup - routeId:', routeId);
  if (!connection) {
    console.log('[signalrService] No shipping connection, connecting first...');
    await connectShippingHub();
  }
  try {
    console.log(
      '[signalrService] Invoking JoinRouteGroup for routeId:',
      routeId,
    );
    await connection!.invoke('JoinRouteGroup', routeId);
    console.log(
      '[signalrService] ✅ Successfully joined route group:',
      routeId,
    );
  } catch (err) {
    console.error(
      '[signalrService] ❌ joinRouteGroup error for routeId:',
      routeId,
      err,
    );
    throw err;
  }
}

export function on(eventName: string, handler: (...args: any[]) => void) {
  console.log(
    '[signalrService] Registering shipping event listener:',
    eventName,
  );
  connection?.on(eventName, handler);
}

export function off(eventName: string, handler?: (...args: any[]) => void) {
  console.log(
    '[signalrService] Removing shipping event listener:',
    eventName,
    handler ? '(specific handler)' : '(all handlers)',
  );
  if (handler) connection?.off(eventName, handler);
  else connection?.off(eventName);
}

export async function connectCallHub(
  userId: string,
  handlers?: Record<string, (...args: any[]) => void>,
) {
  try {
    console.log('[signalrService] connectCallHub - starting connection');
    console.log('[signalrService] ONLINE URL:', Config.ONLINE);
    console.log('[signalrService] userId:', userId);

    if (!callConnection) {
      console.log('[signalrService] Creating new call hub connection');
      callConnection = new signalR.HubConnectionBuilder()
        .withUrl(Config.ONLINE)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
      console.log('[signalrService] Call hub connection created');

      // Listen for Registered response from server
      callConnection.on('Registered', (msg: any) => {
        console.log(
          '[signalrService] 📨 Registered response from server:',
          msg,
        );
      });
    } else {
      console.log('[signalrService] Reusing existing call hub connection');
    }

    // register custom handlers
    if (handlers && callConnection) {
      const handlerKeys = Object.keys(handlers);
      console.log(
        '[signalrService] Registering handlers for call hub:',
        handlerKeys,
      );
      handlerKeys.forEach(key => {
        console.log(`[signalrService] Registering call handler: ${key}`);
        callConnection!.on(key, handlers[key]);
      });
      console.log('[signalrService] All handlers registered for call hub');
    }

    if (callConnection.state !== signalR.HubConnectionState.Connected) {
      console.log(
        '[signalrService] Call connection state:',
        callConnection.state,
      );
      console.log('[signalrService] Starting call hub connection...');
      await callConnection.start();
      console.log('[signalrService] ✅ Call hub connected successfully');

      // Register user with server after connection
      console.log('[signalrService] Registering user:', userId);
      await callConnection.invoke('RegisterUser', userId);
      console.log('[signalrService] ✅ User registered:', userId);
    } else {
      console.log('[signalrService] Call hub already connected');
    }

    return callConnection;
  } catch (err) {
    console.error('[signalrService] ❌ connectCallHub error:', err);
    throw err;
  }
}

export async function registerUser(userId: string) {
  try {
    if (!callConnection) {
      console.error(
        '[signalrService] Call connection not established. Connect first.',
      );
      return;
    }
    console.log('[signalrService] Registering user:', userId);
    await callConnection.invoke('RegisterUser', userId);
    console.log('[signalrService] ✅ User registered:', userId);
  } catch (err) {
    console.error('[signalrService] ❌ registerUser error:', err);
    throw err;
  }
}

export function onCall(eventName: string, handler: (...args: any[]) => void) {
  console.log('[signalrService] Registering call event listener:', eventName);
  callConnection?.on(eventName, handler);
}

export function offCall(eventName: string, handler?: (...args: any[]) => void) {
  console.log(
    '[signalrService] Removing call event listener:',
    eventName,
    handler ? '(specific handler)' : '(all handlers)',
  );
  if (handler) callConnection?.off(eventName, handler);
  else callConnection?.off(eventName);
}

export async function disconnect() {
  console.log('[signalrService] Disconnecting all hubs...');
  try {
    if (connection) {
      console.log('[signalrService] Stopping shipping hub connection...');
      await connection.stop();
      connection = null;
      console.log('[signalrService] ✅ Shipping hub disconnected');
    } else {
      console.log('[signalrService] No shipping connection to disconnect');
    }

    if (callConnection) {
      console.log('[signalrService] Stopping call hub connection...');
      await callConnection.stop();
      callConnection = null;
      console.log('[signalrService] ✅ Call hub disconnected');
    } else {
      console.log('[signalrService] No call connection to disconnect');
    }

    console.log('[signalrService] ✅ All hubs disconnected');
  } catch (err) {
    console.error('[signalrService] ❌ disconnect error:', err);
  }
}
