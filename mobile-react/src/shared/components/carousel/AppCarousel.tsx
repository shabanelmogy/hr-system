import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type FlatListProps,
  type LayoutChangeEvent,
} from 'react-native';

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
  const listRef = useRef<FlatList<Item>>(null);
  const onIndexChangeRef = useRef(onIndexChange);
  const [itemHeights, setItemHeights] = useState<Record<string, number>>({});
  const [viewportWidth, setViewportWidth] = useState(0);
  const safeSelectedIndex = Math.min(Math.max(0, selectedIndex), Math.max(0, items.length - 1));
  const selectedItemKey = items.length > 0
    ? keyExtractor(items[safeSelectedIndex] as Item, safeSelectedIndex)
    : undefined;
  const selectedItemHeight = selectedItemKey ? itemHeights[selectedItemKey] : undefined;
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

  const handleItemLayout = useCallback((itemKey: string, event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    setItemHeights((currentHeights) => currentHeights[itemKey] === nextHeight
      ? currentHeights
      : { ...currentHeights, [itemKey]: nextHeight });
  }, []);

  if (items.length === 1) {
    return (
      <View onLayout={handleLayout} style={styles.root}>
        <View style={styles.slide}>{renderItem(items[0] as Item, 0)}</View>
      </View>
    );
  }

  return (
    <View onLayout={handleLayout} style={styles.root}>
      <FlatList
        bounces={false}
        contentContainerStyle={styles.listContent}
        data={items}
        decelerationRate="fast"
        disableIntervalMomentum
        extraData={`${viewportWidth}:${selectedItemHeight ?? 0}`}
        getItemLayout={(_data, index) => ({
          index,
          length: viewportWidth,
          offset: viewportWidth * index,
        })}
        horizontal
        initialScrollIndex={safeSelectedIndex}
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
        renderItem={({ item, index }) => {
          const itemKey = keyExtractor(item, index);
          return (
            <View style={[styles.slide, viewportWidth > 0 ? { width: viewportWidth } : null]}>
              <View
                onLayout={(event) => handleItemLayout(itemKey, event)}
                style={styles.slideContent}>
                {renderItem(item, index)}
              </View>
            </View>
          );
        }}
        showsHorizontalScrollIndicator={false}
        style={[
          styles.list,
          selectedItemHeight ? { height: selectedItemHeight } : null,
        ]}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  list: { width: '100%', direction: 'ltr', flexGrow: 0 },
  listContent: { alignItems: 'flex-start' },
  slide: { width: '100%', alignSelf: 'flex-start' },
  slideContent: { width: '100%' },
});
