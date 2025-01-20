import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import MediaContent from './MediaContent';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme } = useTheme();
  const onPress = () => {
    if (handleCardPress) {
      handleCardPress(id);
    } else {
      router.push(`/article/${id}`);
    }
  };

  return (
    <TouchableOpacity
      className="my-2 rounded-lg border shadow-lg"
      style={{ backgroundColor: theme.bgColor, borderColor: theme.cardBorderColor }}
      onPress={onPress}>
      <MediaContent url={imageLink} />
      <Text className="px-4 py-2 text-center text-lg font-semibold" style={{ color: theme.headingColor }}>
        {heading}
      </Text>
      {showDescription && text && (
        <Text className="px-4 pb-4" numberOfLines={2} style={{ color: theme.textColor }}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}
