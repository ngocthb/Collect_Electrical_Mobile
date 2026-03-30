import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Linking,
} from 'react-native';

const homepage = require('../assets/images/homepage.png');

interface NewsItem {
  title: string;
  intro: string;
  link: string;
  image: string;
}

export default function NewsCarousel() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const flatListRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchNews = async () => {
    try {
      const res = await fetch(
        'https://kinhtedothi.vn/api/articles/search-article?site=kinhtedothi&page=1&fetch=10&freeWord=rác%20thải%20điện%20tử&portal=349',
      );

      const data = await res.json();

      const list = data.items.slice(0, 5).map((item: any) => ({
        title: item.title,
        intro: item.intro,
        link: `https://kinhtedothi.vn` + item.url,
        image: `https://resource.kinhtedothi.vn/` + item.thumbnail,
      }));

      setNewsList(list);
    } catch (e) {
      console.log('API error', e);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // AUTO SLIDE NEWS
  useEffect(() => {
    if (newsList.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % newsList.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, newsList]);

  if (newsList.length > 0) {
    return (
      <FlatList
        ref={flatListRef}
        data={newsList}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-4 mt-10 w-[330px]"
            onPress={() => {
              if (item.link) {
                Linking.openURL(item.link);
              }
            }}
          >
            <View className="rounded-2xl p-4 bg-primary-100 border border-gray-200">
              <View className="flex-row items-center">
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 100, height: 72 }}
                    className="mr-4"
                  />
                )}
                <View className="flex-1">
                  <Text
                    numberOfLines={2}
                    className="text-white text-sm font-bold"
                  >
                    {item.title}
                  </Text>
                  <Text numberOfLines={3} className="text-white text-xs mt-1">
                    {item.intro}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  }

  return (
    <View className="mb-4 mt-10">
      <View className="rounded-2xl p-4 bg-primary-100 border border-gray-200">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-white text-base font-bold">
              Công nghệ – xanh
            </Text>
            <Text className="text-white text-sm mt-1">
              Công nghệ cũ, giá trị mới. Tái chế điện tử an toàn – dễ dàng – bền
              vững.
            </Text>
          </View>
          <View>
            <Image
              source={homepage}
              style={{ width: 72, height: 72, borderRadius: 24 }}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
