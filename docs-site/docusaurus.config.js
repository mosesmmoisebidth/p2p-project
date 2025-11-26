// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Smart P2P Docs',
  tagline: 'Procure-to-pay platform reference',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://mosesmmoisebidth.github.io',
  baseUrl: '/p2p-docs/',
  trailingSlash: false,

  organizationName: 'mosesmmoisebidth',
  projectName: 'p2p-docs',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/mosesmmoisebidth/p2p-docs/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Smart P2P Docs',
        logo: {
          alt: 'Smart P2P logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/mosesmmoisebidth/p2p-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Smart P2P Overview',
                to: '/docs/smart-p2p',
              },
            ],
          },
          {
            title: 'Environments',
            items: [
              {
                label: 'Smart P2P Portal',
                href: 'https://p2p.moses.it.com',
              },
              {
                label: 'API',
                href: 'https://p2p-api.moses.it.com',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/mosesmmoisebidth/p2p-docs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Smart P2P.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
