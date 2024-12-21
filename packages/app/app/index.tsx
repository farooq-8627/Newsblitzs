import { Stack } from 'expo-router';
import { Container } from '@/components/Container';
import NewsFeed from '@/components/News';

export default function Home() {
  const handleBookmarkPress = () => {
    console.log('Bookmark toggled');
  };

  const handleSharePress = () => {
    console.log('Share pressed');
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        <NewsFeed />
      </Container>
    </>
  );
}
``;
