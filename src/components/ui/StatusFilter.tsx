import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface StatusFilterOption {
  value: string;
  label: string;
  color: string;
}

interface StatusFilterProps {
  options: StatusFilterOption[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  options,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
      }}
    >
      {options.map(status => {
        const selected = selectedStatus === status.value;
        return (
          <TouchableOpacity
            key={status.value}
            onPress={() => onStatusChange(status.value)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: selected ? '#FFFFFF' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: selected ? '#000' : undefined,
              shadowOpacity: selected ? 0.05 : 0,
              shadowOffset: { width: 0, height: selected ? 2 : 0 },
              shadowRadius: selected ? 4 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                textAlign: 'center',
                color: selected ? '#3B82F6' : '#9CA3AF',
              }}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StatusFilter;
