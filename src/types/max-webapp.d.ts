declare global {
  interface MaxWebAppUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  }

  interface MaxWebAppChat {
    id: number;
    type?: string;
  }

  interface MaxWebAppInitDataUnsafe {
    start_param?: string;
    user?: MaxWebAppUser;
    chat?: MaxWebAppChat;
  }

  type MaxHapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

  interface MaxWebAppHapticFeedback {
    selectionChanged: () => void;
    notificationOccurred?: (type: 'success' | 'error' | 'warning') => void;
    impactOccurred?: (style: MaxHapticImpactStyle) => void;
  }

  type MaxWebAppBackButtonHandler = () => void;

  interface MaxWebAppBackButton {
    show: () => void;
    hide: () => void;
    onClick: (cb: MaxWebAppBackButtonHandler) => void;
    offClick: (cb: MaxWebAppBackButtonHandler) => void;
    isVisible?: boolean;
  }

  interface MaxWebAppScreenCapture {
    isScreenCaptureEnabled: boolean;
    enableScreenCapture: () => void;
    disableScreenCapture: () => void;
  }

  type MaxShareChatType = 'dialog' | 'group' | 'channel';

  interface MaxWebApp {
    ready: () => void;
    platform: string;
    version: string;
    initData?: string;
    initDataUnsafe?: MaxWebAppInitDataUnsafe;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    HapticFeedback: MaxWebAppHapticFeedback;
    BackButton?: MaxWebAppBackButton;
    ScreenCapture?: MaxWebAppScreenCapture;
    openMaxLink: (url: string) => void;
    requestContact?: () => void;
    shareContent?: (text: string, link?: string) => void;
    shareMaxContent?: (
      text: string,
      link?: string,
      mid?: string,
      chatType?: MaxShareChatType,
    ) => void;
    requestScreenMaxBrightness?: () => void;
    restoreScreenBrightness?: () => void;
    onEvent?: (eventName: string, cb: (data: unknown) => void) => void;
    offEvent?: (eventName: string, cb: (data: unknown) => void) => void;
    isMock?: boolean;
  }

  interface Window {
    WebApp?: MaxWebApp;
  }
}

export {};
