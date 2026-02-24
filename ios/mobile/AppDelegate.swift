import UIKit
import Firebase
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications
import FirebaseMessaging

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  // MARK: - App Launch
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    FirebaseApp.configure()

    // 🔔 Notification Permission
    UNUserNotificationCenter.current().delegate = self

    UNUserNotificationCenter.current().requestAuthorization(
      options: [.alert, .badge, .sound]
    ) { granted, error in
        print("🔔 Permission granted:", granted)
    }

    application.registerForRemoteNotifications()

    // 🔥 Firebase Messaging Delegate
    Messaging.messaging().delegate = self

    // 🔥 DISABLE ZPNS SWIZZLING ON SIMULATOR
    #if targetEnvironment(simulator)
    UserDefaults.standard.set(true, forKey: "ZPNsDisableSwizzling")
    #endif

    // React Native setup
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "mobile",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // MARK: - APNs Token (Device Only)
  #if !targetEnvironment(simulator)

  @objc(application:didRegisterForRemoteNotificationsWithDeviceToken:)
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Messaging.messaging().apnsToken = deviceToken

    let tokenString = deviceToken.map { String(format: "%02x", $0) }.joined()
    print("📲 APNs token:", tokenString)
  }

  @objc(application:didFailToRegisterForRemoteNotificationsWithError:)
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("❌ Failed to register APNs:", error.localizedDescription)
  }

  @objc(application:didReceiveRemoteNotification:fetchCompletionHandler:)
  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    print("📩 Remote notification received (background):", userInfo)
    completionHandler(.newData)
  }

  #endif

  // MARK: - FCM Token
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    print("🔥 FCM TOKEN:", fcmToken ?? "nil")
  }

  // MARK: - Foreground Notification
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    print("📩 Notification received (foreground):",
          notification.request.content.userInfo)

    completionHandler([.banner, .sound, .badge])
  }
}

// MARK: - React Native Delegate
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings()
      .jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}