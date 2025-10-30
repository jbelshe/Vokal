export type AppStackParamList = {
  // Main App Screens
  Home: undefined;
  Details: { id?: string };
  
  // Auth Flow Screens
  SignIn: undefined;
  EnterPhoneNumber: undefined;
  OTP: undefined;
  CreateProfile1: undefined;
  CreateProfile2: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  EnterPhoneNumber: undefined;
  OTP: undefined;
  CreateProfile1: undefined;
  CreateProfile2: undefined;
};
