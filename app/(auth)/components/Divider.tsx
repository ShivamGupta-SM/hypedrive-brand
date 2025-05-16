import { View, Text, StyleSheet } from 'react-native';

type DividerProps = {
  text?: string;
};

const Divider = ({ text }: DividerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      {text && <Text style={styles.text}>{text}</Text>}
      <View style={styles.line} />
    </View>
  );
};

export default Divider;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  text: {
    marginHorizontal: 16,
    color: '#888888',
    fontSize: 14,
  },
});
