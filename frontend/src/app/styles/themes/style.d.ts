// styles/styled.d.ts
import 'styled-components';
import { CustomTheme } from './themes/theme';

declare module 'styled-components' {
  export type DefaultTheme = CustomTheme;
}