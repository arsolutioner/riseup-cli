import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'riseup-cli',
  description: 'Unofficial CLI for RiseUp personal finance',
  base: '/riseup-cli/',

  head: [
    ['link', { rel: 'icon', href: '/riseup-cli/logo.png' }],
  ],

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Commands', link: '/commands' },
      { text: 'API Reference', link: '/api' },
      { text: 'Claude Skill', link: '/claude-code-skill' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Commands', link: '/commands' },
          { text: 'API Reference', link: '/api' },
          { text: 'Claude Skill', link: '/claude-code-skill' },
          { text: 'Contributing', link: '/contributing' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/arsolutioner/riseup-cli' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026 Amram Englander',
    },

    search: {
      provider: 'local',
    },
  },
})
