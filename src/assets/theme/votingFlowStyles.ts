// src/styles/votingFlowStyles.ts
import { StyleSheet, Platform } from 'react-native';
import { theme } from '../theme';

export const votingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBarContainer: {
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS === 'android' ? 20 : 50,
    textAlign: 'center',
    paddingVertical: 12,
    color: theme.colors.primary_text,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'android' ? 20 : 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  progressContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
    paddingTop: 16
  },
  movingButtonContainer: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'flex-end',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});