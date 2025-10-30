import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

type FontLoaderProps = {
  children: React.ReactNode;
};

export const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    'Montserrat': require('../../assets/fonts/Montserrat-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};
