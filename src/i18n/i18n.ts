import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import dashboard_en from '../locales/en/dashboard.json';
import header_en from '../locales/en/header.json';
import leftmenu_en from '../locales/en/leftmenu.json';
import logout_en from '../locales/en/logout.json';
import profilestudent_en from '../locales/en/profilestudent.json';
import register_en from '../locales/en/register.json';
import studentmanager_en from '../locales/en/studentmanager.json';
import universitymanager_en from '../locales/en/universitymanager.json';
import usermenu_en from '../locales/en/usermenu.json';
import universityregistion_en from '../locales/en/universityregistion.json';
import login_en from '../locales/en/login.json';
import reset_en from '../locales/en/reset.json';
import forgot_en from '../locales/en/forgot.json';
import chat_en from '../locales/en/chat.json';

import dashboard_vi from '../locales/vi/dashboard.json';
import header_vi from '../locales/vi/header.json';
import leftmenu_vi from '../locales/vi/leftmenu.json';
import logout_vi from '../locales/vi/logout.json';
import profilestudent_vi from '../locales/vi/profilestudent.json';
import register_vi from '../locales/vi/register.json';
import studentmanager_vi from '../locales/vi/studentmanager.json';
import universitymanager_vi from '../locales/vi/universitymanager.json';
import usermenu_vi from '../locales/vi/usermenu.json';
import universityregistion_vi from '../locales/vi/universityregistion.json';
import login_vi from '../locales/vi/login.json';
import reset_vi from '../locales/vi/reset.json';
import forgot_vi from '../locales/vi/forgot.json';
import chat_vi from '../locales/vi/chat.json';

import dashboard_jp from '../locales/jp/dashboard.json';
import header_jp from '../locales/jp/header.json';
import leftmenu_jp from '../locales/jp/leftmenu.json';
import logout_jp from '../locales/jp/logout.json';
import profilestudent_jp from '../locales/jp/profilestudent.json';
import register_jp from '../locales/jp/register.json';
import studentmanager_jp from '../locales/jp/studentmanager.json';
import universitymanager_jp from '../locales/jp/universitymanager.json';
import usermenu_jp from '../locales/jp/usermenu.json';
import universityregistion_jp from '../locales/jp/universityregistion.json';
import login_jp from '../locales/jp/login.json';
import reset_jp from '../locales/jp/reset.json';
import forgot_jp from '../locales/jp/forgot.json';
import chat_jp from '../locales/jp/chat.json';

const resources = {
  en: {
    dashboard: dashboard_en,
    header: header_en,
    leftmenu: leftmenu_en,
    logout: logout_en,
    profilestudent: profilestudent_en,
    register: register_en,
    studentmanager: studentmanager_en,
    universitymanager: universitymanager_en,
    usermenu: usermenu_en,
    universityregistion: universityregistion_en,
    login : login_en,
    reset: reset_en,
    forgot: forgot_en,
    chat : chat_en
  },
  vi: {
    dashboard: dashboard_vi,
    header: header_vi,
    leftmenu: leftmenu_vi,
    logout: logout_vi,
    profilestudent: profilestudent_vi,
    register: register_vi,
    studentmanager: studentmanager_vi,
    universitymanager: universitymanager_vi,
    usermenu: usermenu_vi,
    universityregistion: universityregistion_vi,
    login: login_vi,
    reset: reset_vi,
    forgot: forgot_vi,
    chat : chat_vi
  },
  jp: {
    dashboard: dashboard_jp,
    header: header_jp,
    leftmenu: leftmenu_jp,
    logout: logout_jp,
    profilestudent: profilestudent_jp,
    register: register_jp,
    studentmanager: studentmanager_jp,
    universitymanager: universitymanager_jp,
    usermenu: usermenu_jp,
    universityregistion: universityregistion_jp,
    login: login_jp,
    reset: reset_jp,
    forgot: forgot_jp,
    chat : chat_jp
  }
};
const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
i18n
  .use(initReactI18next).init({
    resources,
    lng: selectedLanguage, 
    fallbackLng: 'en',
    ns: ['chat','forgot','reset','login','universityregistion','dashboard', 'header', 'leftmenu', 'logout', 'profilestudent', 'register', 'studentmanager', 'universitymanager', 'usermenu'], 
    defaultNS: 'header',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;