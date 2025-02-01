import { defineConfig } from 'vitepress';
import fs from 'node:fs/promises';

const aiscriptTmlanguage = JSON.parse(
    await fs.readFile('.aiscript-tmlanguage/aiscript.tmLanguage.json', 'utf-8'),
);

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'aisenv Docs',
    description: 'Build your AiScript development environment.',
    lang: 'ja-JP',
    base: '/aisenv/',
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

    markdown: {
        languages: [aiscriptTmlanguage],
    },
});
