import { NavigatorScreenParams } from "@react-navigation/native";

export type AppStackParamList = {
  Home: undefined;
  Details: { id?: string };
  PropertyDetails: { propertyId: string };
  SettingsMain: undefined;
  Profile: undefined;
  ContactUs: undefined;
  VoteHistory: undefined;
  // Category: { propertyId: string };
  // SubCategory: { propertyId: string };
  // AdditionalNote: { propertyId: string };
  VotingFlow: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  EnterPhoneNumber: undefined;
  OTP: undefined;
  CreateProfile1: undefined;
  CreateProfile2: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Onboarding4: undefined;
};

export type VotingStackParamList = {
  Category: undefined;
  SubCategory: { selectedCategory: string };
  AdditionalNote: undefined;
};