import WebView from 'react-native-webview';
import { View, Image } from 'react-native';

const isYouTubeUrl = (url: string) => {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
};

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const MediaContent = ({ url }: { url: string }) => {
  if (isYouTubeUrl(url)) {
    const embedUrl = getYouTubeEmbedUrl(url);
    return (
      <View className="h-60 w-full">
        <WebView
          source={{ uri: embedUrl || '' }}
          allowsFullscreenVideo
          style={{ flex: 1 }}
          className="rounded-t-md"
        />
      </View>
    );
  }

  return (
    <View className="h-60 w-full rounded-t-md">
      <Image source={{ uri: url }} className="h-60 w-full rounded-t-md" resizeMode="cover" />
    </View>
  );
};

export default MediaContent;
