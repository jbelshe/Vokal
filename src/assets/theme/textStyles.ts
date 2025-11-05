import { typeface, fontSizes, fontWeights, lineHeights, letterSpacings } from './typography';

export const textStyles = {
  headline1: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xxl,
    letterSpacing: letterSpacings.normal,
  },
  headline2: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.lg,
    letterSpacing: letterSpacings.normal,
  },
  title1: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.semibold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.tight,
  },
  title2: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.sm,
    letterSpacing: letterSpacings.normal,
  },
  caption: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.md,
    letterSpacing: letterSpacings.normal,
  },
  body: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.lg,
    letterSpacing: letterSpacings.wide,
  },
  button1: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.medium,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.normal,
  },  
  button2: {
    fontFamily: typeface.regular,
    fontWeight: fontWeights.regular,
    fontSize: fontSizes.sm,
    letterSpacing: letterSpacings.normal,
  },
};
