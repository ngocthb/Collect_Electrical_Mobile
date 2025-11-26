// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   TextInput,
//   NativeSyntheticEvent,
//   TextInputChangeEventData,
//   TextInputKeyPressEventData,
//   TouchableWithoutFeedback,
//   Keyboard,
// } from 'react-native';
// import toast from 'react-native-toast-message';
// import AppButton from '../../components/ui/AppButton';
// import { useNavigation } from '@react-navigation/native';
// import { useAppDispatch } from '../../store/hooks';

// import SubLayout from '../../layout/SubLayout';

// const verify = require('../../assets/images/verify.png');

// export default function VerifyScreen() {
//   const navigation = useNavigation<any>();
//   const inputsRef = useRef<Array<TextInput | null>>([]);
//   const [digits, setDigits] = useState(['', '', '', '']);
//   const [countdown, setCountdown] = useState(30); // seconds until resend allowed
//   const [loadingVerify, setLoadingVerify] = useState(false);
//   const dispatch = useAppDispatch();
//   useEffect(() => {
//     // start initial cooldown (user just received OTP)
//     setCountdown(30);
//   }, []);

//   useEffect(() => {
//     if (countdown <= 0) return;
//     const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
//     return () => clearInterval(t);
//   }, [countdown]);

//   const handleChange = (index: number) => (text: string) => {
//     const ch = text.replace(/[^0-9]/g, '');
//     if (!ch && digits[index]) {
//       // deletion
//       const next = [...digits];
//       next[index] = '';
//       setDigits(next);
//       if (index > 0) inputsRef.current[index - 1]?.focus();
//       return;
//     }

//     const char = ch.charAt(ch.length - 1) || '';
//     const next = [...digits];
//     next[index] = char;
//     setDigits(next);
//     if (char && index < inputsRef.current.length - 1) {
//       inputsRef.current[index + 1]?.focus();
//     }
//   };

//   const code = digits.join('');

//   const handleVerify = () => {
//     if (code.length < 4) {
//       toast.show({
//         type: 'warning',
//         text1: 'Thiếu mã',
//         text2: 'Vui lòng nhập đủ 4 chữ số OTP',
//       });
//       return;
//     }
//     setLoadingVerify(true);
//     // simulate verification latency
//     setTimeout(() => {
//       setLoadingVerify(false);
//       if (code === '1234') {
//         // success -> mark pending registration as verified and go to Login
//         dispatch(verifyPendingRegistration());
//         toast.show({
//           type: 'success',
//           text1: 'Xác thực thành công',
//           text2: 'Bạn có thể đăng nhập bằng thông tin đã đăng ký',
//         });
//         navigation.navigate('Login');
//       } else {
//         toast.show({
//           type: 'error',
//           text1: 'Mã không đúng',
//           text2: 'OTP bạn nhập không hợp lệ',
//         });
//         // clear inputs
//         setDigits(['', '', '', '']);
//         inputsRef.current[0]?.focus();
//       }
//     }, 800);
//   };

//   const handleResend = () => {
//     if (countdown > 0) return;
//     // Simulate sending OTP
//     toast.show({
//       type: 'success',
//       text1: 'Đã gửi lại',
//       text2: 'OTP mới đã được gửi tới số email của bạn',
//     });
//     setDigits(['', '', '', '']);
//     inputsRef.current[0]?.focus();
//     setCountdown(30);
//   };

//   return (
//     <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
//       <View className="flex-1 bg-white px-6 items-center justify-center">
//         {/* Logo */}
//         <View className="w-28 h-28 items-center justify-center mb-8">
//           <Image source={verify} className="w-32 h-32" resizeMode="contain" />
//         </View>

//         {/* Title */}
//         <Text className="text-center text-2xl font-bold text-text-main mb-2">
//           Xác thực <Text className="text-primary-100">OTP</Text>
//         </Text>
//         <Text className="text-center text-sm text-text-muted mb-8">
//           Nhập mã OTP được gửi về email của bạn
//         </Text>

//         {/* OTP inputs */}
//         <View className="flex-row w-full justify-between px-6 mb-6">
//           {[0, 1, 2, 3].map(i => (
//             <TextInput
//               key={i}
//               ref={r => {
//                 inputsRef.current[i] = r;
//               }}
//               value={digits[i]}
//               onChangeText={handleChange(i)}
//               onKeyPress={(
//                 e: NativeSyntheticEvent<TextInputKeyPressEventData>,
//               ) => {
//                 const key = e.nativeEvent.key;
//                 // If user pressed backspace on an empty input, move focus to previous and clear it
//                 if (key === 'Backspace') {
//                   if (digits[i] === '' && i > 0) {
//                     const prev = [...digits];
//                     prev[i - 1] = '';
//                     setDigits(prev);
//                     inputsRef.current[i - 1]?.focus();
//                   } else if (digits[i] !== '') {
//                     // If current has a digit, clear it (keeps focus on current)
//                     const next = [...digits];
//                     next[i] = '';
//                     setDigits(next);
//                   }
//                 }
//               }}
//               onSubmitEditing={i === 3 ? () => handleVerify() : undefined}
//               blurOnSubmit={i === 3}
//               keyboardType="number-pad"
//               maxLength={1}
//               className="w-14 h-14 border-b-2 text-center text-xl"
//               style={{ borderColor: '#e5e7eb' }}
//               returnKeyType={i === 3 ? 'done' : 'next'}
//             />
//           ))}
//         </View>

//         <AppButton
//           title="Xác thực ngay"
//           onPress={handleVerify}
//           loading={loadingVerify}
//           disabled={code.length < 4}
//         />

//         <View className="mt-4 items-center">
//           <View className="flex-row items-center">
//             <Text className="text-text-muted">Bạn chưa nhận được OTP? </Text>
//             {countdown > 0 ? (
//               <Text className="text-primary-100 font-semibold">
//                 Gửi lại trong {String(countdown).padStart(2, '0')}s
//               </Text>
//             ) : (
//               <TouchableOpacity onPress={handleResend}>
//                 <Text className="font-semibold text-primary-100">
//                   Gửi lại ngay
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>

//         <View className="flex-row justify-center mt-6">
//           <Text className="text-base font-normal text-text-muted">
//             Chưa có tài khoản?
//           </Text>
//           <TouchableOpacity
//             onPress={() => {
//               navigation.navigate('Register');
//             }}
//           >
//             <Text className="text-primary-100 text-base font-bold ml-2 ">
//               Đăng ký
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }
