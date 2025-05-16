import { colors } from '@/constants/Design';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
}

const Checkbox = ({ checked, onPress }: CheckboxProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );

    if (!checked) {
      opacity.value = withTiming(1, { duration: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 100 });
    }

    onPress();
  };

  const boxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: checked
        ? withTiming(colors.primary, { duration: 100 })
        : withTiming('#FFFFFF', { duration: 100 }),
      borderColor: checked
        ? withTiming(colors.primary, { duration: 100 })
        : withTiming('#DDDDDD', { duration: 100 }),
    };
  });

  const checkStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: checked ? withTiming(1, { duration: 100 }) : withTiming(0.8, { duration: 100 }) },
      ],
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <Animated.View style={[styles.checkbox, boxStyle]}>
        <Animated.View style={checkStyle}>
          <MaterialCommunityIcons
            name="checkbox-blank-outline"
            size={14}
            color="#FFFFFF"
            strokeWidth={3}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Checkbox;

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
