import { createTheme, alpha, PaletteMode, Shadows } from '@mui/material/styles';

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    highlighted: true;
  }
}
declare module '@mui/material/styles' {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface PaletteColor extends ColorRange {}

  interface Palette {
    baseShadow: string;
  }
}

const defaultTheme = createTheme();

const customShadows: Shadows = [...defaultTheme.shadows];

export const brand = {
  50: 'rgb(230, 243, 255)',
  100: 'rgb(184, 221, 255)',
  200: 'rgb(153, 204, 255)',
  300: 'rgb(102, 179, 255)',
  400: 'rgb(0, 107, 214)',
  500: 'rgb(0, 95, 190)',
  600: 'rgb(0, 80, 160)',
  700: 'rgb(0, 65, 130)',
  800: 'rgb(0, 50, 100)',
  900: 'rgb(0, 35, 70)',
};

export const gray = {
  50: 'rgb(245, 247, 250)',
  100: 'rgb(236, 239, 244)',
  200: 'rgb(220, 225, 232)',
  300: 'rgb(200, 208, 219)',
  400: 'rgb(152, 164, 179)',
  500: 'rgb(120, 135, 152)',
  600: 'rgb(87, 99, 117)',
  700: 'rgb(66, 76, 90)',
  800: 'rgb(26, 30, 35)',
  900: 'rgb(15, 18, 20)',
};

export const green = {
  50: 'hsl(120, 80%, 98%)',
  100: 'hsl(120, 75%, 94%)',
  200: 'hsl(120, 75%, 87%)',
  300: 'hsl(120, 61%, 77%)',
  400: 'hsl(120, 44%, 53%)',
  500: 'hsl(120, 59%, 30%)',
  600: 'hsl(120, 70%, 25%)',
  700: 'hsl(120, 75%, 16%)',
  800: 'hsl(120, 84%, 10%)',
  900: 'hsl(120, 87%, 6%)',
};

export const orange = {
  50: 'hsl(45, 100%, 97%)',
  100: 'hsl(45, 92%, 90%)',
  200: 'hsl(45, 94%, 80%)',
  300: 'hsl(45, 90%, 65%)',
  400: 'hsl(45, 90%, 40%)',
  500: 'hsl(45, 90%, 35%)',
  600: 'hsl(45, 91%, 25%)',
  700: 'hsl(45, 94%, 20%)',
  800: 'hsl(45, 95%, 16%)',
  900: 'hsl(45, 93%, 12%)',
};

export const red = {
  50: 'hsl(0, 100%, 97%)',
  100: 'hsl(0, 92%, 90%)',
  200: 'hsl(0, 94%, 80%)',
  300: 'hsl(0, 90%, 65%)',
  400: 'hsl(0, 90%, 40%)',
  500: 'hsl(0, 90%, 30%)',
  600: 'hsl(0, 91%, 25%)',
  700: 'hsl(0, 94%, 18%)',
  800: 'hsl(0, 95%, 12%)',
  900: 'hsl(0, 93%, 6%)',
};

export const getDesignTokens = (mode: PaletteMode) => {
  customShadows[1] =
    mode === 'dark'
      ? 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
      : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px';

  return {
    palette: {
      mode,
      primary: {
        light: brand[200],
        main: mode === 'dark' ? brand[300] : brand[400],
        dark: mode === 'dark' ? brand[400] : brand[700],
        contrastText: mode === 'dark' ? gray[900] : '#fff',
      },
      info: {
        light: brand[100],
        main: mode === 'dark' ? brand[300] : brand[400],
        dark: mode === 'dark' ? brand[400] : brand[700],
        contrastText: mode === 'dark' ? gray[900] : '#fff',
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
        ...(mode === 'dark' && {
          light: orange[400],
          main: orange[500],
          dark: orange[700],
        }),
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
        ...(mode === 'dark' && {
          light: red[400],
          main: red[500],
          dark: red[700],
        }),
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
        ...(mode === 'dark' && {
          light: green[400],
          main: green[500],
          dark: green[700],
        }),
      },
      grey: {
        ...gray,
      },
      divider: mode === 'dark' ? alpha(gray[700], 0.6) : alpha(gray[300], 0.4),
      background: {
        default: mode === 'dark' ? gray[900] : '#fff',
        paper: mode === 'dark' ? 'rgb(20, 23, 26)' : '#fff',
      },
      text: {
        primary: mode === 'dark' ? '#fff' : gray[800],
        secondary: mode === 'dark' ? gray[400] : gray[600],
        warning: orange[400],
      },
      action: {
        hover: mode === 'dark' ? alpha(gray[700], 0.4) : alpha(gray[200], 0.3),
        selected: mode === 'dark' ? alpha(gray[700], 0.5) : alpha(gray[200], 0.4),
      },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      h1: {
        fontSize: defaultTheme.typography.pxToRem(48),
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: defaultTheme.typography.pxToRem(36),
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: defaultTheme.typography.pxToRem(30),
        lineHeight: 1.2,
      },
      h4: {
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h5: {
        fontSize: defaultTheme.typography.pxToRem(20),
        fontWeight: 600,
      },
      h6: {
        fontSize: defaultTheme.typography.pxToRem(18),
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: defaultTheme.typography.pxToRem(18),
      },
      subtitle2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 500,
      },
      body1: {
        fontSize: defaultTheme.typography.pxToRem(14),
      },
      body2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        fontWeight: 400,
      },
      caption: {
        fontSize: defaultTheme.typography.pxToRem(12),
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: customShadows,
  };
};

export const colorSchemes = {
  light: {
    palette: {
      primary: {
        light: brand[200],
        main: brand[400],
        dark: brand[700],
        contrastText: '#fff',
      },
      info: {
        light: brand[100],
        main: brand[400],
        dark: brand[700],
        contrastText: '#fff',
      },
      warning: {
        light: orange[300],
        main: orange[400],
        dark: orange[800],
      },
      error: {
        light: red[300],
        main: red[400],
        dark: red[800],
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[300], 0.4),
      background: {
        default: '#fff',
        paper: '#fff',
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: orange[400],
      },
      action: {
        hover: alpha(gray[200], 0.3),
        selected: alpha(gray[200], 0.4),
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
    },
  },
  dark: {
    palette: {
      primary: {
        light: brand[200],
        main: brand[300],
        dark: brand[400],
        contrastText: gray[900],
      },
      info: {
        light: brand[100],
        main: brand[300],
        dark: brand[400],
        contrastText: gray[900],
      },
      warning: {
        light: orange[400],
        main: orange[500],
        dark: orange[700],
      },
      error: {
        light: red[400],
        main: red[500],
        dark: red[700],
      },
      success: {
        light: green[400],
        main: green[500],
        dark: green[700],
      },
      grey: {
        ...gray,
      },
      divider: alpha(gray[700], 0.6),
      background: {
        default: gray[900],
        paper: 'rgb(20, 23, 26)',
      },
      text: {
        primary: '#fff',
        secondary: gray[400],
      },
      action: {
        hover: alpha(gray[700], 0.4),
        selected: alpha(gray[700], 0.5),
      },
      baseShadow:
        'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
    },
  },
};

export const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: {
    fontSize: defaultTheme.typography.pxToRem(48),
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: defaultTheme.typography.pxToRem(36),
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: defaultTheme.typography.pxToRem(30),
    lineHeight: 1.2,
  },
  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 600,
  },
  h6: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
  },
  subtitle1: {
    fontSize: defaultTheme.typography.pxToRem(18),
  },
  subtitle2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 500,
  },
  body1: {
    fontSize: defaultTheme.typography.pxToRem(14),
  },
  body2: {
    fontSize: defaultTheme.typography.pxToRem(14),
    fontWeight: 400,
  },
  caption: {
    fontSize: defaultTheme.typography.pxToRem(12),
    fontWeight: 400,
  },
};

export const shape = {
  borderRadius: 8,
};

// @ts-ignore
const defaultShadows: Shadows = [
  'none',
  'var(--template-palette-baseShadow)',
  ...defaultTheme.shadows.slice(2),
];
export const shadows = defaultShadows;
