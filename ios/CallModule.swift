import Foundation
import React
import CallKit

@objc(CallModule)
class CallModule: RCTEventEmitter {

  static var emitter: RCTEventEmitter?

  override init() {
    super.init()
    CallModule.emitter = self
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    return ["CALL_ENDED"] // 🔥 chỉ cần cái này
  }

  // 👉 GET
  @objc func getItem(
    _ key: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let value = UserDefaults.standard.object(forKey: key)
    resolver(value)
  }

  // 👉 REMOVE
  @objc func removeItem(
    _ key: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    UserDefaults.standard.removeObject(forKey: key)
    resolver(true)
  }

  // =================================================
  // 📞 END CALLKIT (React → iOS)
  // =================================================
  @objc func endCallKit() {
    DispatchQueue.main.async {
      guard let appDelegate = UIApplication.shared.delegate as? AppDelegate,
            let uuid = appDelegate.currentUUID else {
        print("❌ No UUID to end")
        return
      }

      let callController = CXCallController()
      let transaction = CXTransaction(action: CXEndCallAction(call: uuid))

      callController.request(transaction) { error in
        if let error = error {
          print("❌ End CallKit error:", error)
        } else {
          print("✅ CallKit ended")
        }
      }
    }
  }
  
  @objc(getVoipToken:rejecter:)
  func getVoipToken(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    let token = UserDefaults.standard.string(forKey: "VOIP_TOKEN") ?? ""
    resolve(token)
  }
}
