import BerandaPage from '../pages/beranda/beranda-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import HomePage from '../pages/home/home-page';
import AddinfoPage from '../pages/add-info/add-info-page';
import DetailPage from '../pages/detail/detail-page';
import SaveinfoPage from '../pages/save-info/save-info-page';
import { getLogout } from '../utils/auth';

const routes = {
  '/': new BerandaPage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/home': new HomePage(),
  '/add-info': new AddinfoPage(),
  '/story/:id': new DetailPage(),
  '/save-info': new SaveinfoPage(),
  '/logout': {
    render: async () => {
      getLogout();
      location.hash = '/';
      return '';
    },
    afterRender: async () => {},
  },
};

export default routes;
