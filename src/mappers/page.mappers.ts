import { Page } from '../models/pages.models';

export const page_db_to_front = (pages: Page[]) =>
  pages.map((page) => ({
    index: page.id,
    title: page.name,
    article: page.presentation,
    sort: page.sort,
    display: page.display,
  }));
