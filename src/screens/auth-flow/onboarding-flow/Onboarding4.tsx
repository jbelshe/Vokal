import { View, Text, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types/navigation';
import { Image } from 'react-native';
import { PageIndicator } from '../../../components/PageIndicator';
import { theme } from '../../../assets/theme';
import { PurpleButtonLarge } from '../../../components/PurpleButtonLarge';
import { onboardingStyles } from '../../../assets/theme/onboardingStyles';
import { useAuth } from '../../../context/AuthContext';


type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding4'>;

const styles = onboardingStyles;

export default function Onboarding4({ navigation }: Props) {
    const { setIsOnboarding } = useAuth();

    const handleNext = () => {
        setIsOnboarding(false);
    }
    return (<
        ImageBackground
                source={require('../../../assets/images/bg-top-bottom-gradient.png')}
                style={styles.background}>
                <View style={styles.topContainer}>
                    <View style={styles.imageContainer}>
                        <Image
                          source={require('../../../assets/images/onboarding/onboarding_4.png')}
                          style={styles.onboardingImage}
                          resizeMode="contain"
                        />
                        </View>
                        <View style={styles.indicatorContainer}>
                            <PageIndicator 
                                totalPages={4} 
                                currentPage={3} 
                                dotSize={10}
                                dotSpacing={6}
                            />
                    </View>
                    <View style={styles.content}>
                        <Text style={[theme.textStyles.headline1, { textAlign: 'center' , marginTop: 16}]}>
                            Let's Build A Better
                        </Text>                    
                        <Text style={[theme.textStyles.headline1, { textAlign: 'center' }]}>
                            Neighborhood
                        </Text>      
                        <Text style={[theme.textStyles.headline1, { textAlign: 'center' }]}>
                            Together
                        </Text>
                        <Text style={[theme.textStyles.caption, { textAlign: 'center' , fontSize: 14, marginTop: 16}]}>
                            You dream it. The community supports it.
                        </Text>
                        <Text style={[theme.textStyles.caption, { textAlign: 'center', fontSize: 14, marginTop: 8}]}>
                            We'll make it real.
                        </Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <PurpleButtonLarge title="Get Started" onPress={handleNext} />
                </View>
            </ImageBackground>
    );
}