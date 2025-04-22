// moonlight-ui/panda.config/keyframes.ts

// src/styles/keyframes.ts
import { defineKeyframes } from '@pandacss/dev'

export const rippleKeyframes = defineKeyframes({
  ripple: {
    'from': { transform: 'scale(0)', opacity: '1' },
    'to':   { transform: 'scale(4)', opacity: '0' }
  }
})


export const keyframes = { 
  ripple: {
    '0%': { // Use 0% instead of 'from'
      transform: 'scale(0)',
      opacity: 'var(--ripple-opacity)' // Use the variable here
    },
    '100%': { // Use 100% instead of 'to'
      transform: 'scale(4)', // Note: Still hardcoded scale(4)
      opacity: '0'
    }
  },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        shimmerDiagonal: { 
            '0%': { backgroundPosition: '-1000px -1000px' },
            '100%': { backgroundPosition: '1000px 1000px' }
        },
        navItemHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' }
        },
        arrowRotateOpen: {
          '0%': { transform: 'rotate(0)' },
          '50%': { transform: 'rotate(180deg) translateY(2px)' },
          '100%': { transform: 'rotate(180deg) translateY(0)' }
        },

        mobileMenuOpen: {
          '0%': { opacity: 0, transform: 'translateY(-100%)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        mobileMenuClose: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-100%)' }
        },
        reveal: { // Renamed from textReveal
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' }
          },
          // Note: shine often requires a ::before pseudo-element
          // with a gradient background for the visual effect.
          // The keyframe itself just moves the background position.
          shine: { // Renamed from crystalShine
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          },
          // Note: shift animates the background-position of an element
          // that should have a suitable gradient background applied.
          shift: { // Renamed from auroraShift
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          },
          float: { // Renamed from etherealFloat
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-6px)' }
          },
          unfoldRight: {
            '0%': { transform: 'scaleX(0)', opacity: '0' },
            '70%': { transform: 'scaleX(1.05)', opacity: '1' }, // Includes overshoot
            '100%': { transform: 'scaleX(1)', opacity: '1' }
          },
      
          collapseLeft: {
            '0%': { transform: 'scaleX(1)', opacity: '1' },
            '100%': { transform: 'scaleX(0)', opacity: '0' } // Collapses fully
          },
          auroraTextShift: {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          },
          'aurora-1': { 
            '0%': { top: '0', right: '0' },
            '50%': { top: '100%', right: '75%' },
            '75%': { top: '100%', right: '25%' },
            '100%': { top: '0', right: '0' }
          },
          'aurora-2': {
            '0%': { top: '-50%', left: '0%' },
            '60%': { top: '100%', left: '75%' },
            '85%': { top: '100%', left: '25%' },
            '100%': { top: '-50%', left: '0%' }
          },
          'aurora-3': {
            '0%': { bottom: '0', left: '0' },
            '40%': { bottom: '100%', left: '75%' },
            '65%': { bottom: '40%', left: '50%' },
            '100%': { bottom: '0', left: '0' }
          },
          'aurora-4': {
            '0%': { bottom: '-50%', right: '0' },
            '50%': { bottom: '0%', right: '40%' },
            '90%': { bottom: '50%', right: '25%' },
            '100%': { bottom: '-50%', right: '0' }
          },
          'aurora-border': {
            '0%': { borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%' },
            '25%': { borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%' },
            '50%': { borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%' },
            '75%': { borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%' },
            '100%': { borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%' }
          },
          // Used for slide-in-fade-in / slide-out-fade-out animation styles
        // These only handle the transform; opacity is handled by fadeIn/fadeOut.
        'slide-from-top': {
            'from': { transform: 'translateY(-100%)' },
            'to': { transform: 'translateY(0)' }
          },
          'slide-from-bottom': {
            'from': { transform: 'translateY(100%)' },
            'to': { transform: 'translateY(0)' }
          },
          'slide-from-left': {
            'from': { transform: 'translateX(-100%)' },
            'to': { transform: 'translateX(0)' }
          },
          'slide-from-right': {
            'from': { transform: 'translateX(100%)' },
            'to': { transform: 'translateX(0)' }
          },
          'slide-to-top': {
            'from': { transform: 'translateY(0)' },
            'to': { transform: 'translateY(-100%)' }
          },
          'slide-to-bottom': {
            'from': { transform: 'translateY(0)' },
            'to': { transform: 'translateY(100%)' }
          },
          'slide-to-left': {
            'from': { transform: 'translateX(0)' },
            'to': { transform: 'translateX(-100%)' }
          },
          'slide-to-right': {
            'from': { transform: 'translateX(0)' },
            'to': { transform: 'translateX(100%)' }
          },
}