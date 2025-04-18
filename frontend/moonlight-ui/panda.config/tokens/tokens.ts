// moonlight-ui/panda.config/tokens/tokens.ts

import { fonts, fontWeights, fontSizes, lineHeight, letterSpacings } from "./fonts"
import { colors, shadows } from "./colors"
import { sizes, spacing, radii, zIndices } from "./sizes"
import { defineTokens } from '@pandacss/dev'


export const easings = defineTokens.easings({ 
    default: { value: 'ease' },
    linear: { value: 'linear' },
    in: { value: 'cubic-bezier(0.4, 0, 1, 1)' },
    out: { value: 'cubic-bezier(0, 0, 0.2, 1)' }, // Added easeOut equivalent
    inOut: { value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    easeIn: { value: 'ease-in' },
    easeOut: { value: 'ease-out' },
})

export const duration = defineTokens.durations({ 
    default: { value: '0.3s' },
    fast: { value: '0.2s' },
    medium: { value: '0.3s' },
    slow: { value: '0.5s' },
})


export const tokens = defineTokens({
    colors,
    shadows,
    fonts,
    fontWeights,
    fontSizes,
    lineHeight,
    letterSpacings,
    easings,
    duration,
    sizes,
    spacing,
    radii,
    zIndices,
})