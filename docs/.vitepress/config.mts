import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'aisenv Docs',
    description: 'Build your AiScript development environment.',
    srcDir: 'src',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [{ text: 'ガイド', link: '/guide/introduction' }],

        sidebar: [
            {
                text: 'ガイド',
                items: [
                    { text: 'aisenvについて', link: '/guide/introduction' },
                    { text: 'はじめる', link: '/guide/starting' },
                    { text: 'テスト', link: '/guide/testing' },
                    { text: '拡張機能', link: '/guide/addons' },
                ],
            },
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/aisenv-dev/aisenv' },
        ],

        editLink: {
            pattern:
                'https://github.com/aisenv-dev/aisenv/edit/main/docs/src/:path',
            text: 'GitHubで編集',
        },
    },
});