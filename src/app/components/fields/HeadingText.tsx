import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface HeadingTextProps {
  label: string;
}

const HeadingText: React.FC<HeadingTextProps> = ({ label }) => {
  const { theme } = useTheme();

  return (
    <Text
      className="text-lg font-light leading-6"
      style={{ color: theme.text }}
    >
      {label}
    </Text>
  );
};

export default HeadingText;
