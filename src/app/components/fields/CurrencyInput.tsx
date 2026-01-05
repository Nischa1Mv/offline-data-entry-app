import React, { useState } from 'react';
import { TextInput as RNTextInput, Text, TextInputProps, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface CurrencyInputProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const formatCurrency = (value: string): string => {
  // Remove all non-digit characters
  const numericValue = value.replace(/[^0-9]/g, '');
  
  if (!numericValue) return '';
  
  // Add commas for Indian number system (lakhs and crores)
  const number = parseInt(numericValue, 10);
  return number.toLocaleString('en-IN');
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  className = "h-[40px] w-full rotate-0 rounded-md border pb-2.5 pl-3 pr-3 pt-2.5 opacity-100",
  value,
  onChangeText,
  ...props
}) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState(formatCurrency(value || ''));

  const handleTextChange = (text: string) => {
    // Remove commas to get raw numeric value
    const rawValue = text.replace(/,/g, '');
    
    // Format for display
    const formatted = formatCurrency(rawValue);
    setDisplayValue(formatted);
    
    // Pass raw numeric value to parent
    if (onChangeText) {
      onChangeText(rawValue);
    }
  };

  // Update display value when prop value changes
  React.useEffect(() => {
    setDisplayValue(formatCurrency(value || ''));
  }, [value]);

  return (
    <View className="relative">
      <View className="absolute left-3 top-0 z-10 h-full justify-center">
        <Text style={{ color: theme.text, fontSize: 16 }}>₹</Text>
      </View>
      <RNTextInput
        className={className}
        style={{
          borderColor: theme.border,
          backgroundColor: theme.background,
          color: theme.text,
          paddingLeft: 28, // Extra padding for rupee symbol
        }}
        placeholderTextColor={theme.subtext}
        keyboardType="numeric"
        value={displayValue}
        onChangeText={handleTextChange}
        {...props}
      />
    </View>
  );
};

export default CurrencyInput;
