import { GradientButton } from '@/components/GradientButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { Clock, DotsThreeOutlineVertical, Plus } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Types
type TeamMemberRole = 'Admin' | 'Editor' | 'Viewer';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  avatar?: string;
  addedDate: string;
};

// Mock data
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@nike.com',
    role: 'Admin',
    addedDate: 'Jan 15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@nike.com',
    role: 'Editor',
    addedDate: 'Jan 10',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@nike.com',
    role: 'Viewer',
    addedDate: 'Jan 5',
  },
];

export default function TeamMembersScreen() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'editors' | 'viewers'>('all');

  // Stats calculations
  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.length;
  const pendingInvites = 0;

  // Filter members based on active tab
  const filteredMembers = teamMembers.filter(member => {
    if (activeTab === 'all') return true;
    if (activeTab === 'admins') return member.role === 'Admin';
    if (activeTab === 'editors') return member.role === 'Editor';
    if (activeTab === 'viewers') return member.role === 'Viewer';
    return true;
  });

  // Handle adding a new team member
  const handleAddMember = () => {
    router.push('/team-members/invite');
  };

  // Handle member options
  const handleMemberOptions = (memberId: string) => {
    console.log('Options for member:', memberId);
    // Implement options menu (edit role, remove member, etc.)
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Team Members"
        showBackButton
        titleStyle={{
          fontSize: typography.sizes.lg,
        }}
        rightContent={
          <GradientButton
            title="Add"
            onPress={() => router.push('/team-members/invite')}
            icon={<Plus size={16} color={colors.white} weight="bold" />}
            iconPosition="left"
            // style={styles.createButton}
            gradientColors={[colors.orange[500], colors.orange[600]]}
            size="sm"
          />
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{totalMembers}</Text>
          </View>

          <View style={[styles.statCard, styles.activeCard]}>
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statValue}>{activeMembers}</Text>
          </View>

          <View style={[styles.statCard, styles.pendingCard]}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{pendingInvites}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}>
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'admins' && styles.activeTab]}
            onPress={() => setActiveTab('admins')}>
            <Text style={[styles.tabText, activeTab === 'admins' && styles.activeTabText]}>
              Admins
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'editors' && styles.activeTab]}
            onPress={() => setActiveTab('editors')}>
            <Text style={[styles.tabText, activeTab === 'editors' && styles.activeTabText]}>
              Editors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'viewers' && styles.activeTab]}
            onPress={() => setActiveTab('viewers')}>
            <Text style={[styles.tabText, activeTab === 'viewers' && styles.activeTabText]}>
              Viewers
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Team Members List */}
        <View style={styles.membersContainer}>
          {filteredMembers.map(member => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <View style={styles.avatarContainer}>
                  {member.avatar ? (
                    <Image source={{ uri: member.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.defaultAvatar}>
                      <Text style={styles.avatarInitial}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.memberDetails}>
                  <View style={styles.memberDetailsHeader}>
                    <View>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.optionsButton}
                      onPress={() => handleMemberOptions(member.id)}>
                      <DotsThreeOutlineVertical size={16} color={colors.gray[500]} weight="fill" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.memberActions}>
                <View
                  style={[
                    styles.roleBadge,
                    member.role === 'Admin' && styles.adminBadge,
                    member.role === 'Editor' && styles.editorBadge,
                    member.role === 'Viewer' && styles.viewerBadge,
                  ]}>
                  <Text
                    style={[
                      styles.roleText,
                      member.role === 'Admin' && styles.adminText,
                      member.role === 'Editor' && styles.editorText,
                      member.role === 'Viewer' && styles.viewerText,
                    ]}>
                    {member.role}
                  </Text>
                </View>
                <View style={styles.addedDateContainer}>
                  <Clock size={14} color={colors.text.muted} weight="regular" />
                  <Text style={styles.addedDateLabel}>Added {member.addedDate}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 80 }} />
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
  addButton: {
    backgroundColor: colors.orange[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    textAlign: 'left',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  activeCard: {
    backgroundColor: colors.green[50],
    borderColor: colors.green[100],
  },
  pendingCard: {
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[100],
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  activeTab: {
    backgroundColor: colors.orange[500],
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  membersContainer: {
    paddingHorizontal: spacing.md,
  },
  memberCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.blue[600],
  },
  memberDetails: {
    flex: 1,
  },
  memberDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  memberEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
  },
  adminBadge: {
    backgroundColor: colors.green[50],
  },
  editorBadge: {
    backgroundColor: colors.orange[50],
  },
  viewerBadge: {
    backgroundColor: colors.gray[100],
  },
  roleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  adminText: {
    color: colors.green[600],
  },
  editorText: {
    color: colors.orange[600],
  },
  viewerText: {
    color: colors.gray[600],
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  addedDateLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  optionsButton: {
    padding: spacing.xs,
  },
  floatingButtonContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  floatingButton: {
    paddingHorizontal: spacing.xl,
  },
});
