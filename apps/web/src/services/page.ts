import { pageRepository } from "../repositories/page";
import { getLocalizedField } from "./gift";

export const pageService = {
  async getBySlug(slug: string, locale: string) {
    const page = await pageRepository.findBySlug(slug);
    if (!page) return null;

    return {
      id: page.id,
      slug: page.slug,
      title: getLocalizedField(page as unknown as Record<string, unknown>, "title", locale),
      content: getLocalizedField(page as unknown as Record<string, unknown>, "content", locale),
      icon: page.icon,
      published: page.published,
      sortOrder: page.sortOrder,
    };
  },

  async listPublished(locale: string) {
    const pages = await pageRepository.findPublished();

    return pages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: getLocalizedField(page as unknown as Record<string, unknown>, "title", locale),
      content: getLocalizedField(page as unknown as Record<string, unknown>, "content", locale),
      icon: page.icon,
      published: page.published,
      sortOrder: page.sortOrder,
    }));
  },
};
