import { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { colors } from '@/src/constants/colors';

export interface BirthdayValue {
  day: number;
  month: number; // 0-indexed (January = 0)
  year?: number;
}

interface BirthdayWheelPickerProps {
  value: BirthdayValue;
  onChange: (value: BirthdayValue) => void;
  expanded: boolean;
}

// ─── WheelColumn ────────────────────────────────────────────────
// A single scrollable column that snaps to items, mimicking UIPickerView
// with opacity + scale fade for the "drum" illusion.

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface WheelColumnProps<T extends string | number> {
  items: { label: string; value: T }[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  width?: number;
  testID?: string;
}

// ─── WheelItem ──────────────────────────────────────────────────

interface WheelItemProps {
  index: number;
  label: string;
  scrollY: Animated.Value;
  testID?: string;
}

function WheelItem({ index, label, scrollY, testID }: WheelItemProps): React.ReactElement {
  const itemOffset = index * ITEM_HEIGHT;

  const opacity = scrollY.interpolate({
    inputRange: [
      itemOffset - 3 * ITEM_HEIGHT,
      itemOffset - 2 * ITEM_HEIGHT,
      itemOffset - ITEM_HEIGHT,
      itemOffset,
      itemOffset + ITEM_HEIGHT,
      itemOffset + 2 * ITEM_HEIGHT,
      itemOffset + 3 * ITEM_HEIGHT,
    ],
    outputRange: [0.1, 0.25, 0.5, 1, 0.5, 0.25, 0.1],
    extrapolate: 'clamp',
  });

  const scale = scrollY.interpolate({
    inputRange: [
      itemOffset - 2 * ITEM_HEIGHT,
      itemOffset - ITEM_HEIGHT,
      itemOffset,
      itemOffset + ITEM_HEIGHT,
      itemOffset + 2 * ITEM_HEIGHT,
    ],
    outputRange: [0.85, 0.92, 1, 0.92, 0.85],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.wheelItem,
        { opacity, transform: [{ scale }] },
      ]}
    >
      <Text style={styles.wheelItemText} testID={testID}>
        {label}
      </Text>
    </Animated.View>
  );
}

// ─── WheelColumn ────────────────────────────────────────────────

function WheelColumn<T extends string | number>({
  items,
  selectedValue,
  onValueChange,
  width,
  testID,
}: WheelColumnProps<T>): React.ReactElement {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);
  const lastReportedIndex = useRef(-1);

  const selectedIndex = useMemo(
    () => Math.max(0, items.findIndex((item) => item.value === selectedValue)),
    [items, selectedValue],
  );

  useEffect(() => {
    if (!isUserScrolling.current) {
      (scrollRef.current as any)?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
      lastReportedIndex.current = selectedIndex;
    }
  }, [selectedIndex]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isUserScrolling.current = false;
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      if (clampedIndex !== lastReportedIndex.current) {
        lastReportedIndex.current = clampedIndex;
        Haptics.selectionAsync();
        onValueChange(items[clampedIndex].value);
      }
    },
    [items, onValueChange],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  const verticalPadding = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

  return (
    <View style={[styles.wheelColumn, width != null ? { width } : { flex: 1 }]} testID={testID}>
      {/* Selection highlight — glass pill */}
      <GlassView
        style={styles.selectionHighlight}
        pointerEvents="none"
        testID={testID ? `${testID}-highlight` : undefined}
      />

      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: verticalPadding }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        testID={testID ? `${testID}-scroll` : undefined}
      >
        {items.map((item, i) => (
          <WheelItem
            key={`${item.value}-${i}`}
            index={i}
            label={item.label}
            scrollY={scrollY}
            testID={testID ? `${testID}-item-${item.value}` : undefined}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

// ─── Constants ──────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MIN_YEAR = 1920;
const CURRENT_YEAR = new Date().getFullYear();

function daysInMonth(month: number, year?: number): number {
  const y = year ?? 2001;
  return new Date(y, month + 1, 0).getDate();
}

// ─── BirthdayWheelPicker ────────────────────────────────────────

export function BirthdayWheelPicker({ value, onChange, expanded }: BirthdayWheelPickerProps): React.ReactElement {
  const maxDays = useMemo(() => daysInMonth(value.month, value.year), [value.month, value.year]);

  const dayItems = useMemo(() => {
    const items: { label: string; value: number }[] = [];
    for (let d = 1; d <= maxDays; d++) items.push({ label: String(d), value: d });
    return items;
  }, [maxDays]);

  const monthItems = useMemo(
    () => MONTH_NAMES.map((name, index) => ({ label: name, value: index })),
    [],
  );

  const yearItems = useMemo(() => {
    const items: { label: string; value: string }[] = [{ label: '----', value: 'none' }];
    for (let y = CURRENT_YEAR; y >= MIN_YEAR; y--) items.push({ label: String(y), value: String(y) });
    return items;
  }, []);

  const handleDayChange = useCallback(
    (day: number) => {
      onChange({ ...value, day });
    },
    [value, onChange],
  );

  const handleMonthChange = useCallback(
    (month: number) => {
      const max = daysInMonth(month, value.year);
      const day = Math.min(value.day, max);
      onChange({ ...value, month, day });
    },
    [value, onChange],
  );

  const handleYearChange = useCallback(
    (rawValue: string) => {
      const year = rawValue === 'none' ? undefined : Number(rawValue);
      const month = value.month;
      const max = daysInMonth(month, year);
      const day = Math.min(value.day, max);
      onChange({ ...value, year, day });
    },
    [value, onChange],
  );

  if (!expanded) {
    return <></>;
  }

  return (
    <View style={styles.wheelRow}>
      <WheelColumn
        items={dayItems}
        selectedValue={value.day}
        onValueChange={handleDayChange}
        width={72}
        testID="day-picker"
      />
      <WheelColumn
        items={monthItems}
        selectedValue={value.month}
        onValueChange={handleMonthChange}
        testID="month-picker"
      />
      <WheelColumn
        items={yearItems}
        selectedValue={value.year != null ? String(value.year) : 'none'}
        onValueChange={handleYearChange}
        width={100}
        testID="year-picker"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wheelRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  wheelColumn: {
    height: WHEEL_HEIGHT,
    overflow: 'hidden',
  },
  selectionHighlight: {
    position: 'absolute',
    top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    zIndex: 0,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 21,
    fontWeight: '500',
    color: colors.neutralDark,
  },
});
