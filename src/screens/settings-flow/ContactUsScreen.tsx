
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { View, Text, ImageBackground, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { theme } from '../../assets/theme';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import React from 'react';
import { SectionOptionsButton } from '../../components/SectionOptionsButton';
import ChevronRightIcon from '../../assets/icons/chevron-right.svg';
import { ProfileIconButton } from '../../components/ProfileIconButton';
import { Linking, Alert } from 'react-native';


const Icons = {
    notes: require('../../assets/icons/notes.png'),
    headphones: require('../../assets/icons/headphones.png'),
    preach: require('../../assets/icons/preach.png'),
};

type Props = NativeStackScreenProps<AppStackParamList, 'ContactUs'>;

export default function ContactUsScreen({ navigation, route }: Props) {

    // TODO:  Ensure that this works outside of Expo Go
    const handleEmailPress = async (type: 'feedback' | 'support' | 'partner') => {
        let email = '';
        let subject = '';

        switch (type) {
            case 'feedback':
                email = 'feedback@vokalapp.com';
                subject = 'App Feedback';
                break;
            case 'support':
                email = 'support@vokalapp.com';
                subject = 'Support Request';
                break;
            case 'partner':
                email = 'partnerships@vokalapp.com';
                subject = 'Partnership Inquiry';
                break;
        }

        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Unable to open email client');
            }
        } catch (error) {
            console.error('Error opening email client:', error);
            Alert.alert('Error', 'Unable to open email client');
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <ImageBackground
            source={require('../../assets/images/bg-bottom-gradient.png')}
            style={styles.background}>
            <View style={styles.container}>
                <View style={styles.topBarContainer}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, theme.textStyles.title1]}>Contact Us</Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <SectionOptionsButton
                        title="Provide Feedback"
                        image={Icons.notes}
                        icon={
                            <ProfileIconButton onPress={() => { }}>
                                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
                            </ProfileIconButton>
                        }
                        onPress={() => {
                            handleEmailPress('feedback');
                        }}
                    />
                    <SectionOptionsButton
                        title="Contact Support"
                        image={Icons.headphones}
                        icon={
                            <ProfileIconButton onPress={() => { }}>
                                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
                            </ProfileIconButton>
                        }
                        onPress={() => {
                            handleEmailPress('support');
                        }}
                    />
                    <SectionOptionsButton
                        title="Partner With Us"
                        image={Icons.preach}
                        icon={
                            <ProfileIconButton onPress={() => { }}>
                                <ChevronRightIcon width={24} height={24} fill={theme.colors.secondary_text} />
                            </ProfileIconButton>
                        }
                        onPress={() => {
                            handleEmailPress('partner');
                        }}
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    topBarContainer: {
        paddingTop: Platform.OS === 'android' ? 20 : 50,
        paddingBottom: 4,
        paddingHorizontal: 16,
        flexDirection: 'row',
        position: 'relative',
        alignItems: 'center',
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 11,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        top: 60,
        right: 0,
        textAlign: 'center',
    },
    buttonsContainer: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
});