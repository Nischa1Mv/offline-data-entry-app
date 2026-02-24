import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps,
  View
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface PhoneInputProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}


const parsePhoneValue = (input?: string) => {
  // If value is already in +{countrycode}-{phonenumber} format, split it
  if (input && input.startsWith('+') && input.includes('-')) {
    const [country, number] = input.split('-');
    return {
      countryCode: country.replace('+', ''),
      phoneNumber: number || '',
    };
  }
  // If only 10 digits, treat as Indian number
  if (input && /^[0-9]{10}$/.test(input)) {
    return {
      countryCode: '91',
      phoneNumber: input,
    };
  }
  // Fallback
  return {
    countryCode: '91',
    phoneNumber: '',
  };
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  className = "h-[40px] w-full rotate-0 rounded-md border pb-2.5 pl-3 pr-3 pt-2.5 opacity-100",
  value,
  onChangeText,
  ...props
}) => {
  const { theme } = useTheme();
  // Parse value into country code and phone number
  const parsed = parsePhoneValue(value);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(parsed.phoneNumber);

  React.useEffect(() => {
    const parsed = parsePhoneValue(value);
    setCountryCode(parsed.countryCode);
    setPhoneNumber(parsed.phoneNumber);
  }, [value]);


  // Always emit in +{countrycode}-{phonenumber} format, even if incomplete
  const emitPhoneValue = (cc: string, pn: string) => {
    // Always emit in +{countrycode}-{phonenumber} format
    const formatted = `+${cc || ''}-${pn || ''}`;
    onChangeText && onChangeText(formatted);
  };

  const handlePhoneChange = (text: string) => {
    let numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length > 10) {
      numeric = numeric.slice(0, 10);
    }
    setPhoneNumber(numeric);
    emitPhoneValue(countryCode, numeric);
  };

  const handleCountryCodeChange = (text: string) => {
    let numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length > 4) {
      numeric = numeric.slice(0, 4);
    }
    setCountryCode(numeric);
    emitPhoneValue(numeric, phoneNumber);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 6, backgroundColor: theme.background, marginRight: 8, height: 40, paddingHorizontal: 8 }}>
        <RNTextInput
          style={{
            width: 28,
            color: theme.text,
            fontSize: 18,
            padding: 0,
            marginRight: 2,
            backgroundColor: 'transparent',
            textAlign: 'center',
          }}
          value={countryCode === '91' ? '🇮🇳' : ''}
          editable={false}
          pointerEvents="none"
        />
        <RNTextInput
          style={{
            width: 40,
            color: theme.text,
            fontSize: 16,
            padding: 0,
            backgroundColor: 'transparent',
            textAlign: 'left',
          }}
          placeholder="+91"
          placeholderTextColor={theme.subtext}
          keyboardType="number-pad"
          value={countryCode ? `+${countryCode}` : ''}
          onChangeText={text => {
            let numeric = text.replace(/[^0-9]/g, '');
            if (numeric.length > 4) numeric = numeric.slice(0, 4);
            setCountryCode(numeric);
            emitPhoneValue(numeric, phoneNumber);
          }}
          maxLength={5}
        />
      </View>
      <RNTextInput
        style={{
          flex: 1,
          height: 40,
          borderWidth: 1,
          borderRadius: 6,
          paddingHorizontal: 12,
          borderColor: theme.border,
          backgroundColor: theme.background,
          color: theme.text,
          fontSize: 16,
        }}
        placeholder="Phone number"
        placeholderTextColor={theme.subtext}
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={handlePhoneChange}
        maxLength={10}
        {...props}
      />
    </View>
  );
};

export default PhoneInput;
