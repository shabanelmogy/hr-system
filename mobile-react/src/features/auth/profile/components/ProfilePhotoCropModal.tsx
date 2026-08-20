import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import type { ProfilePhotoUpload } from '@/src/features/auth/profile/types';
import {
  AppButton,
  AppIconButton,
  AppModal,
  AppText,
} from '@/src/shared/components';

const MAX_OUTPUT_SIZE = 1024;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export interface ProfilePhotoCropSource extends ProfilePhotoUpload {
  width: number;
  height: number;
}

interface ProfilePhotoCropModalProps {
  loading: boolean;
  onClose: () => void;
  onConfirm: (photo: ProfilePhotoUpload) => Promise<void>;
  onError: (error: unknown) => void;
  source: ProfilePhotoCropSource | null;
}

interface Point {
  x: number;
  y: number;
}

interface TouchPoint {
  pageX: number;
  pageY: number;
}

interface PanGesture {
  mode: 'pan';
  lastPoint: Point;
}

interface PinchGesture {
  mode: 'pinch';
  sourceFocus: Point;
  startDistance: number;
  startZoom: number;
}

interface IdleGesture {
  mode: 'idle';
}

type CropGesture = IdleGesture | PanGesture | PinchGesture;

export function ProfilePhotoCropModal({
  loading,
  onClose,
  onConfirm,
  onError,
  source,
}: ProfilePhotoCropModalProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const cropSize = Math.min(360, windowWidth - 48);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const cropViewRef = useRef<View>(null);
  const cropOriginRef = useRef<Point>({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  const zoomRef = useRef(zoom);
  const gestureRef = useRef<CropGesture>({ mode: 'idle' });

  const sourceWidth = source?.width ?? cropSize;
  const sourceHeight = source?.height ?? cropSize;
  const baseScale = Math.max(cropSize / sourceWidth, cropSize / sourceHeight);
  const displayScale = baseScale * zoom;
  const displayWidth = sourceWidth * displayScale;
  const displayHeight = sourceHeight * displayScale;
  const busy = loading || isCropping;

  const commitTransform = useCallback((nextOffset: Point, nextZoom: number) => {
    const boundedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const nextScale = baseScale * boundedZoom;
    const nextDisplayWidth = sourceWidth * nextScale;
    const nextDisplayHeight = sourceHeight * nextScale;
    const boundedOffset = {
      x: clamp(nextOffset.x, Math.min(0, cropSize - nextDisplayWidth), 0),
      y: clamp(nextOffset.y, Math.min(0, cropSize - nextDisplayHeight), 0),
    };

    zoomRef.current = boundedZoom;
    offsetRef.current = boundedOffset;
    setZoom(boundedZoom);
    setOffset(boundedOffset);
  }, [baseScale, cropSize, sourceHeight, sourceWidth]);

  const resetCrop = useCallback(() => {
    commitTransform({
      x: (cropSize - sourceWidth * baseScale) / 2,
      y: (cropSize - sourceHeight * baseScale) / 2,
    }, MIN_ZOOM);
  }, [baseScale, commitTransform, cropSize, sourceHeight, sourceWidth]);

  useEffect(() => {
    gestureRef.current = { mode: 'idle' };
    resetCrop();
  }, [resetCrop, source?.uri]);

  const changeZoom = useCallback((nextZoom: number, focus: Point = {
    x: cropSize / 2,
    y: cropSize / 2,
  }) => {
    const currentScale = baseScale * zoomRef.current;
    const sourceFocus = {
      x: (focus.x - offsetRef.current.x) / currentScale,
      y: (focus.y - offsetRef.current.y) / currentScale,
    };
    const nextScale = baseScale * clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    commitTransform({
      x: focus.x - sourceFocus.x * nextScale,
      y: focus.y - sourceFocus.y * nextScale,
    }, nextZoom);
  }, [baseScale, commitTransform, cropSize]);

  const panResponder = useMemo(() => {
    const getTouchPoints = (touches: readonly TouchPoint[]) => touches.map((touch) => ({
      x: touch.pageX - cropOriginRef.current.x,
      y: touch.pageY - cropOriginRef.current.y,
    }));

    const beginGesture = (touches: readonly TouchPoint[]) => {
      const points = getTouchPoints(touches);
      if (points.length >= 2) {
        const focus = midpoint(points[0], points[1]);
        const currentScale = baseScale * zoomRef.current;
        gestureRef.current = {
          mode: 'pinch',
          sourceFocus: {
            x: (focus.x - offsetRef.current.x) / currentScale,
            y: (focus.y - offsetRef.current.y) / currentScale,
          },
          startDistance: Math.max(distance(points[0], points[1]), 1),
          startZoom: zoomRef.current,
        };
        return;
      }

      if (points.length === 1) {
        gestureRef.current = { mode: 'pan', lastPoint: points[0] };
      }
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => !busy,
      onMoveShouldSetPanResponder: () => !busy,
      onPanResponderGrant: (event) => {
        beginGesture(event.nativeEvent.touches);
      },
      onPanResponderMove: (event) => {
        const touches = event.nativeEvent.touches;
        const points = getTouchPoints(touches);

        if (points.length >= 2) {
          if (gestureRef.current.mode !== 'pinch') {
            beginGesture(touches);
            return;
          }

          const gesture = gestureRef.current;
          const focus = midpoint(points[0], points[1]);
          const nextZoom = clamp(
            gesture.startZoom * distance(points[0], points[1]) / gesture.startDistance,
            MIN_ZOOM,
            MAX_ZOOM,
          );
          const nextScale = baseScale * nextZoom;
          commitTransform({
            x: focus.x - gesture.sourceFocus.x * nextScale,
            y: focus.y - gesture.sourceFocus.y * nextScale,
          }, nextZoom);
          return;
        }

        if (points.length === 1) {
          if (gestureRef.current.mode !== 'pan') {
            beginGesture(touches);
            return;
          }

          const gesture = gestureRef.current;
          const currentPoint = points[0];
          commitTransform({
            x: offsetRef.current.x + currentPoint.x - gesture.lastPoint.x,
            y: offsetRef.current.y + currentPoint.y - gesture.lastPoint.y,
          }, zoomRef.current);
          gestureRef.current = { mode: 'pan', lastPoint: currentPoint };
        }
      },
      onPanResponderRelease: () => {
        gestureRef.current = { mode: 'idle' };
      },
      onPanResponderTerminate: () => {
        gestureRef.current = { mode: 'idle' };
      },
      onPanResponderTerminationRequest: () => false,
    });
  }, [baseScale, busy, commitTransform]);

  const confirmCrop = async () => {
    if (!source || busy) return;

    setIsCropping(true);
    try {
      const currentDisplayScale = baseScale * zoomRef.current;
      const cropSide = Math.max(
        1,
        Math.floor(Math.min(source.width, source.height, cropSize / currentDisplayScale)),
      );
      const originX = Math.round(clamp(
        -offsetRef.current.x / currentDisplayScale,
        0,
        source.width - cropSide,
      ));
      const originY = Math.round(clamp(
        -offsetRef.current.y / currentDisplayScale,
        0,
        source.height - cropSide,
      ));
      const context = ImageManipulator.manipulate(source.uri).crop({
        originX,
        originY,
        width: cropSide,
        height: cropSide,
      });
      if (cropSide > MAX_OUTPUT_SIZE) {
        context.resize({ width: MAX_OUTPUT_SIZE, height: MAX_OUTPUT_SIZE });
      }
      const renderedImage = await context.renderAsync();
      const result = await renderedImage.saveAsync({
        compress: 0.85,
        format: SaveFormat.JPEG,
      });

      await onConfirm({
        uri: result.uri,
        fileName: `profile-${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        fileSize: null,
      });
    } catch (error) {
      onError(error);
    } finally {
      setIsCropping(false);
    }
  };

  const footer = (
    <View style={[styles.footerActions, { direction }]}>
      <AppButton
        disabled={busy}
        icon="close-outline"
        onPress={onClose}
        style={styles.footerButton}
        variant="outline">
        {t('common.cancel')}
      </AppButton>
      <AppButton
        icon="checkmark-outline"
        loading={busy}
        onPress={() => void confirmCrop()}
        style={styles.footerButton}>
        {t('profile.confirmCrop')}
      </AppButton>
    </View>
  );

  return (
    <AppModal
      closeDisabled={busy}
      closeLabel={t('common.close')}
      contentContainerStyle={styles.fullScreenContent}
      footer={footer}
      icon="crop-outline"
      onClose={onClose}
      scrollable={false}
      showCloseButton={false}
      subtitle={t('profile.cropPhotoDescription')}
      title={t('profile.cropPhotoTitle')}
      variant="fullScreen"
      visible={source !== null}>
      <View style={styles.editor}>
        {source ? (
          <View
            accessibilityActions={[
              { name: 'increment', label: t('profile.zoomIn') },
              { name: 'decrement', label: t('profile.zoomOut') },
            ]}
            accessibilityLabel={t('profile.cropPhotoPreview')}
            accessibilityRole="adjustable"
            accessibilityValue={{
              min: MIN_ZOOM * 100,
              max: MAX_ZOOM * 100,
              now: Math.round(zoom * 100),
              text: `${Math.round(zoom * 100)}%`,
            }}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'increment') {
                changeZoom(zoomRef.current + ZOOM_STEP);
              } else if (event.nativeEvent.actionName === 'decrement') {
                changeZoom(zoomRef.current - ZOOM_STEP);
              }
            }}
            onLayout={() => {
              cropViewRef.current?.measureInWindow((x, y) => {
                cropOriginRef.current = { x, y };
              });
            }}
            ref={cropViewRef}
            {...panResponder.panHandlers}
            style={[
              styles.cropViewport,
              {
                width: cropSize,
                height: cropSize,
                backgroundColor: '#111827',
                borderColor: theme.colors.primary,
                borderRadius: cropSize / 2,
              },
            ]}>
            <Image
              resizeMode="stretch"
              source={{ uri: source.uri }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: displayWidth,
                height: displayHeight,
                transform: [
                  { translateX: offset.x },
                  { translateY: offset.y },
                ],
              }}
            />
            <View pointerEvents="none" style={[styles.gridLine, styles.gridVerticalStart]} />
            <View pointerEvents="none" style={[styles.gridLine, styles.gridVerticalEnd]} />
            <View pointerEvents="none" style={[styles.gridLine, styles.gridHorizontalStart]} />
            <View pointerEvents="none" style={[styles.gridLine, styles.gridHorizontalEnd]} />
            <View pointerEvents="none" style={styles.cropBorder} />
          </View>
        ) : null}

        <AppText align="center" color="muted" variant="bodySmall">
          {t('profile.cropPhotoHint')}
        </AppText>

        <View style={[styles.zoomControls, { direction }]}>
          <AppIconButton
            disabled={busy || zoom <= MIN_ZOOM}
            icon="remove-outline"
            label={t('profile.zoomOut')}
            onPress={() => changeZoom(zoomRef.current - ZOOM_STEP)}
          />
          <View
            style={[
              styles.zoomBadge,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.full,
              },
            ]}>
            <AppText align="center" weight="700">
              {Math.round(zoom * 100)}%
            </AppText>
          </View>
          <AppIconButton
            disabled={busy || zoom >= MAX_ZOOM}
            icon="add-outline"
            label={t('profile.zoomIn')}
            onPress={() => changeZoom(zoomRef.current + ZOOM_STEP)}
          />
          <AppIconButton
            disabled={busy || (zoom === MIN_ZOOM && isCentered(offset, cropSize, displayWidth, displayHeight))}
            icon="refresh-outline"
            label={t('profile.resetCrop')}
            onPress={resetCrop}
          />
        </View>
      </View>
    </AppModal>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function distance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function midpoint(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function isCentered(
  offset: Point,
  cropSize: number,
  displayWidth: number,
  displayHeight: number,
) {
  const tolerance = 0.5;
  return Math.abs(offset.x - (cropSize - displayWidth) / 2) < tolerance
    && Math.abs(offset.y - (cropSize - displayHeight) / 2) < tolerance;
}

const styles = StyleSheet.create({
  fullScreenContent: {
    flex: 1,
    justifyContent: 'center',
  },
  editor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  cropViewport: {
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  cropBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 999,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
  },
  gridVerticalStart: { top: 0, bottom: 0, left: '33.333%', width: StyleSheet.hairlineWidth },
  gridVerticalEnd: { top: 0, bottom: 0, right: '33.333%', width: StyleSheet.hairlineWidth },
  gridHorizontalStart: { left: 0, right: 0, top: '33.333%', height: StyleSheet.hairlineWidth },
  gridHorizontalEnd: { left: 0, right: 0, bottom: '33.333%', height: StyleSheet.hairlineWidth },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  zoomBadge: {
    minWidth: 72,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  footerActions: { flexDirection: 'row', gap: 10 },
  footerButton: { flex: 1 },
});
