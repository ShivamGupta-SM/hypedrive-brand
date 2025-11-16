import { borderRadius, colors } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * A component that renders a "PAID" stamp overlay for invoices
 */
const PaidStamp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>PAID</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '32deg' }],
    borderWidth: 4,
    borderColor: colors.green[500],
    borderRadius: borderRadius.sm,
    opacity: 0.4,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.green[500],
  },
});

export default PaidStamp;
