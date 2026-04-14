import UIKit
import Firebase
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications
import FirebaseMessaging
import PushKit

@main
@objc(AppDelegate)
class AppDelegate: UIResponder,
  UIApplicationDelegate,
  UNUserNotificationCenterDelegate,
  MessagingDelegate,
  PKPushRegistryDelegate {

  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  var voipRegistry: PKPushRegistry?

  // MARK: - App Launch
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    FirebaseApp.configure()

    // 🔔 Notification permission
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(
      options: [.alert, .badge, .sound]
    ) { granted, error in
      print("🔔 Permission granted:", granted)
    }

    application.registerForRemoteNotifications()

    // 🔥 Firebase Messaging
    Messaging.messaging().delegate = self

    // =================================================
    // 🚀 PUSHKIT (VOIP) - CHỈ LẤY TOKEN, KHÔNG HANDLE CALL
    // =================================================
    voipRegistry = PKPushRegistry(queue: DispatchQueue.main)
    voipRegistry?.delegate = self
    voipRegistry?.desiredPushTypes = [.voIP]

    // =================================================
    // ⚛️ React Native setup
    // =================================================
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

  // MARK: - APNs Token (FCM)
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Messaging.messaging().apnsToken = deviceToken

    let tokenString = deviceToken.map { String(format: "%02x", $0) }.joined()
    print("📲 APNs token:", tokenString)
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("❌ Failed to register APNs:", error.localizedDescription)
  }

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
    print("📩 Foreground notification:", notification.request.content.userInfo)
    completionHandler([.banner, .sound, .badge])
  }

  // =================================================
  // 📞 PUSHKIT - NHẬN VOIP TOKEN
  // =================================================
  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    let token = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    print("📞 VoIP Token:", token)

    // ❗ KHÔNG cần set token cho Zego
    // ZPNs sẽ tự handle bên RN
  }

  // =================================================
  // 📞 NHẬN PUSH (Zego sẽ tự handle CallKit)
  // =================================================
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {
    print("📞 VoIP push received:", payload.dictionaryPayload)

    // ❗ QUAN TRỌNG:
    // KHÔNG tự show CallKit ở đây
    // Để Zego handle

    completion()
  }

  // iOS < 13 (optional)
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType
  ) {
    print("📞 VoIP push (old):", payload.dictionaryPayload)
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