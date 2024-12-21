import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import MediaContent from './MediaContent';

interface ArticleCardProps {
  id: string;
  imageLink: string;
  heading: string;
  text?: string;
  showDescription?: boolean;
  handleCardPress: (id: string) => void;
}

export default function ArticleCard({
  id,
  imageLink,
  heading,
  text,
  handleCardPress,
  showDescription = false,
}: ArticleCardProps) {
  const router = useRouter();

  const onPress = () => {
    if (handleCardPress) {
      handleCardPress(id);
    } else {
      router.push(`/article/${id}`);
    }
  };

  return (
    <TouchableOpacity
      className="my-2 rounded-lg border border-gray-300 bg-white shadow-lg"
      onPress={onPress}>
      <MediaContent url={imageLink} />
      <Text className="px-4 py-2 text-center text-lg font-semibold">{heading}</Text>
      {showDescription && text && (
        <Text className="px-4 pb-4 text-gray-600" numberOfLines={2}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}
