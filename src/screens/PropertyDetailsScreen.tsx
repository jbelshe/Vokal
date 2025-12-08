import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import CloseIcon from '../assets/icons/close.svg';
import { theme } from '../assets/theme';
import { useAppContext } from '../context/AppContext';
import { PurpleButtonLarge } from '@/components/PurpleButtonLarge';
import { ImageWithLoader } from '../components/ImageWithLoader';
import { FlatList } from 'react-native';
import { categoryImageMap } from '../types/categories';
import { supabase } from '@/lib/supabase';
import { TopVoteResults, VoteTally,DisplayVote } from '../types/vote';
import { getTopVotes } from '../api/voting';
import { VoteDetails } from '../components/VoteDetails';
import { ImageSize } from '../types/imageSizes';

type Props = NativeStackScreenProps<AppStackParamList, 'PropertyDetails'>;

const screenWidth = Dimensions.get('window').width;

export default function PropertyDetailsScreen({ route, navigation }: Props) {
  const { propertyId } = route.params;
  const { currProperty, properties, categoriesDataMap, idToCategoryMap, subcategoryToCategoryMap } = useAppContext();
  const { currentPropertyId, currentTopVotes, setCurrentTopVotes } = useAppContext();


  const property = properties.find(p => p.id === propertyId) ?? currProperty;

  const subcategory_id = property?.vote ? property!.vote!.choice_id : undefined;
  const subcategory_name = subcategory_id ? idToCategoryMap[subcategory_id].name : undefined;
  const subcategory_code = subcategory_id ? idToCategoryMap[subcategory_id].code : undefined;

  const voteDetails : DisplayVote | undefined = property?.vote ? {
    subcategory: subcategory_name!,
    subcategory_code: subcategory_code!,
    category: categoriesDataMap[subcategoryToCategoryMap[subcategory_code!]].name,
    category_code: subcategoryToCategoryMap[subcategory_code!],
    additional_note: property!.vote!.free_text ? property!.vote!.free_text : undefined,
  } : undefined;


  const handleSubmitSuggestion = ( ) => {
    navigation.push('VotingFlow');
    //navigation.navigate('Category', { propertyId });
  };

  useEffect(() => {
    console.log("PropertyDetailsScreen mounted", route.params);
  }, []);

  const handleViewResults = () => {
    try {
      getTopVotes(propertyId).then((data) => {
        console.log("DATA out:", data);
        if (data.length === 0) {
          setCurrentTopVotes(null); // set to null to indicate no voting data
          return;
        } 
        console.log("DATA:", data);
        const vote_data : TopVoteResults = {
          top_categories: [],
          total_votes: data[0].total_votes,
        }
        
        let votes_count = 0;
        const top_categories : VoteTally [] = [];
        for (let i = 0; i < data?.length; i++) {
          
          top_categories.push({
            category_code: idToCategoryMap[data[i].category_id].code,
            category_name: idToCategoryMap[data[i].category_id].name,
            count: data[i].vote_count,
          });
          votes_count += data[i].vote_count;
          console.log("TOP CATEGORY:", data[i]);
        }
        if (vote_data.top_categories.length <= 5 && votes_count < vote_data.total_votes) {
          top_categories.push({
            category_code: "other",
            category_name: "Other",
            count: vote_data.total_votes - votes_count,
          });
        }
        vote_data.top_categories = top_categories;
        console.log("VOTE DATA:", vote_data);
        setCurrentTopVotes(vote_data);
        navigation.push('VotingResults', { vote_data: vote_data });
    });
    } catch (error) {
      console.error('Error fetching top votes:', error);
      setCurrentTopVotes(null);
      navigation.push('VotingResults', { vote_data: null });
    }
  }
    

  // Early return if property is not found
  if (!property) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <CloseIcon width={24} height={24} fill={theme.colors.primary_text} />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Property not found</Text>
        </View>
      </View>
    );
  }

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBarContainer}>
        <Text style={[styles.headerTitle, theme.textStyles.title1]}>Location Info</Text>
        <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
          <CloseIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <FlatList
            data={property.image_urls || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
            contentContainerStyle={styles.imageScrollContent}
            keyExtractor={(url, index) => url || index.toString()}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={3}
            renderItem={({ item: url }) => (
              <ImageWithLoader
                uri={url}
                resizeMode="cover"
                imageSize={ImageSize.SIZE_512}
                containerStyle={styles.imageContainer}
                imageStyle={styles.propertyImage}
              />
            )}
          />
          
          { /* Text Container */}
          <View style={styles.contentContainer}>

            {(property?.title || property?.tenant) && (
              <View style={styles.headerRow}>
                <Text style={[styles.propertyTitle, theme.textStyles.title1]}>
                  {property.tenant ? property.tenant : property.title}
                </Text>
                {!!property.tenant && !!property.title ? <Text style={[styles.propertyTitle, theme.textStyles.title2]}>
                  {'  @ ' + property.title}
                </Text> : null}
              </View>
            )}
            <View style={styles.headerRow}>
              <Image
                source={property?.status === 'vacant'
                  ? require('../assets/icons/location-purple-icon.png')
                  : require('../assets/icons/location-blue-icon.png')
                }
                style={styles.statusIcon}
              />
              <Text style={[theme.textStyles.title2]}>
                {property.address_1 + (property.address_2 ? (", #" + property.address_2) : "")}
              </Text>
            </View>

            {property.description && (
              <View style={styles.section}>
                <View style={styles.sectionGroupText}>
                <Text style={[styles.sectionTitle, theme.textStyles.title1]}>
                  Description
                </Text>
                <Text style={[styles.sectionText, theme.textStyles.body]}>
                  {property.description}
                </Text>
                </View>
              </View>
            )}

            {property.owners_note && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, theme.textStyles.title1]}>
                  Owner's Note
                </Text>
                <Text style={[styles.sectionText, theme.textStyles.body]}>
                  {property.owners_note}
                </Text>
              </View>
            )}

            {property.estimated_open && (
              <View style={styles.section}>
                <View style={styles.sectionGroupOneLine}>
                  <Text style={[styles.sectionTitle, theme.textStyles.title1]}>
                    Estimated Opening: 
                  </Text>
                  <Text style={[styles.sectionText, theme.textStyles.body]}>
                    {property.estimated_open}
                  </Text>
                </View>
              </View>
            )}
            
            {voteDetails && 
              <VoteDetails selectionDetails={voteDetails}>
              </VoteDetails>}
        

          </View>
        </View>
      </ScrollView>
          <View style={styles.buttonContainer}>
            {
              property.status==='vacant' ? 
              property.vote ? 
              <PurpleButtonLarge
                title="View Real-Time Results"
                onPress={() => {
                  handleViewResults();
                }}
                />
              :
                <PurpleButtonLarge
                title="Submit Suggestions"
                onPress={() => {
                  handleSubmitSuggestion();
                }}
                />
              :
              property.link_type !== "none" && property.link_url ? 
              <PurpleButtonLarge
                title={property.link_type === "instagram" ? "View on Instagram" : property.link_type === "website" ? "View Website" : "View Link"}
                onPress={() => {
                  Linking.openURL(property.link_url!);
                }}
              /> : 
              null
            }
          </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  topBarContainer: {
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 16,
    marginBottom: 16,
    height: 90, 
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50, // Align with paddingTop of container
    textAlign: 'center',
    padding: 15,
    lineHeight: 40, // Match button height
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 50, // Align with paddingTop of container
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11, // Ensure it's above the title
  },
  scrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary_text,
    paddingTop: 8,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingBottom: 24,
  },

  scrollContent: {
    paddingBottom: 40,
    paddingEnd: 8,
  },

  imageScrollView: {
    marginHorizontal: -16, // Counteract the padding of listItem
    marginBottom: 12,
    paddingLeft: 12,
    marginTop: 20,
  },
  imageScrollContent: {
    paddingHorizontal: 20, // Match listItem padding
    paddingRight: 6, // Extra space on the right for better scrolling
  },
  imageContainer: {
    width: 300,
    height: 300,
    borderRadius: 12, // Slightly larger border radius
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  statusText: {
    color: theme.colors.secondary_text,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 48,
    zIndex: 10,
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface2,
  },
  sectionTitle: {
    paddingTop: 10,
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
    color: theme.colors.primary_text,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.primary_text,

  },
  sectionGroupText: {
  },
  sectionGroupOneLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: theme.colors.surface2,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.primary_text,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.secondary_text,
  },
  // votedForCategoryContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 12,
  //   backgroundColor: theme.colors.surface1,
  //   height: 60,
  //   borderRadius: 12,
  //   marginTop: 12,
  //   padding: 16,
  //   justifyContent: 'flex-start',
  // },
  // votedForSubCategoryContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 12,
  //   backgroundColor: theme.colors.surface1,
  //   height: 60,
  //   borderRadius: 12,
  //   padding: 16,
  //   justifyContent: 'flex-start',
  // },
  // votedForAdditionalNoteContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-start',
  //   marginBottom: 50,
  //   backgroundColor: theme.colors.surface1,
  //   height: 120,
  //   borderRadius: 12,
  //   padding: 16,
  // },    
  // legendIcon: {
  //       width: 36,
  //       height: 36,
  //       borderRadius: 18,
  //       marginRight: 10,
  //       backgroundColor: "#FFF",
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //   },    
  //   image: {
  //       width: 24,
  //       height: 24,
  //   },
});

