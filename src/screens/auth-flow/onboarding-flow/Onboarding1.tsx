import { View, Image, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../types/navigation';
import { ImageBackground } from 'react-native';
import { PurpleButtonLarge } from '../../../components/PurpleButtonLarge';
import { PageIndicator } from '../../../components/PageIndicator';
import { theme } from '../../../assets/theme';
import { onboardingStyles } from '../../../assets/theme/onboardingStyles';


type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding1'>;

const styles = onboardingStyles;

export default function Onboarding1({ navigation }: Props) {

    const handleNext = () => {
        navigation.navigate('Onboarding2');
    }
    
    return (
        <ImageBackground
            source={require('../../../assets/images/bg-top-bottom-gradient.png')}
            style={styles.background}>
            <View style={styles.topContainer}>
                <View style={styles.imageContainer}>
                    <Image
                      source={require('../../../assets/images/onboarding/onboarding_1.png')}
                      style={styles.onboardingImage}
                      resizeMode="contain"
                    />
                    </View>
                    <View style={styles.indicatorContainer}>
                        <PageIndicator 
                            totalPages={4} 
                            currentPage={0} 
                            dotSize={10}
                            dotSpacing={6}
                        />
                </View>
                <View style={styles.content}>
                    <Text style={[theme.textStyles.headline1, { textAlign: 'center' , marginTop: 16}]}>
                        Have A Say In What
                    </Text>                    
                    <Text style={[theme.textStyles.headline1, { textAlign: 'center' }]}>
                        Opens Next
                    </Text>
                    <Text style={[theme.textStyles.body, { textAlign: 'center' , fontSize: 14, marginTop: 16}]}>
                        Vote on the businesses you want to see
                    </Text>
                    <Text style={[theme.textStyles.body, { textAlign: 'center' , fontSize: 14, marginTop: 5}]}>
                        in your neighborhood.
                    </Text>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <PurpleButtonLarge title="Next" onPress={handleNext} />
            </View>
        </ImageBackground>
    );
}

