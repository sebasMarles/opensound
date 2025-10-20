import { memo } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import Text from "@/ui/atoms/Text";

export type TagOption = {
  label: string;
  query: string;
};

type Props = {
  tags: TagOption[];
  onSelect: (tag: TagOption) => void;
};

// Barra horizontal de etiquetas que permite aplicar filtros rápidos.
function TagFilterComponent({ tags, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6"
      contentContainerStyle={{ paddingHorizontal: 4 }}
    >
      {tags.map((tag) => (
        <TouchableOpacity
          key={tag.query}
          className="bg-purple-700 px-4 py-2 rounded-full mr-3"
          onPress={() => onSelect(tag)}
          accessibilityRole="button"
          accessibilityLabel={`Filtrar por ${tag.label}`}
        >
          <Text className="text-white text-sm font-semibold">{tag.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export const TagFilter = memo(TagFilterComponent);
