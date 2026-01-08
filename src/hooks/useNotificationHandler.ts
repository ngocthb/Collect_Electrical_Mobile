import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { navigationRef } from '../navigation/navigationService';

export const useNotificationHandler = () => {
  useEffect(() => {
    // Foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification nhận được ở foreground:', remoteMessage);
      const productId = remoteMessage.data?.productId;

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
    });

    // Background - khi user TAP vào notification
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('App opened from BACKGROUND notification:', remoteMessage);
        const productId = remoteMessage.data?.productId;
        if (productId) {
          // Navigation đã sẵn sàng vì app đang chạy
          if (navigationRef.isReady()) {
            console.log('Navigate từ background');
            navigationRef.navigate('ProductDetails', { productId });
          }
        }
      },
    );

    // Quit state - khi app KILLED và mở từ notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        console.log('getInitialNotification:', remoteMessage);
        if (remoteMessage) {
          const productId = remoteMessage.data?.productId;
          console.log('ProductId from killed state:', productId);
          if (productId) {
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
          }
        }
      });

    return () => {
      unsubscribe();
      unsubscribeOpenedApp();
    };
  }, []);
};
