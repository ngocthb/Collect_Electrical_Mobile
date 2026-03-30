import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { getStatusLabel, getStatusBgClass } from '../utils/productHelper';
import { formatDate } from '../utils/dateUtils';
interface ProductCardProps {
  product: any;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const renderProductStatusBadge = (status?: string | null) => {
    if (!status) return null;

    return (
      <View
        className={`${getStatusBgClass(
          status,
        )} w-20 h-7 rounded-lg items-center justify-center`}
      >
        <Text className="text-white text-[10px] font-semibold text-center">
          {getStatusLabel(status)}
        </Text>
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
        {product?.pickUpDate && (
          <Text className="text-xs text-gray-400 mt-1">
            Ngày thu gom: {formatDate(product.pickUpDate)}
          </Text>
        )}
      </View>

      {/* Status Badge */}
      <View className="ml-2">{renderProductStatusBadge(product.status)}</View>
    </TouchableOpacity>
  );
}
