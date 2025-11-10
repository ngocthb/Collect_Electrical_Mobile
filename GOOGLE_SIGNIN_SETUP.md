# Google Sign-In Setup Guide

## ✅ Đã hoàn thành

### 1. **Tích hợp Google Sign-In với Firebase Token**

Đã thêm chức năng đăng nhập Google vào `LoginScreen` với các tính năng:

- ✅ Đăng nhập qua Google
- ✅ Lấy Firebase ID token sau khi đăng nhập
- ✅ Hiển thị toast thông báo thành công/thất bại
- ✅ Tự động điều hướng sau khi đăng nhập
- ✅ Xử lý lỗi và trạng thái loading

### 2. **Files đã chỉnh sửa**

#### `src/store/authSlice.ts`

- Thêm async thunk `loginWithGoogle`
- Tích hợp `@react-native-google-signin/google-signin`
- Tích hợp `@react-native-firebase/auth`
- Lấy Firebase ID token từ Google credential
- Thêm reducers xử lý Google login (pending/fulfilled/rejected)
- Persist user data vào AsyncStorage

#### `src/screens/auth/LoginScreen.tsx`

- Thêm handler `handleGoogleLogin`
- Import `loginWithGoogle` từ authSlice
- Kết nối nút Google Sign-In với handler
- Thêm toast notifications cho feedback

#### `src/config/googleSignIn.ts` (Mới)

- Cấu hình Google Sign-In
- **CẦN CẬP NHẬT**: Thay `YOUR_WEB_CLIENT_ID` bằng Web Client ID từ Firebase Console

#### `App.tsx`

- Import và gọi `configureGoogleSignIn()` khi khởi động app

## 🔧 Cần làm tiếp

### 1. **Lấy Web Client ID từ Firebase Console**

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Project Settings** (⚙️) → **General**
4. Scroll xuống **Your apps** → chọn **Web app**
5. Copy **Web client ID** (có dạng: `xxxxx.apps.googleusercontent.com`)
6. Dán vào file `src/config/googleSignIn.ts`:

```typescript
webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
```

### 2. **Cấu hình Android**

Thêm SHA-1 fingerprint vào Firebase:

```bash
# Lấy SHA-1 từ debug keystore
cd android
./gradlew signingReport

# Hoặc dùng keytool
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy SHA-1 và thêm vào Firebase Console:

- **Project Settings** → **Your apps** → **Android app**
- Scroll xuống **SHA certificate fingerprints**
- Click **Add fingerprint** và paste SHA-1

### 3. **Download google-services.json mới**

Sau khi thêm SHA-1:

1. Download `google-services.json` mới từ Firebase Console
2. Thay thế file cũ ở `android/app/google-services.json`

### 4. **Rebuild app**

```bash
cd android
./gradlew clean

# Quay lại root và chạy
npx react-native run-android
```

## 📱 Cách sử dụng

1. Mở app → màn hình Login
2. Nhấn nút Google (icon Google)
3. Chọn tài khoản Google
4. App sẽ:
   - Lấy thông tin từ Google
   - Đăng nhập Firebase
   - Lấy Firebase ID token
   - Lưu user data vào Redux + AsyncStorage
   - Hiển thị toast "Đăng nhập thành công"
   - Chuyển đến MainTabs (user) hoặc Dashboard (delivery)

## 🔍 Debug

Xem logs trong Metro terminal:

```
[GoogleLogin] Firebase token: eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...
[GoogleLogin] User info: { email: '...', name: '...', ... }
```

## 🎯 Flow hoàn chỉnh

```
User nhấn nút Google
  → GoogleSignin.signIn()
  → Lấy idToken + user info
  → auth().signInWithCredential(googleCredential)
  → userCredential.user.getIdToken() → Firebase Token
  → Dispatch loginWithGoogle.fulfilled
  → Lưu user + role vào Redux
  → Persist vào AsyncStorage
  → Show toast success
  → Navigate to MainTabs/Dashboard
```

## ⚠️ Lưu ý

- Firebase token sẽ tự động refresh sau 1 giờ (Firebase SDK tự handle)
- Nếu muốn gửi token lên backend API, lấy từ: `userCredential.user.getIdToken()`
- Backend cần verify token bằng Firebase Admin SDK
- Role hiện tại được xác định bằng email (chứa 'delivery' → role = 'delivery')
- Có thể custom logic role trong `authSlice.ts` line ~218

## 📚 Dependencies đã sử dụng

- `@react-native-google-signin/google-signin` - Google Sign-In SDK
- `@react-native-firebase/auth` - Firebase Authentication
- `@react-native-firebase/app` - Firebase Core (đã có)

## 🚀 API Backend Integration (Optional)

Nếu backend cần Firebase token:

```typescript
// Trong authSlice.ts, sau khi lấy firebaseToken:
const response = await axios.post('/api/auth/google', {
  firebaseToken,
  email: user.email,
  name: user.name,
});

// Backend verify token:
// - Node.js: admin.auth().verifyIdToken(firebaseToken)
// - Return user data + JWT token của backend
```
