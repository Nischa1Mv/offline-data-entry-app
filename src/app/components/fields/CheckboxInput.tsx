import { Check } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface CheckboxInputProps {
  value?: number | boolean;
  onValueChange?: (value: number) => void;
  label?: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  value,
  onValueChange,
  label,
}) => {
  const { theme } = useTheme();
  const isChecked = value === 1 || value === true;

  const handleToggle = () => {
    if (onValueChange) {
      onValueChange(isChecked ? 0 : 1);
    }
  };

  return (
    <TouchableOpacity
      className="mt-2 flex-row items-center gap-3"
      onPress={handleToggle}
    >
      <View
        className="h-6 w-6 items-center justify-center rounded-full border-2"
        style={{
          borderColor: theme.border,
          backgroundColor: isChecked
            ? theme.buttonBackground
            : theme.background,
        }}
      >
        {isChecked && <Check size={16} color={theme.buttonText} />}
      </View>
      {label && (
        <Text className="font-sans text-sm font-medium leading-5 tracking-normal" style={{ color: theme.text }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CheckboxInput;
