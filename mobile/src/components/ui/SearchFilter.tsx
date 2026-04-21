import { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Text } from '@react-native-ama/react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label: string;
  placeholder: string;
  onSearch: (value: string) => void;
};

export default function SearchFilter({ label, placeholder, onSearch }: Props) {
  const [value, setValue] = useState('');

  const handleChange = (text: string) => {
    setValue(text);
    onSearch(text);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <View className="px-3 py-2">
      <Text
        accessibilityRole="header"
        className="text-white text-normal mb-2"
      >
        {label}
      </Text>
      <View className="flex-row items-center bg-white/10 rounded-xl px-3 py-2">
        <Ionicons name="search" size={18} color="white" />
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.4)"
          className="flex-1 text-white ml-2"
          accessibilityLabel={label}
          accessibilityLanguage='es'
          accessibilityHint={`Escribe para filtrar por ${label.toLowerCase()}`}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color="white"
            onPress={handleClear}
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
          />
        )}
      </View>
    </View>
  );
}