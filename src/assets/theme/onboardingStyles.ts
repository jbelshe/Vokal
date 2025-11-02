import { StyleSheet } from 'react-native';
export const onboardingStyles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },  
    topContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 20, // Reduced from default
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        justifyContent: 'flex-end',
        marginBottom: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    onboardingImage: {
        width: '110%',
        height: '100%',
        maxHeight: '90%',
    },
    indicatorContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: -60,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});