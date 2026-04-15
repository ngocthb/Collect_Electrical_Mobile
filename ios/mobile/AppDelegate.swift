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
  var currentCallID: String?

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
    provider = CXProvider(configuration: config)
    provider.setDelegate(self, queue: nil)

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

  // ✅ Parse data đúng format mới
  let callID = data["call_id"] as? String ?? UUID().uuidString
  let callerID = data["caller_id"] as? String ?? "Unknown"
  let callerName = data["caller_name"] as? String ?? callerID

  var roomID = ""
  if let zegoData = data["zego_data"] as? [String: Any] {
    roomID = zegoData["room_id"] as? String ?? ""
  }

  print("📞 callID:", callID)
  print("👤 callerName:", callerName)
  print("🏠 roomID:", roomID)

  self.currentCallID = callID

  // 👉 Lưu thêm để dùng khi accept
  UserDefaults.standard.set(roomID, forKey: "CALL_ROOM_ID")

  // =================================================
  // 📞 CallKit
  // =================================================
  let uuid = UUID()
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
  // 📞 ACCEPT CALL
  // =================================================
func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
  print("✅ Accepted")

  let roomID = UserDefaults.standard.string(forKey: "CALL_ROOM_ID") ?? ""

  DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
    guard let bridge = self.reactNativeFactory?.bridge else {
      print("❌ Bridge not ready")
      return
    }

    if let emitter = bridge.module(for: CallEventEmitter.self) as? CallEventEmitter {

      let body: [String: Any] = [
        "call_id": self.currentCallID ?? "",
        "room_id": roomID
      ]

      emitter.sendEvent("CALL_ACCEPTED", body: body)
      print("🔥 Sent CALL_ACCEPTED:", body)
    }
  }

  action.fulfill()
}
  // =================================================
  // 📞 END CALL
  // =================================================
 func providerDidReset(_ provider: CXProvider) {
  print("🔄 Provider reset")
}



func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
  print("❌ Ended")
  action.fulfill()
}
}

// =================================================
// ⚛️ React Native Delegate
// =================================================
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