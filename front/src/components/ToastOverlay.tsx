import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastOverlayProps {
  visible: boolean;
  message: string | null;
  type?: ToastType;
  onHide?: () => void;
  autoHide?: boolean;
  duration?: number; // ms
  position?: 'top' | 'bottom';
}

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  error: 'close-circle',
  success: 'checkmark-circle',
  info: 'information-circle',
  warning: 'alert-circle',
};

const COLORS: Record<ToastType, { bg: string; fg: string; border: string }> = {
  error: {
    bg: 'rgba(254, 242, 242, 0.98)',
    fg: theme.colors.error[600],
    border: theme.colors.error[100],
  },
  success: {
    bg: 'rgba(240, 253, 244, 0.98)',
    fg: theme.colors.success[600],
    border: theme.colors.success[100],
  },
  info: {
    bg: 'rgba(239, 246, 255, 0.98)',
    fg: theme.colors.primary[600],
    border: theme.colors.primary[200],
  },
  warning: {
    bg: 'rgba(255, 251, 235, 0.98)',
    fg: theme.colors.warning[600],
    border: theme.colors.warning[100],
  },
};

export const ToastOverlay: React.FC<ToastOverlayProps> = ({
  visible,
  message,
  type = 'info',
  onHide,
  autoHide = true,
  duration = 3500,
  position = 'bottom',
}) => {
  const initialOffset = position === 'top' ? -20 : 20;
  const exitOffset = position === 'top' ? -10 : 10;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(initialOffset)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isShowingRef = useRef<boolean>(false);

  useEffect(() => {
  console.log('[ToastOverlay] useEffect visible/message ->', { visible, message });
  if (visible && message) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: false, speed: 18, bounciness: 6 }),
      ]).start();

      // mark as showing so hide() knows we started visible
      isShowingRef.current = true;

      if (autoHide) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          hide();
        }, duration);
      }
    } else {
  // only request hide when we previously showed the toast to avoid extra onHide cycles
  if (isShowingRef.current) {
    hide();
  }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, message]);

  const hide = () => {
    // guard: if already hidden, don't run hide sequence again
    if (!isShowingRef.current) return;
    isShowingRef.current = false;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(translateY, { toValue: exitOffset, duration: 180, useNativeDriver: false }),
    ]).start(() => {
      onHide && onHide();
    });
  };

  if (!message) return null;

  const palette = COLORS[type];

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFillObject, { zIndex: 10001 }]}> 
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.toast,
          position === 'top' ? styles.top : styles.bottom,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            shadowColor: palette.fg,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Ionicons name={ICONS[type]} size={20} color={palette.fg} style={{ marginRight: 8, marginTop: 1 }} />
        <Text style={[styles.text, { color: palette.fg }]} numberOfLines={3}>
          {message}
        </Text>
      </Animated.View>
      </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
  },
  top: {
    top: 60,
  },
  bottom: {
    bottom: 40,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default ToastOverlay;
