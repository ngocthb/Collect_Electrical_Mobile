import Foundation
import React

@objc(CallEventEmitter)
class CallEventEmitter: RCTEventEmitter {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    return ["CALL_ACCEPTED"]
  }

  @objc func sendEvent(_ name: String, body: Any?) {
    sendEvent(withName: name, body: body)
  }
}
