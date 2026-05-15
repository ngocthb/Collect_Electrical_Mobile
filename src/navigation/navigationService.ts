import {
  createNavigationContainerRef,
} from '@react-navigation/native';

type RootParamList = Record<string, object | undefined>;

export const navigationRef = createNavigationContainerRef<RootParamList>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function reset(state: any) {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  }
}