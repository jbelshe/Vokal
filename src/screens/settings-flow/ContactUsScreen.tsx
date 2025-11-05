
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { View, Text, ImageBackground, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { theme } from '../../assets/theme';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import React from 'react';

type Props = NativeStackScreenProps<AppStackParamList, 'ContactUs'>;

export default function ContactUsScreen({ navigation, route }: Props) {

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
                    <Text style={[styles.headerTitle, theme.textStyles.title1]}>Profile</Text>
                </View>




                <Text>Contact Us Screen</Text>
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
});