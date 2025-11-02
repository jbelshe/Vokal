import { View, Text, ImageBackground } from 'react-native';
import { onboardingStyles } from '../../../assets/theme/onboardingStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types/navigation';
import { Image } from 'react-native';
import { PageIndicator } from '../../../components/PageIndicator';
import { theme } from '../../../assets/theme';
import { PurpleButtonLarge } from '../../../components/PurpleButtonLarge';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding2'>;

const styles = onboardingStyles;

export default function Onboarding2({ navigation }: Props) {
    const handleNext = () => {
        navigation.navigate('Onboarding3');
    }
    return (
        <ImageBackground
                    source={require('../../../assets/images/bg-top-bottom-gradient.png')}
                    style={styles.background}>
                    <View style={styles.topContainer}>
                        <View style={styles.imageContainer}>
                            <Image
                              source={require('../../../assets/images/onboarding/onboarding_2.png')}
                              style={styles.onboardingImage}
                              resizeMode="contain"
                            />
                            </View>
                            <View style={styles.indicatorContainer}>
                                <PageIndicator 
                                    totalPages={4} 
                                    currentPage={1} 
                                    dotSize={10}
                                    dotSpacing={6}
                                />
                        </View>
                        <View style={styles.content}>
                            <Text style={[theme.textStyles.headline1, { textAlign: 'center' , marginTop: 16}]}>
                                Turn Empty Shops
                            </Text>                    
                            <Text style={[theme.textStyles.headline1, { textAlign: 'center' }]}>
                                Into What You Need
                            </Text>
                            <Text style={[theme.textStyles.body, { textAlign: 'center' , fontSize: 14, marginTop: 16, paddingHorizontal: 5}]}>
                                Your voice helps fill vacant spaces with
                            </Text>
                            <Text style={[theme.textStyles.body, { textAlign: 'center' , fontSize: 14, marginTop: 5, paddingHorizontal: 5}]}>
                               places you love — like cafés, gyms,
                            </Text>
                            <Text style={[theme.textStyles.body, { textAlign: 'center' , fontSize: 14, marginTop: 5, paddingHorizontal: 5}]}>
                              bookstores, and more.
                            </Text>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <PurpleButtonLarge title="Next" onPress={handleNext} />
                    </View>
                </ImageBackground>
    );
}
