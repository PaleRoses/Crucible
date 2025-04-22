import { css } from '../../styled-system/css'


export const rippleStyle = css({
  position:      'absolute',
  borderRadius:  '50%',
  pointerEvents: 'none',
  top:    'var(--ripple-y)',
  left:   'var(--ripple-x)',
  width:  'var(--ripple-size)',
  height: 'var(--ripple-size)',
  bg:     'rgba(0,0,0,var(--ripple-opacity))',

  // Use the shorthand you defined in config:
  animation: 'ripple var(--ripple-duration)ms linear forwards'
})
