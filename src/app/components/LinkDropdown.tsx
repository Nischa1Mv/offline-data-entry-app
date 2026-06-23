import axios from 'axios';
import { ChevronDown } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getLinkOptionsFromLocal, saveLinkOptionsToLocal } from '../../api';
import { useNetwork } from '../../context/NetworkProvider';
import { useTheme } from '../../context/ThemeContext';
import { EXPO_PUBLIC_BACKEND_URL } from '@env';
import { getIdToken } from '../../services/auth/tokenStorage';

type LinkDropdownProps = {
  doctype: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
  containerZIndex?: number;
  filterField?: string;
  filterValue?: string;
};

function normalizeOptions(raw: unknown): string[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) {
    list = (raw as any).data;
  }
  return list
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const candidate = obj.label ?? obj.value ?? obj.name ?? obj.title ?? obj.id ?? obj.key;
        if (typeof candidate === 'string') return candidate;
      }
      return undefined;
    })
    .filter((opt): opt is string => typeof opt === 'string' && opt.trim().length > 0)
    .map(opt => opt.trim());
}

const LinkDropdown: React.FC<LinkDropdownProps> = ({
  doctype,
  value,
  onValueChange,
  placeholder,
  isOpen,
  onToggle,
  containerZIndex,
  filterField,
  filterValue,
}) => {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const hasLoadedRef = useRef(false);

  const normalizedDoctype = useMemo(() => (doctype || '').trim(), [doctype]);


  const cacheKey = useMemo(
    () =>
      filterField && filterValue
        ? `${normalizedDoctype}:${filterField}:${filterValue}`
        : normalizedDoctype,
    [normalizedDoctype, filterField, filterValue]
  );

  // Reset when doctype changes
  useEffect(() => {
    hasLoadedRef.current = false;
    setAllOptions([]);
    setSearchTerm('');
  }, [normalizedDoctype]);

  // Reset when parent filter value changes
  useEffect(() => {
    hasLoadedRef.current = false;
    setAllOptions([]);
    setSearchTerm('');
  }, [filterValue]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return allOptions;
    const lower = searchTerm.trim().toLowerCase();
    return allOptions.filter(option => option.toLowerCase().includes(lower));
  }, [allOptions, searchTerm]);

  const displayOptions = useMemo(() => filteredOptions.slice(0, 20), [filteredOptions]);

  useEffect(() => {
    if (!isOpen) return;
    if (!normalizedDoctype) return;

    // Guard: parent field not yet selected
    if (filterField && !filterValue) return;

    if (hasLoadedRef.current && allOptions.length > 0) {
      setSearchTerm('');
      return;
    }

    let cancelled = false;

    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const cachedOptions = await getLinkOptionsFromLocal(cacheKey);
        if (cachedOptions && cachedOptions.length > 0) {
          if (!cancelled) {
            hasLoadedRef.current = true;
            setAllOptions(cachedOptions);
            setSearchTerm('');
            setLoading(false);
          }

          // Background refresh
          if (isConnected) {
            fetchFromApi(normalizedDoctype, filterField, filterValue)
              .then(opts => {
                if (opts.length > 0) {
                  saveLinkOptionsToLocal(cacheKey, opts);
                  if (!cancelled) setAllOptions(opts);
                }
              })
              .catch(err => console.warn('[LinkDropdown] failed to refresh options:', err));
          }
          return;
        }

        if (!isConnected) {
          if (!cancelled) {
            setError('No cached options available (offline)');
            setLoading(false);
          }
          return;
        }

        const opts = await fetchFromApi(normalizedDoctype, filterField, filterValue);
        if (!cancelled) {
          hasLoadedRef.current = true;
          setAllOptions(opts);
          setSearchTerm('');
          if (opts.length > 0) {
            await saveLinkOptionsToLocal(cacheKey, opts);
          }
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load options');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOptions();
    return () => { cancelled = true; };
  }, [isOpen, normalizedDoctype, cacheKey, allOptions.length, isConnected, filterField, filterValue]);

  const waitingForParent = filterField && !filterValue;

  return (
    <View style={{ zIndex: containerZIndex }}>
      <TouchableOpacity
        className="h-[44px] w-full flex-row items-center justify-between rounded-lg border-[1.5px] px-4"
        style={{ borderColor: theme.border, backgroundColor: theme.background }}
        onPress={onToggle}
      >
        <Text className="flex-1" style={{ color: value ? theme.text : theme.subtext }}>
          {value || placeholder}
        </Text>
        <ChevronDown
          size={18}
          color={theme.subtext}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

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
          {waitingForParent ? (
            <View className="px-4 py-6">
              <Text className="text-center text-sm" style={{ color: theme.subtext }}>
                Select {filterField} first
              </Text>
            </View>
          ) : loading ? (
            <View className="items-center justify-center px-4 py-6">
              <ActivityIndicator color={theme.subtext} />
            </View>
          ) : error ? (
            <View className="px-4 py-6">
              <Text className="text-center text-sm" style={{ color: theme.subtext }}>
                {error}
              </Text>
            </View>
          ) : (
            <>
              <View className="px-3 pt-3 pb-2">
                <TextInput
                  className="h-[42px] w-full rounded-lg border px-4"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    color: theme.text,
                    fontSize: 15,
                  }}
                  value={searchTerm}
                  onChangeText={text => setSearchTerm(text)}
                  placeholder={placeholder ? `Search ${placeholder}` : 'Search'}
                  placeholderTextColor={theme.subtext}
                />
              </View>
              <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 250 }}>
                {displayOptions.length > 0 ? (
                  displayOptions.map((option: string, optIndex: number) => {
                    const trimmedOption = (option || '').toString().trim();
                    const isSelected = value === trimmedOption;
                    return (
                      <TouchableOpacity
                        key={`${trimmedOption}-${optIndex}`}
                        className={`px-4 py-3.5 ${optIndex < displayOptions.length - 1 ? 'border-b' : ''}`}
                        style={{
                          backgroundColor: isSelected ? theme.dropdownSelectedBg : theme.dropdownBg,
                          borderBottomColor: optIndex < displayOptions.length - 1 ? theme.border : undefined,
                          borderBottomWidth: optIndex < displayOptions.length - 1 ? 0.5 : 0,
                        }}
                        onPress={() => onValueChange(trimmedOption)}
                      >
                        <Text style={{ color: theme.text, fontWeight: isSelected ? '600' : 'normal', fontSize: 15 }}>
                          {trimmedOption}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View className="px-4 py-6">
                    <Text className="text-center text-sm" style={{ color: theme.subtext }}>
                      No options available
                    </Text>
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      )}
    </View>
  );
};

async function fetchFromApi(
  doctype: string,
  filterField?: string,
  filterValue?: string,
): Promise<string[]> {
  const params: Record<string, string> = {};
  if (filterField && filterValue) {
    params.filter_field = filterField;
    params.filter_value = filterValue;
  }
  const url = `${EXPO_PUBLIC_BACKEND_URL}/link-options/${encodeURIComponent(doctype)}`;

  const doRequest = async (token: string | null) =>
    axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params,
      validateStatus: () => true, // don't throw on any status
    });

  let token = await getIdToken();
  let resp = await doRequest(token);

  if (resp.status === 401) {
    token = await getIdToken({ forceRefresh: true });
    resp = await doRequest(token);
  }

  if (resp.status !== 200) {
    throw new Error(`Failed to fetch link options: ${resp.status}`);
  }

  return normalizeOptions(resp.data?.data ?? resp.data);
}

export default LinkDropdown;
