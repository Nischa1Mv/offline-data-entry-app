import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface SectionBreakProps {
  label?: string;
}

const SectionBreak: React.FC<SectionBreakProps> = ({ label }) => {
  const { theme } = useTheme();

  return (
    <View className="mb-2 mt-4">
      <View
        className="mb-2 h-px w-full"
        style={{ backgroundColor: theme.border }}
      />
      {label && (
        <Text
          className="text-lg font-medium leading-6"
          style={{ color: theme.text }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

export default SectionBreak;
