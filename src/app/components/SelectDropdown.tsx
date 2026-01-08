import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SelectDropdownProps {
  options: string[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
  containerZIndex?: number;
  formData?: Record<string, any>;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  onValueChange,
  placeholder,
  isOpen,
  onToggle,
  containerZIndex,
}) => {
  const { theme } = useTheme();

  const containerStyle = {
    zIndex: containerZIndex,
  };

  const scrollViewStyle = {
    maxHeight: 250,
  };

  return (
    <View style={containerStyle}>
      {/* Dropdown Toggle Button */}
      <TouchableOpacity
        className="h-[44px] w-full flex-row items-center justify-between rounded-lg border-[1.5px] px-4"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.background,
        }}
        onPress={onToggle}
      >
        <Text
          className="flex-1"
          style={{
            color: value ? theme.text : theme.subtext,
          }}
        >
          {value || placeholder}
        </Text>

        <ChevronDown
          size={18}
          color={theme.subtext}
          style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
          }}
        />
      </TouchableOpacity>

      {/* Pushes content down when open */}
      {isOpen && (
        <View
          style={{
            marginTop: 8,
            backgroundColor: theme.dropdownBg,
            borderWidth: 1.5,
            borderColor: theme.border,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            maxHeight: 250,
            overflow: 'hidden',
          }}
        >
          <ScrollView nestedScrollEnabled={true} style={scrollViewStyle}>
            {options.length > 0 ? (
              options.map((option: string, optIndex: number) => {
                const trimmedOption = option.trim();
                const isSelected = value === trimmedOption;

                return (
                  <TouchableOpacity
                    key={optIndex}
                    className={`px-4 py-3.5 ${optIndex < options.length - 1 ? 'border-b' : ''}`}
                    style={{
                      backgroundColor: isSelected
                        ? theme.dropdownSelectedBg
                        : theme.dropdownBg,
                      borderBottomColor:
                        optIndex < options.length - 1 ? theme.border : undefined,
                      borderBottomWidth: optIndex < options.length - 1 ? 0.5 : 0,
                    }}
                    onPress={() => onValueChange(trimmedOption)}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: isSelected ? '600' : '400',
                        fontSize: 15,
                      }}
                    >
                      {trimmedOption}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="px-4 py-6">
                <Text
                  className="text-center text-sm"
                  style={{ color: theme.subtext }}
                >
                  No options available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default SelectDropdown;
