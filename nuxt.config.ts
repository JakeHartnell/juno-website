import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'msapplication-TileColor', content: '#181517' },
        { name: 'theme-color', content: '#181517' }
      ],
      link: [
        { rel: 'preconnect', href: '//img2.storyblok.com' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#f47677' }
      ],
      script: [
        { type: 'module', src: 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js', defer: true, tagPosition: 'bodyClose' }
      ]
    }
  },
  modules: [
    '@storyblok/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    'nuxt-gtag'
  ],
  storyblok: {
    accessToken: process.env.STORYBLOK_SPACE_TOKEN,
    apiOptions: {
      cache: {
        clear: 'auto',
        type: 'memory'
      }
    },
    bridge: true
  },
  typescript: {
    typeCheck: true
  },
  tailwindcss: {
    cssPath: '@/assets/scss/tailwind.scss',
    exposeConfig: true
  },
  runtimeConfig: {
    public: {
      storyblokContentVersion: process.env.STORYBLOK_CONTENT_VERSION,
      youtubeApiKey: process.env.YOUTUBE_API_KEY,
      metaLocationOrigin: process.env.META_LOCATION_ORIGIN,
      junoDexChainId: process.env.NUXT_PUBLIC_JUNO_DEX_CHAIN_ID ?? 'juno-1',
      junoDexChainName: process.env.NUXT_PUBLIC_JUNO_DEX_CHAIN_NAME ?? 'Juno',
      junoDexRpcEndpoint: process.env.NUXT_PUBLIC_JUNO_DEX_RPC_ENDPOINT ?? 'https://juno-rpc.publicnode.com:443',
      junoDexRestEndpoint: process.env.NUXT_PUBLIC_JUNO_DEX_REST_ENDPOINT ?? 'https://juno-rest.publicnode.com',
      junoDexFeeDenom: process.env.NUXT_PUBLIC_JUNO_DEX_FEE_DENOM ?? 'ujuno',
      junoDexDisplayDenom: process.env.NUXT_PUBLIC_JUNO_DEX_DISPLAY_DENOM ?? 'JUNO',
      junoDexNativeDenom: process.env.NUXT_PUBLIC_JUNO_DEX_NATIVE_DENOM ?? 'ujuno',
      junoDexFactoryAddress: process.env.NUXT_PUBLIC_JUNO_DEX_FACTORY_ADDRESS ?? 'juno1n5ettlqdt06nd346mnqy65fahcvmncaazpwn8s3m0df3ldv0d2yqjqelca',
      junoDexRouterAddress: process.env.NUXT_PUBLIC_JUNO_DEX_ROUTER_ADDRESS ?? 'juno1fppwfa2efpsahvwlqprrshjth2mfqyd8n80yd7z5kpjspq30s8ksrapa8s',
      junoDexCoinRegistryAddress: process.env.NUXT_PUBLIC_JUNO_DEX_COIN_REGISTRY_ADDRESS ?? 'juno1qwer7jleluth33trk2ywqvp6vwjh4j4zar3ag6dw5d8derkpel0sq8vfh2',
      junoDexIncentivesAddress: process.env.NUXT_PUBLIC_JUNO_DEX_INCENTIVES_ADDRESS ?? 'juno1h0auy2knfyhkcn877cqun0fu00safgsjwvt82d4cvd0slv8q7wtsk59598',
      junoDexRegistryUrl: process.env.NUXT_PUBLIC_JUNO_DEX_REGISTRY_URL ?? '/dex/registry.juno-1.json',
      junoDexExplorerBaseUrl: process.env.NUXT_PUBLIC_JUNO_DEX_EXPLORER_BASE_URL ?? 'https://www.mintscan.io/juno'
    }
  },
  googleFonts: {
    display: 'swap',
    preconnect: true,
    prefetch: true,
    families: {
      Inter: [300, 400, 500, 600]
    }
  },
  gtag: {
    id: process.env.GTAG,
    loadingStrategy: 'async'
  },
  vite: {
    plugins: [
      svgLoader()
    ],
    optimizeDeps: {
      exclude: ['fsevents']
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => ['spline-viewer'].includes(tag)
    }
  }
})
