import { galleryRepository } from "../repositories/gallery";

export const galleryService = {
  async listVisible() {
    return galleryRepository.findVisible();
  },
};
