

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { View, Text, ImageBackground, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { theme } from '../../assets/theme';
import React, { useCallback, useEffect } from 'react';
import { fetchPropertiesForUser } from '../../api/properties';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import PropertyListCard from '@/components/PropertyListCard';
import { Property } from '@/types/property';



type Props = NativeStackScreenProps<AppStackParamList, 'VoteHistory'>;

export default function VoteHistoryScreen({ navigation, route }: Props) {

    const { state } = useAuth();
    const { setCurrProperty } = useAppContext();


    const PAGE_SIZE = 5;
    const [votes, setVotes] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [offset, setOffset] = React.useState(0);
    const [votedProperties, setVotedProperties] = React.useState<Property[]>([]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCardPress = useCallback((property: Property) => {
        console.log('Card pressed for property:', property.id);
        setCurrProperty(property);
        navigation.navigate('PropertyDetails', { propertyId: property.id });
        
    }, [navigation, setCurrProperty]);

    useEffect(() => {
        console.log('Fetching vote history...');
        fetchPropertiesForUser(state.profile?.userId!, 0, PAGE_SIZE)
            .then((properties) => {
                setVotedProperties(properties);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching vote history:', error);
                setLoading(false);
            });
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.topBarContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ChevronLeftIcon width={40} height={40} fill={theme.colors.primary_text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, theme.textStyles.title1]}>Voted Properties</Text>
            </View>
            <Text style={[theme.textStyles.title1, { marginLeft: 24, marginVertical: 12 }]}>All Properties</Text>
            {loading ? <ActivityIndicator size="large" color={theme.colors.primary_gradient_start} />
                :
                <ScrollView style={styles.listScrollView} contentContainerStyle={styles.listContent}>
                    {votedProperties.map((property) => (
                        <PropertyListCard
                            key={property.id}
                            property={property}
                            onPress={handleCardPress}
                        />
                    ))}
                </ScrollView>
            }

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface1,
    },
    topBarContainer: {
        paddingTop: Platform.OS === 'android' ? 20 : 50,
        paddingBottom: 4,
        paddingHorizontal: 16,
        marginBottom: 10,
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
    listScrollView: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
});