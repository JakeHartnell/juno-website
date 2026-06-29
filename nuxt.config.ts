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
      junoDexChainId: process.env.NUXT_PUBLIC_JUNO_DEX_CHAIN_ID ?? 'uni-7',
      junoDexChainName: process.env.NUXT_PUBLIC_JUNO_DEX_CHAIN_NAME ?? 'Juno Testnet',
      junoDexRpcEndpoint: process.env.NUXT_PUBLIC_JUNO_DEX_RPC_ENDPOINT ?? 'https://rpc.uni.junonetwork.io',
      junoDexRestEndpoint: process.env.NUXT_PUBLIC_JUNO_DEX_REST_ENDPOINT ?? 'https://lcd.uni.junonetwork.io',
      junoDexFeeDenom: process.env.NUXT_PUBLIC_JUNO_DEX_FEE_DENOM ?? 'ujunox',
      junoDexDisplayDenom: process.env.NUXT_PUBLIC_JUNO_DEX_DISPLAY_DENOM ?? 'JUNOX',
      junoDexNativeDenom: process.env.NUXT_PUBLIC_JUNO_DEX_NATIVE_DENOM ?? 'ujunox',
      junoDexFactoryAddress: process.env.NUXT_PUBLIC_JUNO_DEX_FACTORY_ADDRESS ?? '',
      junoDexRouterAddress: process.env.NUXT_PUBLIC_JUNO_DEX_ROUTER_ADDRESS ?? '',
      junoDexCoinRegistryAddress: process.env.NUXT_PUBLIC_JUNO_DEX_COIN_REGISTRY_ADDRESS ?? '',
      junoDexIncentivesAddress: process.env.NUXT_PUBLIC_JUNO_DEX_INCENTIVES_ADDRESS ?? '',
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
