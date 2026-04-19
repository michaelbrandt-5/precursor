/**
 * Precursor · Tailwind CSS v3/v4 Theme Extension
 * AI Exposure Index™ Brand System v1.0
 *
 * Usage (tailwind.config.js):
 *   const precursor = require('./precursor-tailwind.config');
 *   module.exports = { theme: { extend: precursor.theme.extend } }
 *
 * Or merge into an existing config.
 */

const precursor = {
  theme: {
    extend: {

      // ─── Colors ────────────────────────────────────────
      colors: {
        cobalt: {
          DEFAULT: '#1D4ED8',
          deep:    '#1E3A8A',
          mid:     '#2563EB',
          light:   '#DBEAFE',
          pale:    '#EFF6FF',
        },
        ink:      '#0A0A0A',
        parchment:'#F7F6F4',
        border:   '#E8E8E8',

        // Score semantic colors
        score: {
          low:      '#16A34A',
          'low-bg': '#F0FDF4',
          medium:   '#CA8A04',
          'medium-bg': '#FEFCE8',
          high:     '#DC2626',
          'high-bg':'#FEF2F2',
          critical: '#7C3AED',
          'critical-bg': '#F5F3FF',
        },
      },

      // ─── Typography ────────────────────────────────────
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'Times New Roman', 'serif'],
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'monospace'],
      },

      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.05', letterSpacing: '-1px' }],
        'display-lg': ['48px', { lineHeight: '1.1',  letterSpacing: '-0.5px' }],
        'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.3px' }],
        'title-lg':   ['24px', { lineHeight: '1.3',  fontWeight: '600' }],
        'title-md':   ['18px', { lineHeight: '1.4',  fontWeight: '500' }],
        'eyebrow':    ['12px', { lineHeight: '1.4',  letterSpacing: '0.08em', fontWeight: '600' }],
        'body-lg':    ['18px', { lineHeight: '1.6' }],
        'body-md':    ['16px', { lineHeight: '1.55' }],
        'body-sm':    ['14px', { lineHeight: '1.5' }],
        'body-xs':    ['12px', { lineHeight: '1.4' }],
        'score-xl':   ['96px', { lineHeight: '1.0',  fontWeight: '500' }],
        'score-lg':   ['48px', { lineHeight: '1.0',  fontWeight: '500' }],
        'score-md':   ['24px', { lineHeight: '1.0' }],
        'score-sm':   ['14px', { lineHeight: '1.0' }],
      },

      fontWeight: {
        light:    '300',
        regular:  '400',
        medium:   '500',
        semibold: '600',
      },

      // ─── Spacing ───────────────────────────────────────
      spacing: {
        '18': '72px',
        '22': '88px',
        '30': '120px',
      },

      // ─── Border radius ─────────────────────────────────
      borderRadius: {
        'brand-sm': '2px',
        'brand-md': '4px',
        'brand-none': '0px',
      },

      // ─── Box shadow ────────────────────────────────────
      boxShadow: {
        'float': '0 4px 16px rgba(0,0,0,0.08)',
        'none':  'none',
      },

      // ─── Max width ─────────────────────────────────────
      maxWidth: {
        'container': '1200px',
        'content':   '720px',
        'sidebar':   '280px',
      },

      // ─── Transition ────────────────────────────────────
      transitionDuration: {
        'ui':    '150',
        'page':  '300',
        'score': '600',
      },

      // ─── Height ────────────────────────────────────────
      height: {
        'nav': '64px',
        'btn': '40px',
        'input': '48px',
      },
    },
  },
};

module.exports = precursor;
