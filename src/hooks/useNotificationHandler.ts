import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { navigationRef } from '../navigation/navigationService';
import { getRankUpPayload, RankUpPayload } from '../utils/rankUtils';

export const useNotificationHandler = (
  onRankUp?: (payload: RankUpPayload) => void,
) => {
  useEffect(() => {
    // Foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification nhận được ở foreground:', remoteMessage);
      const { productId, type, routeId, oldRankName, newRankName, isRankUp } =
        remoteMessage.data || {};
      console.log(remoteMessage.data);
      if (
        type === 'CO2_SAVED' &&
        isRankUp === 'true' &&
        oldRankName &&
        newRankName
      ) {
        const rankUpPayload = getRankUpPayload({
          fromRank: oldRankName,
          toRank: newRankName,
        });
        if (rankUpPayload) {
          onRankUp?.(rankUpPayload);
        }
      }

      if (type === 'SHIPPER_ARRIVAL' && productId) {
        Toast.show({
          type: 'info',
          text1: remoteMessage.notification?.title || 'Thông báo',
          text2: remoteMessage.notification?.body || '',
          onPress: () => {
            if (productId && navigationRef.isReady()) {
              navigationRef.navigate('ProductDetails', { productId });
            }
          },
        });
      } else if (type === 'REPORT_ANSWERED') {
        Toast.show({
          type: 'info',
          text1: remoteMessage.notification?.title || 'Thông báo',
          text2: remoteMessage.notification?.body || '',
          onPress: () => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('ReportList');
            }
          },
        });
      } else if (type === 'COLLECTOR_CALL' && routeId) {
        return;
      } else {
        Toast.show({
          type: 'info',
          text1: remoteMessage.notification?.title || 'Thông báo',
          text2: remoteMessage.notification?.body || '',
        });
      }
    });

    // Background - khi user TAP vào notification
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('App opened from BACKGROUND notification:', remoteMessage);
        const { productId, type, routeId } = remoteMessage.data || {};
        if (type === 'CO2_SAVED') {
          const rankUpPayload = getRankUpPayload(remoteMessage.data);
          if (rankUpPayload) {
            onRankUp?.(rankUpPayload);
          }
        }

        if (productId && type === 'SHIPPER_ARRIVAL') {
          // Navigation đã sẵn sàng vì app đang chạy
          if (navigationRef.isReady()) {
            console.log('Navigate từ background');
            navigationRef.navigate('ProductDetails', { productId });
          }
        } else if (type === 'REPORT_ANSWERED') {
          // Navigation đã sẵn sàng vì app đang chạy
          if (navigationRef.isReady()) {
            console.log('Navigate từ background');
            navigationRef.navigate('ReportList');
          }
        } else if (type === 'COLLECTOR_CALL' && routeId) {
          return;
        }
      },
    );

    // Quit state - khi app KILLED và mở từ notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('getInitialNotification:', remoteMessage);
        if (remoteMessage) {
          const { productId, type, routeId } = remoteMessage.data || {};
          console.log('ProductId from killed state:', productId);
          if (type === 'CO2_SAVED') {
            const rankUpPayload = getRankUpPayload(remoteMessage.data);
            if (rankUpPayload) {
              onRankUp?.(rankUpPayload);
            }
          }

          if (productId && type === 'SHIPPER_ARRIVAL') {
            // Cần đợi navigation ready
            const checkNavReady = setInterval(() => {
              if (navigationRef.isReady()) {
                console.log('Navigation ready! Navigate now');
                clearInterval(checkNavReady);
                navigationRef.navigate('ProductDetails', { productId });
              } else {
                console.log('Navigation not ready yet...');
              }
            }, 100);

            // Timeout sau 5s để tránh loop vô hạn
            setTimeout(() => clearInterval(checkNavReady), 5000);
          } else if (type === 'REPORT_ANSWERED') {
            // Cần đợi navigation ready
            const checkNavReady = setInterval(() => {
              if (navigationRef.isReady()) {
                console.log('Navigation ready! Navigate now');
                clearInterval(checkNavReady);
                navigationRef.navigate('ReportList');
              } else {
                console.log('Navigation not ready yet...');
              }
            }, 100);

            // Timeout sau 5s để tránh loop vô hạn
            setTimeout(() => clearInterval(checkNavReady), 5000);
          } else if (type === 'COLLECTOR_CALL' && routeId) {
            return;
          }
        }
      });

    return () => {
      unsubscribe();
      unsubscribeOpenedApp();
    };
  }, [onRankUp]);
};
