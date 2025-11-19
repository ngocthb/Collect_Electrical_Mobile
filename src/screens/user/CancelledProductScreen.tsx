import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ImageModal from '../../components/ui/ImageModal';
import { getStatusBadgeClass } from '../../utils/status';
import { formatTimestamp } from '../../utils/dateUtils';
import SubLayout from '../../layout/SubLayout';

interface CancelledProductScreenProps {
  navigation: any;
  route: any;
}

const CancelledProductScreen: React.FC<CancelledProductScreenProps> = ({
  navigation,
  route,
}) => {
  const { product } = route.params || {};
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleModal = () => setModalVisible(!isModalVisible);
  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
    toggleModal();
  };

  const renderAttributesOrCondition = () => {
    if (product?.attributes && product.attributes.length > 0) {
      const attrs: any[] = product.attributes;
      const normalize = (s: string) => (s || '').toLowerCase();
      const findByName = (keywords: string[]) =>
        attrs.find(a =>
          keywords.some(k => normalize(a.attributeName).includes(k)),
        );

      const lengthAttr = findByName(['chiều dài', 'chiều dai', 'length']);
      const widthAttr = findByName(['chiều rộng', 'chiều rong', 'width']);
      const heightAttr = findByName(['chiều cao', 'height']);

      const parseUnitFromName = (name?: string) => {
        if (!name) return '';
        const m = name.match(/\(([^)]+)\)/);
        return m && m[1] ? m[1].trim() : '';
      };

      const otherAttrs = attrs.filter(
        a => ![lengthAttr, widthAttr, heightAttr].includes(a),
      );

      const canRenderBox = lengthAttr && widthAttr && heightAttr;
      const unit =
        (lengthAttr && lengthAttr.unit) ||
        (widthAttr && widthAttr.unit) ||
        (heightAttr && heightAttr.unit) ||
        parseUnitFromName(lengthAttr?.attributeName) ||
        parseUnitFromName(widthAttr?.attributeName) ||
        parseUnitFromName(heightAttr?.attributeName) ||
        '';

      return (
        <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Thông số kỹ thuật
          </Text>
          {canRenderBox ? (
            <View className="flex-row justify-between py-2  ">
              <Text className="text-gray-600">
                Kích thước ({unit ? ` ${unit}` : ''})
              </Text>
              <Text className="text-gray-900 font-medium">
                {`${lengthAttr.value} x ${widthAttr.value} x ${heightAttr.value}`}
                {` (d x r x c)`}
              </Text>
            </View>
          ) : null}

          {otherAttrs.map((attr: any, index: number) => (
            <View key={index} className="flex-row justify-between py-2">
              <Text className="text-gray-600">{attr.attributeName}</Text>
              <Text className="text-gray-900 font-medium">
                {attr.value} {attr.unit || ''}
              </Text>
            </View>
          ))}
        </View>
      );
    } else if (product?.sizeTierName) {
      return (
        <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Kích thước
          </Text>
          <Text className="text-gray-900">{product.sizeTierName}</Text>
        </View>
      );
    }
    return null;
  };

  if (!product) {
    return (
      <SubLayout
        title="Sản phẩm hủy bỏ"
        onBackPress={() => navigation.goBack()}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">
            Không tìm thấy thông tin sản phẩm
          </Text>
        </View>
      </SubLayout>
    );
  }

  return (
    <SubLayout title="Sản phẩm hủy bỏ" onBackPress={() => navigation.goBack()}>
      <ScrollView className="flex-1">
        <View className="px-5">
          <View className="bg-white rounded-3xl shadow-md mb-5 p-6">
            {/* thumbnails */}
            {product.productImages && product.productImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="space-x-3"
              >
                {product.productImages.map((img: string, i: number) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleImagePress(img)}
                  >
                    <Image
                      source={img ? { uri: img } : undefined}
                      style={{
                        width: 84,
                        height: 84,
                        borderRadius: 12,
                        marginRight: 12,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View className="space-y-4 mt-2">
              <Text className="text-lg font-bold text-gray-800">
                Thông tin sản phẩm
              </Text>

              <View className="flex-row justify-between">
                <View className="mb-3">
                  <Text className="text-sm text-gray-500 mb-1">Danh mục</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {product.categoryName || 'N/A'}
                  </Text>
                </View>

                <View className="mb-3">
                  <Text className="text-sm text-gray-500 mb-1">
                    Thương hiệu
                  </Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {product.brandName || 'N/A'}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <View className="mb-3">
                  <Text className="text-sm text-gray-500 mb-1">Mô tả</Text>
                  <Text className="text-base text-gray-700">
                    {product.description || 'Không có mô tả'}
                  </Text>
                </View>
                {product.estimatePoint && (
                  <View>
                    <Text className="text-sm text-gray-500 mb-1">
                      Điểm ước tính
                    </Text>
                    <Text className="text-base font-semibold text-green-600">
                      {product.estimatePoint} 🪙
                    </Text>
                  </View>
                )}
              </View>

              <View className="mb-3">
                <Text className="text-sm text-gray-500 mb-1">Kích thước</Text>
                <Text className="text-base font-semibold text-gray-800">
                  {product.sizeTierName || 'N/A'}
                </Text>
              </View>
            </View>

            {renderAttributesOrCondition()}
          </View>

          {/* Cancellation Notice */}
          <View className="bg-red-50 rounded-xl p-4 border border-red-200">
            <Text className="text-sm text-red-800 font-semibold mb-2">
              ⚠️ Sản phẩm đã bị hủy bỏ
            </Text>
            <Text className="text-sm text-red-700">
              Sản phẩm này đã bị hủy bỏ và không thể tiếp tục xử lý. Vui lòng
              liên hệ hỗ trợ nếu có thắc mắc.
            </Text>
          </View>
          <ImageModal
            visible={isModalVisible}
            imageUri={selectedImage}
            onClose={toggleModal}
          />
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default CancelledProductScreen;
