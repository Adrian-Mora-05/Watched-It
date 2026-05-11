import { View, Pressable } from "react-native";
import { Text } from "@react-native-ama/react-native";

type Tab = {
  key: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  onChange: (tab: string) => void;
};

export default function MenuBar({ tabs, activeTab, onChange }: Props) {
  return (
    <View className=" rounded-2xl h-10 items-center flex-row gap-2 justify-around bg-bone">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className="px-1 py-1 " 
          >
            <Text
              className={`text-petit ${
                isActive ? "text-orange font-bold" : "text-dark font-semibold"
              }`}
            >
              {tab.label}
            </Text>

            <View
              className={`h-1 mt-1 rounded-full  ${
                isActive ? "bg-orange " : "bg-transparent" 
              }`}
            />
          </Pressable>
        );
      })}
    </View>
  );
}