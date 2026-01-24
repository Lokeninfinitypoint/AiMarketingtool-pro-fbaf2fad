import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { useToolsStore, TOOL_CATEGORIES } from '../../store/toolsStore';
import { Colors, Gradients, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import AnimatedBackground from '../../components/common/AnimatedBackground';

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, profile } = useAuthStore();
  const { tools, featuredTools, fetchTools, isLoading } = useToolsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTools();
    setRefreshing(false);
  };

  const stats = [
    { label: 'AI Tools', value: '186+', icon: 'zap', color: Colors.secondary, badge: '+12 new' },
    { label: 'Generations', value: '∞', icon: 'layers', color: Colors.success, badge: 'Unlimited' },
    { label: 'Campaigns', value: '—', icon: 'target', color: Colors.accent, badge: 'Connect' },
    { label: 'Success', value: '98%', icon: 'trending-up', color: Colors.gold, badge: '+5%' },
  ];

  const quickActions = [
    { label: 'AI Chat', icon: 'message-circle', color: Colors.accent, screen: 'Chat' },
    { label: 'Meme Gen', icon: 'smile', color: Colors.secondary, screen: 'MemeGenerator' },
    { label: 'All Tools', icon: 'grid', color: Colors.success, screen: 'Tools' },
    { label: 'Reports', icon: 'bar-chart-2', color: Colors.gold, screen: 'History' },
  ];

  const popularTools = [
    { name: 'AI Ad Generator', uses: '12.5k', icon: 'zap', trending: true },
    { name: 'Blog Writer', uses: '8.3k', icon: 'file-text', trending: true },
    { name: 'Social Caption', uses: '6.7k', icon: 'message-circle', trending: false },
    { name: 'Email Subject', uses: '5.2k', icon: 'mail', trending: false },
    { name: 'Product Description', uses: '4.8k', icon: 'shopping-bag', trending: false },
    { name: 'Video Script', uses: '3.9k', icon: 'video', trending: false },
  ];

  return (
    <AnimatedBackground variant="dashboard" showParticles={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[Colors.secondary, Colors.accent]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'User'}</Text>
                <Text style={styles.subGreeting}>Welcome back</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Feather name="bell" size={22} color={Colors.white} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Banner */}
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('Subscription')}
        >
          <LinearGradient
            colors={['#3D2914', '#16132B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumContent}>
              <View style={styles.premiumIcon}>
                <Feather name="star" size={20} color={Colors.gold} />
              </View>
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Upgrade to Pro</Text>
                <Text style={styles.premiumSubtitle}>Unlock all AI tools & features</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color={Colors.gold} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionBtn}
                onPress={() => {
                  if (action.screen === 'MemeGenerator') {
                    navigation.navigate('MemeGenerator');
                  } else if (action.screen === 'Chat' || action.screen === 'Tools' || action.screen === 'History') {
                    navigation.navigate('Main', { screen: action.screen === 'Chat' ? 'Chat' : action.screen === 'Tools' ? 'Tools' : 'History' } as any);
                  }
                }}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <Feather name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tool Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Tools' } as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {TOOL_CATEGORIES.slice(0, 6).map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Main', { screen: 'Tools' } as any)}
              >
                <LinearGradient
                  colors={[Colors.card, Colors.surfaceLight]}
                  style={styles.categoryGradient}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: Colors.secondary + '15' }]}>
                    <Feather name={category.icon as any} size={22} color={Colors.secondary} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>{category.count} tools</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Tools */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Tools</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Tools' } as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.popularList}>
            {popularTools.map((tool, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.popularItem,
                  index === popularTools.length - 1 && styles.popularItemLast
                ]}
                onPress={() => navigation.navigate('ToolDetail', { toolSlug: tool.name.toLowerCase().replace(/ /g, '-') })}
              >
                <View style={styles.popularInfo}>
                  <View style={[styles.popularIcon, { backgroundColor: Colors.secondary + '15' }]}>
                    <Feather name={tool.icon as any} size={18} color={Colors.secondary} />
                  </View>
                  <View>
                    <View style={styles.popularNameRow}>
                      <Text style={styles.popularName}>{tool.name}</Text>
                      {tool.trending && (
                        <View style={styles.trendingBadge}>
                          <Feather name="trending-up" size={10} color={Colors.success} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.popularUsesText}>{tool.uses} uses</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  premiumBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 151, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.sm * 3) / 4,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionBtn: {
    alignItems: 'center',
    width: (width - Spacing.lg * 2 - Spacing.md * 3) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoriesScroll: {
    paddingRight: Spacing.lg,
  },
  categoryCard: {
    width: 140,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: Spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  popularList: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popularItemLast: {
    borderBottomWidth: 0,
  },
  popularInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  popularNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.white,
  },
  trendingBadge: {
    marginLeft: Spacing.xs,
    padding: 2,
    backgroundColor: Colors.success + '20',
    borderRadius: 4,
  },
  popularUsesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
