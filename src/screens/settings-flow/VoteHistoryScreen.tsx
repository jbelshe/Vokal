

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types/navigation';
import { View, Text, ImageBackground, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg';
import { theme } from '../../assets/theme';
import React, { useCallback, useEffect } from 'react';
import { fetchPropertiesForUser } from '../../api/properties';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import PropertyListCard from '@/components/PropertyListCard';
import { Property } from '@/types/property';



type Props = NativeStackScreenProps<AppStackParamList, 'VoteHistory'>;

export default React.memo(function VoteHistoryScreen({ navigation, route }: Props) {

    const { state } = useAuth();
    const { setCurrProperty } = useAppContext();


    const PAGE_SIZE = -1;
    const [loading, setLoading] = React.useState(true);
    const [areMoreVotes, setAreMoreVotes] = React.useState(true);
    const [votedProperties, setVotedProperties] = React.useState<Property[]>([]);

    

    // const handleBack = () => {
    //     navigation.goBack();
    // };
    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const handleCardPress = useCallback((property: Property) => {
        console.log('Card pressed for property:', property.id);
        setCurrProperty(property);
        navigation.navigate('PropertyDetails', { propertyId: property.id });
        
    }, [navigation, setCurrProperty]);


    const handleLoadMore = useCallback(async () => {
        if (loading || !areMoreVotes) {
            console.log("Cannot load more: loading=", loading, "areMoreVotes=", areMoreVotes);
            return;
        }
        
        setLoading(true);
        try {
            const nextPage = Math.ceil(votedProperties.length / PAGE_SIZE);
            const newProperties = await fetchPropertiesForUser(
                state.profile?.userId!,
                nextPage * PAGE_SIZE,
                PAGE_SIZE
            );
            
            setVotedProperties(prev => {
            const updated = [...prev, ...newProperties];
            if (newProperties.length < PAGE_SIZE) {
                setAreMoreVotes(false);
            }
            return updated;
            });
        } catch (error) {
            console.error('Error loading more properties:', error);
        } finally {
            setLoading(false);
        }
    }, [votedProperties.length, loading, areMoreVotes, state.profile?.userId]);


    const renderItem = useCallback(({ item }: { item: Property }) => {
        return (<PropertyListCard
            property={item}
            onPress={handleCardPress}
        />
    );
    }, [handleCardPress]);

    useEffect(() => {
        console.log('VoteHistoryScreen rendered');
    });

    useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
        try {
            const properties = await fetchPropertiesForUser(state.profile?.userId!, 0, PAGE_SIZE);
            if (isMounted) {
                setVotedProperties(properties);
                setAreMoreVotes(properties.length === PAGE_SIZE);
            }
            } catch (error) {
            console.error('Error:', error);
            } finally {
            if (isMounted) setLoading(false);
        }
    };

    loadData();
    return () => { isMounted = false; };
    }, [state.profile?.userId]);


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
                votedProperties.length !== 0 ? 
                    <FlatList 

                        data={votedProperties}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            loading ? <ActivityIndicator size="small" color={theme.colors.primary_gradient_start} /> : null
                        }
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        removeClippedSubviews={false}

                        contentContainerStyle={styles.listContent}
                        style={styles.listScrollView}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onMomentumScrollEnd={({ nativeEvent } ) => {
                            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                            const isCloseToBottom = 
                                layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
                            if (isCloseToBottom) {
                                console.log('Loading more votes...');
                                handleLoadMore();
                            }
                        }}
                    >
                    </FlatList>
                : 
                <View style={{ flex: 1, marginTop: 100, alignItems: 'center', padding: 20 }}>
                    <Text style={[theme.textStyles.body, { color: theme.colors.primary_text, textAlign: 'center', maxWidth: '80%' }]}>You haven't cast any votes yet. Cast your first vote to see it appear here.</Text>
                </View>
            }

        </View>
    );
});

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