import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { colors, typography, spacing } from '@/constants/Design';
import Checkbox from './Checkbox';

type TermsAgreementProps = {
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
};

const TermsAgreement = ({ checked, onCheckChange }: TermsAgreementProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginVertical: spacing.mg,
      }}>
      <Checkbox checked={checked} onPress={() => onCheckChange(!checked)} />
      <View style={styles.terms}>
        <Text style={styles.termsText}>
          I agree to Hyperdrive&apos;s{' '}
          <Link href="/(auth)/(legal)/terms" asChild>
            <Text style={styles.termsLink}>Terms of Service</Text>
          </Link>{' '}
          and{' '}
          <Link href="/(auth)/(legal)/privacy" asChild>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Link>
        </Text>
      </View>
    </View>
  );
};

export default TermsAgreement;

const styles = StyleSheet.create({
  terms: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  termsText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xm,
    fontWeight: typography.weights.semibold,
  },
  termsLink: {
    color: colors.black,
    fontSize: typography.sizes.xm,
    fontWeight: typography.weights.semibold,
  },
});
