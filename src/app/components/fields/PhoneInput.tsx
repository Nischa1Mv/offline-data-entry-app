import { ChevronDown } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    Modal,
    Platform,
    Pressable,
    TextInput as RNTextInput,
    ScrollView,
    Text,
    TextInputProps,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

interface PhoneInputProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

const countryCodes: CountryCode[] = [
  { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'SG', dial: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: 'MY', dial: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: 'NZ', dial: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'JP', dial: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: 'CN', dial: '+86', flag: '🇨🇳', name: 'China' },
  { code: 'KR', dial: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: 'MX', dial: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: 'ZA', dial: '+27', flag: '🇿🇦', name: 'South Africa' },
];

const PhoneInput: React.FC<PhoneInputProps> = ({
  className = "h-[40px] w-full rotate-0 rounded-md border pb-2.5 pl-3 pr-3 pt-2.5 opacity-100",
  value,
  onChangeText,
  ...props
}) => {
  const { theme } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track keyboard height
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Parse initial value if it exists
  React.useEffect(() => {
    if (value) {
      // Try to extract country code from value
      const country = countryCodes.find(c => value.startsWith(c.dial));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.dial.length).trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters
    const numeric = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numeric);
    
    // Combine country code and phone number
    const fullNumber = `${selectedCountry.dial} ${numeric}`;
    if (onChangeText) {
      onChangeText(fullNumber);
    }
  };
  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setModalVisible(false);
    setSearchQuery('');
    
    // Update full number with new country code
    if (phoneNumber) {
      const fullNumber = `${country.dial} ${phoneNumber}`;
      if (onChangeText) {
        onChangeText(fullNumber);
      }
    }
  };

  const filteredCountries = countryCodes.filter(
    country =>
      country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dial.includes(searchQuery)
  );

  return (
    <View>
      <View className="relative flex-row items-center">
        {/* Country Code Selector */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center justify-center gap-0.5 rounded-l-md border px-2"
          style={{
            height: 40,
            borderColor: theme.border,
            backgroundColor: theme.background,
          }}
        >
          <Text style={{ fontSize: 16 }}>{selectedCountry.flag}</Text>
          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '500', marginLeft: 2 }}>
            {selectedCountry.dial}
          </Text>
          <ChevronDown size={14} color={theme.text} />
        </TouchableOpacity>

        {/* Phone Number Input */}
        <RNTextInput
          className="flex-1"
          style={{
            height: 40,
            borderWidth: 1,
            borderLeftWidth: 0,
            borderTopRightRadius: 6,
            borderBottomRightRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderColor: theme.border,
            backgroundColor: theme.background,
            color: theme.text,
          }}
          placeholderTextColor={theme.subtext}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          {...props}
        />
      </View>

      {/* Country Code Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: theme.modalOverlay }}
          onPress={() => {
            Keyboard.dismiss();
            setModalVisible(false);
          }}
        >
          <Pressable 
            className="mt-auto rounded-t-3xl" 
            style={{ 
              backgroundColor: theme.background, 
              maxHeight: keyboardHeight > 0 ? `${100 - (keyboardHeight / 8)}%` : '70%',
              paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0
            }}
          >
            <View className="border-b px-4 py-4" style={{ borderBottomColor: theme.border }}>
              <Text className="mb-3 text-lg font-semibold" style={{ color: theme.text }}>
                Select Country Code
              </Text>
              {/* Search Bar */}
              <RNTextInput
                className="rounded-md border px-3 py-2"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.text,
                }}
                placeholder="Search country or code..."
                placeholderTextColor={theme.subtext}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <ScrollView 
              className="px-4 py-2"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    className="flex-row items-center gap-3 border-b py-3"
                    style={{ borderBottomColor: theme.border }}
                    onPress={() => handleCountrySelect(country)}
                  >
                    <Text style={{ fontSize: 22 }}>{country.flag}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-medium" style={{ color: theme.text }}>
                        {country.name}
                      </Text>
                      <Text className="text-xs" style={{ color: theme.subtext }}>
                        {country.code}
                      </Text>
                    </View>
                    <Text className="text-sm font-medium" style={{ color: theme.text }}>
                      {country.dial}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="py-8">
                  <Text className="text-center" style={{ color: theme.subtext }}>
                    No countries found
                  </Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PhoneInput;
