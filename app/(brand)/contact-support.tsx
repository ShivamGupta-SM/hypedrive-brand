import { AppHeader } from '@/components/ui/AppHeader';
import { SectionItem } from '@/components/ui/SectionItem';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Route, router } from 'expo-router';
import { CaretRight, Clock, Envelope, Question, WhatsappLogo } from 'phosphor-react-native';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FAQItemType = {
  id: string;
  question: string;
  route: Route;
};

export default function ContactSupportScreen() {
  // Support channels
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@hypedrive.com');
  };

  const handleWhatsAppSupport = () => {
    Linking.openURL('https://wa.me/919876543210');
  };

  // FAQ items
  const faqItems: FAQItemType[] = [
    {
      id: 'create-campaign',
      question: 'How do I create a campaign?',
      route: '/help/create-campaign',
    },
    {
      id: 'payment-billing',
      question: 'Payment and billing questions',
      route: '/help/payment-billing',
    },
    {
      id: 'account-verification',
      question: 'Account verification process',
      route: '/help/account-verification',
    },
  ];

  const handleFAQPress = (item: FAQItemType) => {
    router.push(item.route);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Contact Support" showBackButton />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          We're here to help. Reach out through any of these support channels.
        </Text>

        {/* Support Channels */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            {/* Email Support */}
            <TouchableOpacity style={styles.supportItem} onPress={handleEmailSupport}>
              <View style={styles.supportItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.blue[50] }]}>
                  <Envelope size={24} color={colors.blue[500]} weight="fill" />
                </View>
                <View style={styles.supportItemInfo}>
                  <Text style={styles.supportItemTitle}>Email Support</Text>
                  <Text style={styles.supportItemSubtitle}>support@hypedrive.com</Text>
                </View>
                <CaretRight size={20} color={colors.gray[400]} />
              </View>
            </TouchableOpacity>

            {/* WhatsApp Support */}
            <TouchableOpacity style={styles.supportItem} onPress={handleWhatsAppSupport}>
              <View style={styles.supportItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.green[50] }]}>
                  <WhatsappLogo size={24} color={colors.green[500]} weight="fill" />
                </View>
                <View style={styles.supportItemInfo}>
                  <Text style={styles.supportItemTitle}>WhatsApp</Text>
                  <Text style={styles.supportItemSubtitle}>+91 98765 43210</Text>
                </View>
                <CaretRight size={20} color={colors.gray[400]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Frequently Asked Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.sectionContent}>
            {faqItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <SectionItem
                  containerStyle={{
                    backgroundColor: colors.white,
                    borderRadius: borderRadius.xl,
                    borderWidth: 1,
                    borderColor: colors.gray[100],
                    marginBottom: spacing.sm,
                    paddingHorizontal: spacing.md,
                  }}
                  labelStyle={{ fontSize: typography.sizes.sm }}
                  icon={<Question size={22} color={colors.orange[500]} weight="fill" />}
                  label={item.question}
                  iconBg={colors.orange[50]}
                  onPress={() => handleFAQPress(item)}
                />
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.supportHoursSection}>
          <View style={styles.supportHoursHeader}>
            <View style={styles.supportHoursIconContainer}>
              <Clock size={18} color={colors.white} weight="fill" />
            </View>
            <View>
              <Text style={styles.supportHoursTitle}>Support Hours</Text>
              <Text style={styles.supportHoursText}>
                Our team is available Monday to Friday, 9 AM to 6 PM IST. We typically respond
                within 2-4 hours.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginHorizontal: spacing.mg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.mg,
  },
  sectionContent: {
    marginHorizontal: spacing.md,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    borderColor: colors.gray[100],
  },
  supportItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  supportItemInfo: {
    flex: 1,
  },
  supportItemTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  supportItemSubtitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
  },
  supportHoursSection: {
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  supportHoursHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  supportHoursIconContainer: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  supportHoursTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  supportHoursText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    maxWidth: '90%',
  },
});
