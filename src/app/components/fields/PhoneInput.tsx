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


  // Helper to emit value only if both country code and phone number are present and valid
  const emitPhoneValue = (cc: string, pn: string) => {
    if (cc && pn && pn.length === 10) {
      onChangeText && onChangeText(`+${cc}-${pn}`);
    } else {
      onChangeText && onChangeText('');
    }
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

  // Combine flag, country code, and phone number in a single input box UI
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        placeholder="🇮🇳 +91 1234567890"
        placeholderTextColor={theme.subtext}
        keyboardType="phone-pad"
        value={`🇮🇳 +${countryCode} ${phoneNumber}`}
        onChangeText={text => {
          // Parse input: expect format like '🇮🇳 +91 1234567890'
          // Remove flag and split
          let cleaned = text.replace(/[^0-9+]/g, ' ');
          let parts = cleaned.trim().split(' ');
          let cc = '91';
          let pn = '';
          if (parts.length >= 2) {
            // Find country code
            cc = parts[0].replace('+', '') || '91';
            pn = parts.slice(1).join('').replace(/[^0-9]/g, '').slice(0, 10);
          } else if (parts.length === 1) {
            pn = parts[0].replace(/[^0-9]/g, '').slice(0, 10);
          }
          setCountryCode(cc);
          setPhoneNumber(pn);
          emitPhoneValue(cc, pn);
        }}
        maxLength={18}
        {...props}
      />
    </View>
  );
};

export default PhoneInput;
