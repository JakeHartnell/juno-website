import { useStoryStore } from '@/stores/story'
import { useConfigStore } from '@/stores/config'
import { useLinksStore } from '@/stores/links'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/defi')) return

  const storyStore = useStoryStore()
  const configStore = useConfigStore()
  const linksStore = useLinksStore()

  await storyStore.loadStory(to.params.slug)
  await configStore.loadConfig()
  await linksStore.loadLinks()
  await storyStore.loadEcosystemMediumUsers()
  await storyStore.loadEcosystemTwitterUsers()
  await storyStore.loadEcosystemYoutubeChannel()
})
