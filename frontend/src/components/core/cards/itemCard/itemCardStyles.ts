import { css } from "../../../../../styled-system/css"; // Adjust path as needed

export const shadows = {
  default: '0 2px 8px rgba(0, 0, 0, 0.15)',
  hover: '0 4px 12px rgba(0, 0, 0, 0.2)',
  pressed: '0 1px 4px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 2px var(--card-focus-color, rgba(0, 120, 255, 0.4)), 0 4px 12px rgba(0, 0, 0, 0.2)'
};

export const cardStyle = css({
  appearance: 'none',
  textAlign: 'inherit',
  position: 'relative',
  borderRadius: '{radii.md}',
  padding: '{spacing.4} {spacing.sm} {spacing.4} {spacing.md}',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '{sizes.md}',
  width: '100%',
  cursor: 'pointer',
  borderWidth: '{borderWidths.thin}',
  borderStyle: 'solid',
  borderColor: 'var(--card-border-color, var(--colors-primary))',
  boxShadow: shadows.default,
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  borderLeftWidth: '{borderWidths.feature}',
  outline: 'none',
  zIndex: 1, // Base z-index
  transition: 'background-color 0.3s ease-out, border-color 0.3s ease-out',
  '&[data-focused="true"]:not([data-pressed="true"])': {
    outline: '2px solid var(--card-focus-outline-color, var(--colors-primary))',
    outlineOffset: '2px',
    background: 'var(--card-focus-background, rgba(var(--colors-primary-rgb, 255, 255, 255), 0.08))',
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: shadows.focus,
    transition: 'transform 0.25s ease-out, background-color 0.25s ease-out, box-shadow 0.25s ease-out, border-color 0.25s ease-out',
  },
  '&[data-hovered="true"], &[data-focused="true"], &[data-has-description="true"], &[data-pressed="true"]': {
    zIndex: 5 // Elevate during interaction states
  },
});

export const cardWithDescriptionStyle = css({
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: 'auto',
  minHeight: '{sizes.lg}',
  padding: '{spacing.5} {spacing.sm} {spacing.5} {spacing.md}',
});

export const goldenTabStyle = css({
  position: 'absolute',
  left: '{spacing.3}',
  width: '{borderWidths.feature}',
  background: 'var(--card-tab-color, var(--colors-primary))',
  borderTopRightRadius: '{radii.sm}',
  borderBottomRightRadius: '{radii.sm}',
  boxShadow: '0 0 4px 0 rgba(var(--colors-primary-rgb), 0.3)',
  transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)', // Base transition for non-framer motion managed properties
  pointerEvents: 'none',
  zIndex: 1,
  _before: {
      content: '""',
      position: 'absolute',
      left: '-1px',
      top: '-50%',
      width: '4px',
      height: '200%',
      background: 'linear-gradient(to bottom, transparent, var(--card-tab-color, var(--colors-primary)), transparent)',
      opacity: '0.2',
      filter: 'blur(4px)',
      transition: 'opacity 0.5s ease',
    },
  '[data-hovered="true"] &': {
      boxShadow: '0 0 {spacing.xs} 2px rgba(var(--colors-primary-rgb), 0.4)',
      _before: {
        opacity: '0.7',
      },
    },
  '[data-pressed="true"] &': {
      boxShadow: '0 0 2px 1px rgba(var(--colors-primary-rgb), 0.3)',
      _before: {
        opacity: '0.3',
      },
      transition: 'all 0.2s ease-out' // Faster transition for shadow/before opacity when pressed
    }
});

export const tabGlowContainerStyle = css({
    position: 'absolute',
    left: '0px',
    top: '0',
    borderRadius: '{radii.sm}',
    width: '16px',
    height: '100%',
    overflow: 'hidden',
    zIndex: '0',
    pointerEvents: 'none',
});

export const tabGlowStyle = css({
    position: 'absolute',
    left: '-2px',
    top: '0',
    width: '6px',
    height: '100%',
    background: 'var(--card-tab-color, var(--colors-primary))',
    filter: 'blur(4px)',
    opacity: '0.25', // Base opacity set here, framer-motion controls changes via variants
    zIndex: '-1',
    pointerEvents: 'none',
});

export const headerContainerStyle = css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: '{sizes.md}',
    paddingTop: '{spacing.xs}',
    marginBottom: '0',
    zIndex: '5',
    pointerEvents: 'none',
    '& + div': {
      marginTop: '-0.3rem',
    }
});

export const iconContainerStyle = css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '{sizes.md}',
    height: '{sizes.md}',
    marginRight: '{spacing.2}',
    marginLeft: '{spacing.3}',
    color: 'var(--card-icon-color, var(--colors-primary))',
    position: 'relative',
    zIndex: '2',
    '& svg': {
      width: '100%',
      height: '100%',
      display: 'block',
    },
});

export const glowEffectStyle = css({ // For the ICON glow
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: '10',
    color: 'var(--card-glow-color, var(--colors-primary))',
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '50%',
      height: '50%',
      borderRadius: '50%',
      filter: 'blur(24px)',
      background: 'currentColor',
      opacity: '0.4',
    },
    '&[data-pressed="true"]': {
      opacity: '0.5', // Style adjustment when pressed (can coexist with framer-motion)
      transform: 'scale(0.9)'
    }
});

export const labelStyle = css({
    textStyle: 'h3',
    color: 'primary',
    position: 'relative',
    zIndex: '2',
    display: 'flex',
    alignItems: 'center',
});

export const descriptionStyle = css({
    textStyle: 'body',
    width: '100%',
    paddingLeft: '{spacing.sm}',
    paddingRight: '{spacing.xs}',
    zIndex: '2',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    marginTop: '0',
    paddingTop: '0',
    pointerEvents: 'none',
    '[data-pressed="true"] &': {
      opacity: '0.8',
    }
});

export const expandedDescriptionStyle = css({
    textStyle: 'body',
    position: 'relative',
    top: 'auto',
    paddingTop: '0',
    paddingBottom: '{spacing.xs}',
    marginTop: '0.7rem !important',
    opacity: '1',
    width: '100%',
    display: 'block',
});