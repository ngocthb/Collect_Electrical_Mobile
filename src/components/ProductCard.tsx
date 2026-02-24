import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { getStatusLabel, getStatusBgClass } from '../utils/productHelper';

interface ProductCardProps {
  product: any;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const renderProductStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const label = getStatusLabel(status);
    const bgClass = getStatusBgClass(status);

    return (
      <View className={`${bgClass} px-2 py-1 rounded-lg`}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text className="text-white text-[10px] font-semibold">{label}</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      className="flex-row items-center bg-white border-2 border-red-200 rounded-xl p-3 mb-3 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View className="w-16 h-16 rounded-lg overflow-hidden bg-red-200">
        <Image
          source={{ uri: product.productImages?.[0] }}
          style={{ width: 64, height: 64 }}
          resizeMode="cover"
        />
        <Text>{product.productImages?.[0] ? '✅' : '❌'}</Text>
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-semibold text-primary-100 mb-1"
          numberOfLines={1}
        >
          {product.categoryName} • {product.brandName}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={2}>
          {product.description}
        </Text>
        <Text className="text-xs text-gray-400 mt-1">
          {product.sizeTierName}
        </Text>
      </View>

      {/* Status Badge */}
      <View className="ml-2">{renderProductStatusBadge(product.status)}</View>
    </TouchableOpacity>
  );
}
