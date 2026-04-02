import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  Modal,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';
import AppAvatar from '../../components/ui/AppAvatar';
import { getLeaderboard, getMyRank } from '../../services/leaderboardService';
import { LeaderboardItem } from '../../types/LeaderboardItem';
import { useAppSelector } from '../../store/hooks';
const cup = require('../../assets/images/cup.png');
type MyRank = {
  userId: string;
  currentRankName: string;
  currentCo2: number;
  nextRankName: string;
  co2ToNextRank: number;
  rankIcon?: string;
};

export default function LeaderboardScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [showCo2Info, setShowCo2Info] = useState(false);

  const sortedData = useMemo(
    () => [...leaderboardData].sort((a, b) => a.rankPosition - b.rankPosition),
    [leaderboardData],
  );
  const topThree = sortedData.slice(0, 3);
  const remainingUsers = sortedData.slice(3);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const userId = user?.userId;
      const [leaderboardRes, myRankRes] = await Promise.all([
        getLeaderboard(),
        userId ? getMyRank(userId) : Promise.resolve(null),
      ]);

      const res = leaderboardRes;
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const myRankData = myRankRes ? myRankRes?.data ?? myRankRes : null;

      setLeaderboardData(list);
      setMyRank(myRankData);
    } catch (error) {
      console.warn('[Leaderboard] Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
  };

  const renderEmptyList = () => {
    if (loading) return null;

    return (
      <View className="py-8 items-center ">
        <Icon name="award" size={48} color="#6B7280" />
        <Text className="text-gray-500">Chưa có dữ liệu bảng xếp hạng</Text>
      </View>
    );
  };

  useEffect(() => {
    loadLeaderboard();
  }, [user?.userId]);

  return (
    <SubLayout
      title="Bảng xếp hạng"
      onBackPress={() => navigation.goBack()}
      noScroll
      rightComponent={
        <TouchableOpacity
          className="mr-4 items-center justify-center"
          onPress={() => setShowCo2Info(true)}
          activeOpacity={0.8}
        >
          <Icon name="info" size={20} color="#e85a4f" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-background-50">
        <FlatList
          className="flex-1 px-4"
          data={remainingUsers}
          keyExtractor={item => item.userId}
          renderItem={({ item }) => (
            <View className="bg-white border border-red-100 rounded-xl p-4 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-7 h-7 rounded-full bg-primary-100 items-center justify-center mr-2">
                  <Text className="text-white text-xs font-bold">
                    {item.rankPosition}
                  </Text>
                </View>
                <AppAvatar name={item.userName} uri={item.avatar} size={32} />
                <Text className="text-text-main font-semibold flex-1">
                  {'  '}
                  {item.userName}
                </Text>
              </View>

              <Text className="text-primary-100 font-bold">
                {item.totalCo2Saved?.toLocaleString()} kg CO₂
              </Text>
            </View>
          )}
          ListHeaderComponent={
            <>
              {loading ? (
                <View className="py-10 items-center justify-center">
                  <ActivityIndicator size="large" color="#e85a4f" />
                </View>
              ) : null}

              {sortedData.length > 0 ? (
                <View className="bg-primary-100 border-2 border-red-200 rounded-2xl p-4 mt-2 mb-4">
                  <Text className="text-white text-lg font-bold text-center mb-4">
                    Top 3 đóng góp nhiều nhất
                  </Text>

                  <View className="flex-row justify-between items-end">
                    {topThree[1] ? (
                      <View className="w-[31%] items-center bg-white/20 rounded-xl py-3 px-2">
                        <View className="mt-2 mb-1">
                          <AppAvatar
                            name={topThree[1].userName}
                            uri={topThree[1].avatar}
                            size={44}
                          />
                        </View>
                        <Text className="text-white font-semibold mt-2 text-center">
                          {topThree[1].userName}
                        </Text>
                        <Text className="text-white/90 text-xs mt-1">#2</Text>
                        <Text className="text-white font-bold mt-1">
                          {topThree[1].totalCo2Saved?.toLocaleString()}
                        </Text>
                      </View>
                    ) : null}

                    {topThree[0] ? (
                      <View className="w-[33%] items-center bg-white/25 rounded-xl py-4 px-2 -mt-3">
                        <View className="mt-2 mb-1">
                          <AppAvatar
                            name={topThree[0].userName}
                            uri={topThree[0].avatar}
                            size={48}
                          />
                        </View>
                        <Text className="text-white font-bold mt-2 text-center">
                          {topThree[0].userName}
                        </Text>
                        <Text className="text-white text-xs mt-1">#1</Text>
                        <Text className="text-white font-extrabold mt-1">
                          {topThree[0].totalCo2Saved?.toLocaleString()}
                        </Text>
                      </View>
                    ) : null}

                    {topThree[2] ? (
                      <View className="w-[31%] items-center bg-white/20 rounded-xl py-3 px-2">
                        <View className="mt-2 mb-1">
                          <AppAvatar
                            name={topThree[2].userName}
                            uri={topThree[2].avatar}
                            size={44}
                          />
                        </View>
                        <Text className="text-white font-semibold mt-2 text-center">
                          {topThree[2].userName}
                        </Text>
                        <Text className="text-white/90 text-xs mt-1">#3</Text>
                        <Text className="text-white font-bold mt-1">
                          {topThree[2].totalCo2Saved?.toLocaleString()}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <View className="mb-6">
                <Text className="text-base font-bold text-text-main mb-3">
                  Danh sách xếp hạng
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#e85a4f"
            />
          }
          contentContainerStyle={{ paddingBottom: myRank ? 12 : 24 }}
        />

        {myRank ? (
          <View className="px-4 pb-4 pt-2 bg-background-50 ">
            <View className="bg-white border-2 border-primary-100 rounded-2xl p-4">
              <View className="flex-row items-center">
                <View className="flex-row items-center flex-1 pr-3">
                  <AppAvatar
                    name={user?.name || 'Bạn'}
                    uri={user?.avatar ?? null}
                    size={50}
                  />
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-text-main font-semibold"
                      numberOfLines={1}
                    >
                      {user?.name || 'Bạn'}
                    </Text>

                    <Text className="text-gray-500 text-xs mt-1">
                      Còn {myRank.co2ToNextRank?.toLocaleString()} kg CO₂ để lên
                      hạng {myRank.nextRankName}
                    </Text>

                    <Text className="text-primary-100 font-bold text-sm mt-2">
                      {myRank.currentCo2?.toLocaleString()} kg CO₂
                    </Text>
                  </View>
                </View>

                <View className="items-center justify-center w-[74px]">
                  {myRank.rankIcon ? (
                    <Image
                      source={myRank?.rankIcon ? { uri: myRank.rankIcon } : cup}
                      className="w-[64px] h-[64px]"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-[64px] h-[64px] rounded-full bg-primary-100/15 border border-primary-100 items-center justify-center px-1">
                      <Text
                        className="text-primary-100 font-bold text-[10px] text-center"
                        numberOfLines={2}
                      >
                        {myRank.currentRankName}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <Modal
          visible={showCo2Info}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCo2Info(false)}
        >
          <View className="flex-1 bg-black/45 justify-center px-5">
            <View className="bg-white rounded-2xl p-5 border border-red-100">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-text-main text-base font-bold">
                  Thông tin CO₂
                </Text>
                <TouchableOpacity onPress={() => setShowCo2Info(false)}>
                  <Icon name="x" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-600 text-sm leading-5 mb-2">
                Chỉ số trên bảng xếp hạng là tổng lượng rác thải điện tử bạn đã
                giúp tái chế thông qua các hoạt động thu gom và xử lý thiết bị
                điện tử trong hệ thống.
              </Text>

              <Text className="text-text-main font-semibold text-sm mt-2 mb-1">
                Cách tính tổng quát
              </Text>

              <Text className="text-gray-600 text-sm leading-5 mb-1">
                CO₂ giảm = Khối lượng thiết bị tái chế (kg) x Hệ số phát thải
                tránh được (kg CO₂/kg)
              </Text>

              <TouchableOpacity
                onPress={() => setShowCo2Info(false)}
                className="mt-4 bg-primary-100 rounded-xl py-3"
                activeOpacity={0.9}
              >
                <Text className="text-white text-center font-semibold">
                  Đã hiểu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SubLayout>
  );
}
