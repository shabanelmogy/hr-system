import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type FlatListProps,
  type LayoutChangeEvent,
} from 'react-native';

import { useLocalization } from '@/src/core/localization';

export interface AppCarouselProps<Item> {
  items: readonly Item[];
  keyExtractor: (item: Item, index: number) => string;
  onIndexChange?: (index: number) => void;
  renderItem: (item: Item, index: number) => ReactNode;
  selectedIndex?: number;
}

export function AppCarousel<Item>({
  items,
  keyExtractor,
  onIndexChange,
  renderItem,
  selectedIndex = 0,
}: AppCarouselProps<Item>) {
  const { isRTL } = useLocalization();
  const listRef = useRef<FlatList<Item>>(null);
  const onIndexChangeRef = useRef(onIndexChange);
  const [viewportWidth, setViewportWidth] = useState(0);
  const safeSelectedIndex = Math.min(Math.max(0, selectedIndex), Math.max(0, items.length - 1));
  const visibleIndexRef = useRef(safeSelectedIndex);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef<
    NonNullable<FlatListProps<Item>['onViewableItemsChanged']>
  >(({ viewableItems }) => {
    const nextItem = viewableItems.find((item) => item.isViewable && item.index !== null);
    if (nextItem?.index !== null && nextItem?.index !== undefined) {
      visibleIndexRef.current = nextItem.index;
    }
  }).current;

  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  useEffect(() => {
    if (viewportWidth === 0 || items.length === 0) return;

    visibleIndexRef.current = safeSelectedIndex;
    listRef.current?.scrollToIndex({
      animated: true,
      index: safeSelectedIndex,
    });
  }, [items.length, safeSelectedIndex, viewportWidth]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setViewportWidth((currentWidth) => currentWidth === nextWidth ? currentWidth : nextWidth);
  }, []);

  const handleMomentumScrollEnd = useCallback(() => {
    const nextIndex = Math.min(
      Math.max(0, visibleIndexRef.current),
      Math.max(0, items.length - 1),
    );
    if (nextIndex !== safeSelectedIndex) onIndexChangeRef.current?.(nextIndex);
  }, [items.length, safeSelectedIndex]);

  return (
    <View onLayout={handleLayout} style={styles.root}>
      <FlatList
        bounces={false}
        data={items}
        decelerationRate="fast"
        disableIntervalMomentum
        extraData={viewportWidth}
        getItemLayout={(_data, index) => ({
          index,
          length: viewportWidth,
          offset: viewportWidth * index,
        })}
        horizontal
        inverted={isRTL}
        keyExtractor={keyExtractor}
        nestedScrollEnabled
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollToIndexFailed={({ index }) => {
          listRef.current?.scrollToOffset({
            animated: true,
            offset: index * viewportWidth,
          });
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        ref={listRef}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, viewportWidth > 0 ? { width: viewportWidth } : null]}>
            {renderItem(item, index)}
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  slide: { width: '100%' },
});
