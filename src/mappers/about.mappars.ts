import { About, AboutDB } from '../models/about.models';

export const about_db_to_front: (data: AboutDB[]) => About = (data) => {
  return {
    fr: data[0].information,
    en: data[1].information,
  };
};
