import { View, Modal, ScrollView, Pressable, Platform, KeyboardAvoidingView, Keyboard,TouchableWithoutFeedback  } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { useState } from "react";
import ActionButton from "@/components/ui/ActionButton";
import SearchFilter from "@/components/ui/SearchFilter";

type Item = {
  id: number;
  title: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSearch: (text: string) => Promise<any>; // función que llama API
  onSelect: (item: Item) => void;
  existingItems?: Item[]; // para evitar duplicados
  label: string; // "Busca una película" / "Busca una serie"
};

export default function SearchModal({
  visible,
  onClose,
  onSearch,
  onSelect,
  existingItems = [],
  label
}: Props) {

  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    if (!text) return;

    setLoading(true);
    try {
      const res = await onSearch(text);

      // soporta ambos formatos:
      // { data: [...] } o [...]
      const data = res?.data ?? res ?? [];

      setResults(data);
    } catch (e) {
      console.log("Error buscando:", e);
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyAdded = (id: number) => {
    return existingItems.some(item => item?.id === id);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-dark"
      >
      <Modal visible={visible} animationType="fade" transparent>
        <View className="flex-1 bg-black/80 justify-center px-5">

          <View className="bg-chocolate p-4 rounded-2xl">

            {/* Cerrar */}
            <ActionButton
              variant="close"
              label="Cerrar"
              onPress={onClose}
            />

            {/* Buscador */}
            <SearchFilter
              label={label}
              placeholder="Escribe un título..."
              onSearch={handleSearch}
            />

            {/* Resultados */}
            <ScrollView className="mt-4 max-h-60">

              {loading && (
                <Text className="text-white text-center py-2">
                  Buscando...
                </Text>
              )}

              {!loading && results.length === 0 && (
                <Text className="text-white text-center py-2">
                  Sin resultados
                </Text>
              )}

              {results.map((item) => {
                const disabled = isAlreadyAdded(item.id);

                return (
                  <Pressable
                    key={item.id}
                    disabled={disabled}
                    className={`py-2 border-b ${
                      disabled ? "opacity-30" : "border-white/20"
                    }`}
                    onPress={() => {
                      if (disabled) return;

                      onSelect(item);
                      setResults([]);
                      onClose();
                    }}
                  >
                    <Text className="text-white">
                      {item.title} {disabled ? "(ya añadida)" : ""}
                    </Text>
                  </Pressable>
                );
              })}

            </ScrollView>

          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
  );
}