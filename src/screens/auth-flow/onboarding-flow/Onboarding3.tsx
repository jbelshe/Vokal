import { View, Text, ImageBackground } from 'react-native';
import { onboardingStyles } from '../../../assets/theme/onboardingStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types/navigation';
import { Image } from 'react-native';
import { PageIndicator } from '../../../components/PageIndicator';
import { theme } from '../../../assets/theme';
import { PurpleButtonLarge } from '../../../components/PurpleButtonLarge';


type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding3'>;

const styles = onboardingStyles;

export default function Onboarding3({ navigation }: Props) {
    const handleNext = () => {
        navigation.navigate('Onboarding4');
    }
    return (
        <ImageBackground
            source={require('../../../assets/images/bg-top-bottom-gradient.png')}
            style={styles.background}>
            <View style={styles.topContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../../../assets/images/onboarding/onboarding_3.png')}
                        style={styles.onboardingImage}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.indicatorContainer}>
                    <PageIndicator
                        totalPages={4}
                        currentPage={2}
                        dotSize={10}
                        dotSpacing={6}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={[theme.textStyles.headline1, { textAlign: 'center', marginTop: 16 }]}>
                        Drop A Pin.  Share
                    </Text>
                    <Text style={[theme.textStyles.headline1, { textAlign: 'center' }]}>
                        An Idea
                    </Text>
                    <Text style={[theme.textStyles.body, { textAlign: 'center', fontSize: 14, marginTop: 16 }]}>
                        Tap a vacant spot on the map, suggest what
                    </Text>
                    <Text style={[theme.textStyles.body, { textAlign: 'center', fontSize: 14, marginTop: 5 }]}>
                        you want, and see it shape your block's future.
                    </Text>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <PurpleButtonLarge title="Next" onPress={handleNext} />
            </View>
        </ImageBackground>
    );
}

