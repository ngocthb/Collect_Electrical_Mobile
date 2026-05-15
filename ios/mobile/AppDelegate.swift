import UIKit
import Firebase
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications
import FirebaseMessaging
import PushKit
import CallKit

@main
@objc(AppDelegate)
class AppDelegate: UIResponder,
  UIApplicationDelegate,
  UNUserNotificationCenterDelegate,
  MessagingDelegate,
  PKPushRegistryDelegate,
  CXProviderDelegate {

  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  var voipRegistry: PKPushRegistry?

  // MARK: - CallKit
  var provider: CXProvider!
  var currentUUID: UUID?   // 🔥 QUAN TRỌNG

  // =================================================
  // 🚀 APP START
  // =================================================
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    FirebaseApp.configure()

    // Notification
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(
      options: [.alert, .badge, .sound]
    ) { granted, _ in
      print("🔔 Permission:", granted)
    }

    application.registerForRemoteNotifications()
    Messaging.messaging().delegate = self

    // PushKit
    voipRegistry = PKPushRegistry(queue: DispatchQueue.main)
    voipRegistry?.delegate = self
    voipRegistry?.desiredPushTypes = [.voIP]

    // CallKit
    let config = CXProviderConfiguration(localizedName: "Ewise")
    config.supportsVideo = false
    config.maximumCallsPerCallGroup = 1
    config.maximumCallGroups = 1

    provider = CXProvider(configuration: config)
    provider.setDelegate(self, queue: DispatchQueue.main)

    // React Native
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

  // =================================================
  // 📲 APNs
  // =================================================
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    Messaging.messaging().apnsToken = deviceToken
  }

  // =================================================
  // 📞 PUSHKIT TOKEN
  // =================================================
  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    let token = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    print("📞 VoIP Token:", token)
     UserDefaults.standard.set(token, forKey: "VOIP_TOKEN")
  }

  // =================================================
  // 📞 RECEIVE PUSH
  // =================================================
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType,
    completion: @escaping () -> Void
  ) {

    let data = payload.dictionaryPayload
    print("🔥 PUSH RAW:", data)

    let callID = data["call_id"] as? String ?? UUID().uuidString
    let callerName = data["caller_name"] as? String ?? "Unknown"
    var roomID = data["room_id"] as? String ?? ""
    let callerId = data["caller_id"] as? String ?? ""

    print("📞 callID:", callID)
    print("👤 callerName:", callerName)
    print("🏠 roomID:", roomID)

    // 👉 lưu data
    UserDefaults.standard.set(roomID, forKey: "CALL_ROOM_ID")
    UserDefaults.standard.set(callID, forKey: "CALL_ID")
    UserDefaults.standard.set(callerId, forKey: "CALLER_ID")
    UserDefaults.standard.set(callerName, forKey: "CALLER_NAME")

    // =================================================
    // 📞 CallKit
    // =================================================
    let uuid = UUID()
    self.currentUUID = uuid

    let update = CXCallUpdate()
    update.remoteHandle = CXHandle(type: .generic, value: callerName)
    update.hasVideo = false

    provider.reportNewIncomingCall(with: uuid, update: update) { error in
      if let error = error {
        print("❌ CallKit error:", error)
      } else {
        print("✅ CallKit shown")
      }
    }

    completion()
  }

  // =================================================
  // 📞 ACCEPT
  // =================================================
  func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
    print("✅ Accepted")

    let roomID = UserDefaults.standard.string(forKey: "CALL_ROOM_ID") ?? ""
    let callerName = UserDefaults.standard.string(forKey: "CALLER_NAME") ?? ""
    let callerId = UserDefaults.standard.string(forKey: "CALLER_ID") ?? ""
    let callId = UserDefaults.standard.string(forKey: "CALL_ID") ?? ""

    // 👉 gửi cho React Native
    UserDefaults.standard.set(true, forKey: "HAS_PENDING_CALL")
    UserDefaults.standard.set(roomID, forKey: "PENDING_ROOM_ID")
    UserDefaults.standard.set(callerName, forKey: "PENDING_CALLER_NAME")
    UserDefaults.standard.set(callerId, forKey: "PENDING_CALLER_ID")
    UserDefaults.standard.set(callId, forKey: "PENDING_CALL_ID")

    action.fulfill()
  }

  // =================================================
  // 📞 END (CallKit → React)
  // =================================================
  func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
    print("❌ CallKit Ended")

    // 👉 notify React Native
    CallModule.emitter?.sendEvent(withName: "CALL_ENDED", body: nil)

    action.fulfill()
  }

  func providerDidReset(_ provider: CXProvider) {
    print("🔄 Provider reset")
  }
}


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
