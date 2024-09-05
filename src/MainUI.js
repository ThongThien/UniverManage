import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Modal,
  Avatar,
  Dropdown,
  Switch,
  Space,
  Button,
} from "antd";
import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BankOutlined,
  DashboardOutlined,
  FileAddOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  MenuOutlined,
  BulbOutlined,
  MoonOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Dashboard from "./Component/Dashboard/DashBoard";
import StudentManagement from "./Component/StudentManagement/StudentManagement";
import UniversityManagement from "./Component/UniversityManagement/UniversityManagement";
import StudentProfile from "./Component/StudentProfile/StudentProfile";
import UniversityAdmission from "./Component/UniversityAdmission/UniversityAdmission";
import Register from "./Component/Register-page/Register";
import Chat from "./Component/Chat/chat.js";
import "./MainUI.css";
import { useLanguage } from "./languageContext";
import { useTranslation } from "react-i18next";
import { backgroundColors } from "./constants/constants.js";
import "./MainUI.css";
import "./Darktheme.css";
import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toggleTheme } from "./redux/themeSlice.js";
import { useSelector, useDispatch } from "react-redux";
const { Header, Content, Sider } = Layout;

const MainUI = ({ onLogout }) => {
  const { t, i18n } = useTranslation(["leftmenu", "header", "usermenu"]);
  const { changeLanguage } = useLanguage();
  const [selectedKey, setSelectedKey] = useState(
    localStorage.getItem("selectedKey") || "1"
  );
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [openKeys, setOpenKeys] = useState([]);
  const userDataString = localStorage.getItem("userData");
  const userData = JSON.parse(userDataString || "{}");
  const userRole = userData.role || "";
  const userName = userData.fullname || "";
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const isDarkTheme = useSelector(
    (state) => state.theme.currentTheme === "classicDark"
  );
  const dispatch = useDispatch();
  
  const handleToggleTheme = () => {
    dispatch(toggleTheme());
    const newTheme = !isDarkTheme;
    if (newTheme !== isDarkTheme) {
      localStorage.setItem("isDarkTheme", JSON.stringify(newTheme));
      document.body.classList.toggle("dark-theme", newTheme);
    }
  };
  const [collapsed, setCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem("isCollapsed");
    return storedCollapsed ? JSON.parse(storedCollapsed) : false;
  });
  useEffect(() => {
    localStorage.setItem("isCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 1024;
      setIsSmallScreen(isSmallScreen);
      setCollapsed(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const isLoggedInFirstTime = localStorage.getItem("isLoggedInFirstTime");
    if (!isLoggedInFirstTime) {
      navigate("/dashboard");
      localStorage.setItem("isLoggedInFirstTime", true);
    }
  }, [navigate]);

  // useEffect(() => {
  //   const pathname = location.pathname;
  //   const key = getKeyFromPath(pathname);
  //   setSelectedKey(key);
  //   localStorage.setItem("selectedKey", key);
  // }, [location.pathname]);

  useEffect(() => {
    const path = location.pathname;
    if (
      path.startsWith("/profile") ||
      path.startsWith("/university-admission")
    ) {
      setOpenKeys(["sub1"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("isDarkTheme");
    if (storedTheme !== null) {
      const isDark = JSON.parse(storedTheme);
      if (isDark !== isDarkTheme) {
        // Kiểm tra sự khác biệt trước khi cập nhật
        dispatch(toggleTheme(isDark));
        document.body.classList.toggle("dark-theme", isDark);
      }
    }
  }, [isDarkTheme]);

  useEffect(() => {
    const htmlElement = document.querySelector("html");
    if (isDarkTheme) {
      htmlElement.style.background = "#182434";
    } else {
      htmlElement.style.background = "#e8eaee";
    }
  }, [isDarkTheme]);

  const transformUserName = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    if (words.length >= 3) return `${words[0]} ${words[words.length - 1]}`;
    return name;
  };

  const handleMenuClick = (e) => {
    changeLanguage(e.key);
  };

  const showAvatarModal = () => {
    setIsAvatarModalVisible(true);
  };

  const handleAvatarCancel = () => {
    setIsAvatarModalVisible(false);
  };

  const getAvatarUrl = (role, name) => {
    if (role === "superadmin" || role === "admin") {
      return "https://www.shutterstock.com/image-vector/user-icon-vector-600nw-393536320.jpg";
    } else if (role === "student") {
      let storedColor = sessionStorage.getItem("avatarBackgroundColor");
      if (!storedColor) {
        storedColor =
          backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
        sessionStorage.setItem("avatarBackgroundColor", storedColor);
      }
      return `https://ui-avatars.com/api/?name=${name}&background=${storedColor}&color=000&bold=true&weight=450`;
    }
    return "";
  };

  const clearAvatarBackgroundColor = () => {
    sessionStorage.removeItem("avatarBackgroundColor");
  };

  const transformedUserName = transformUserName(userName);
  const avatarUserUrl = userData.avatarUser;
  const avatarUrl =
    avatarUserUrl || getAvatarUrl(userRole, transformedUserName);
  localStorage.setItem("avatarUser", avatarUrl);

  // const getKeyFromPath = (pathname) => {
  //   switch (pathname) {
  //     case "/dashboard":
  //       return "1";
  //     case "/student-management":
  //       return "2";
  //     case "/university-management":
  //       return "3";
  //     case "/profile":
  //       return "4";
  //     case "/university-admission":
  //       return "5";
  //     case "/register-form":
  //       return "6";
  //     case "/Announcement":
  //       return "7";
  //     default:
  //       return "1";
  //   }
  // };

  const handleMenuItemClick = (key) => {
    setSelectedKey(key);
    localStorage.setItem("selectedKey", key);
    if (isSmallScreen) {
      setIsMenuVisible(false);
    }
  };

  function getCurrentLanguage() {
    const currentLangCode = i18n.language;
    let currentLanguage;

    if (currentLangCode === "jp") {
      currentLanguage = "日本語";
    } else if (currentLangCode === "vi") {
      currentLanguage = "Tiếng Việt";
    } else {
      currentLanguage = "English";
    }

    return currentLanguage;
  }

  const handleLogout = () => {
    const selectedLanguage = localStorage.getItem("selectedLanguage");
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");
    const isDarkTheme = localStorage.getItem("isDarkTheme");
    localStorage.clear();
    if (selectedLanguage) {
      localStorage.setItem("selectedLanguage", selectedLanguage);
    }
    if (isDarkTheme) {
      localStorage.setItem("isDarkTheme", isDarkTheme);
    }
    if (savedUsername) {
      localStorage.setItem("savedUsername", savedUsername);
    }
    if (savedPassword) {
      localStorage.setItem("savedPassword", savedPassword);
    }
    clearAvatarBackgroundColor();
    onLogout();
  };
  const handleCancel = () => {
    setLogoutModalVisible(false);
  };

  const handleOk = () => {
    setLogoutModalVisible(false);
    handleLogout();
    navigate("/login");
  };

  const handleReturnDashboard = () => {
    navigate("/dashboard");
    setSelectedKey("1");
    localStorage.setItem("selectedKey", "1");
    if (isSmallScreen) {
      setIsMenuVisible(false);
    }
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const handleLogoutFromSidebar = () => {
    setLogoutModalVisible(true);
  };
  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">{t("leftmenu.dashboard")}</Link>,
    },
    {
      key: "7",
      icon: <BellOutlined />,
      label: <Link to="/Announcement">{t("leftmenu.announcement")}</Link>,
    },
    {
      key: "3",
      icon: <BankOutlined />,
      label: (
        <Link to="/university-management">
          {t("leftmenu.universityManagement")}
        </Link>
      ),
    },
    // {
    //   key: "8",
    //   icon: <LogoutOutlined />,
    //   label: t("usermenu:logout"),
    //   onClick: handleLogoutFromSidebar,
    // },
  ];

  if (userRole === "admin" || userRole === "superadmin") {
    menuItems.push({
      key: "2",
      icon: <UsergroupAddOutlined />,
      label: (
        <Link to="/student-management">{t("leftmenu.studentManagement")}</Link>
      ),
    });
    menuItems.push({
      key: "4",
      icon: <UserOutlined />,
      label: <Link to="/profile">{t("leftmenu.adminProfile")}</Link>,
    });
    menuItems.push({
      key: "6",
      icon: <FileAddOutlined />,
      label: <Link to="/register-form">{t("leftmenu.register")}</Link>,
    });
  }

  if (userRole === "student") {
    menuItems.push({
      key: "sub1",
      icon: <UserOutlined />,
      label: t("leftmenu.studentDetails"),
      children: [
        {
          key: "4",
          label: <Link to="/profile">{t("leftmenu.studentProfile")}</Link>,
        },
        {
          key: "5",
          label: (
            <Link to="/university-admission">
              {t("leftmenu.universityAdmission")}
            </Link>
          ),
        },
      ],
    });
  }
  const menuPropsLogout = {
    items: [
      {
        key: "8",
        icon: <LogoutOutlined />,
        label: t("usermenu:logout"),
        onClick: handleLogoutFromSidebar,
        className: "logout-menu-item",
      },
    ],
  };

  const menuLanguageItems = [
    { key: "vi", label: "Tiếng Việt" },
    { key: "en", label: "English" },
    { key: "jp", label: "日本語" },
  ];

  const menuProps = {
    items: menuLanguageItems,
    onClick: handleMenuClick,
  };

  return (
    <div className={`mainUI-cont ${isDarkTheme ? "dark-theme" : ""}`}>
      <Layout>
        {isSmallScreen && !isMenuVisible && (
          <div
            className="menu-icon"
            onClick={() => setIsMenuVisible(!isMenuVisible)}
          >
            <MenuOutlined className="menu-icon-css" />
          </div>
        )}

        {isSmallScreen && isMenuVisible && (
          <div
            className={`menu-overlay ${isMenuVisible ? "visible" : ""}`}
            onClick={() => setIsMenuVisible(false)}
          ></div>
        )}
        <Sider
          className={`custom-sider ${isMenuVisible ? "visible" : ""} ${
            isDarkTheme ? "dark-theme" : ""
          }`}
          {...(!isSmallScreen && { collapsible: true })}
          collapsed={collapsed}
          onCollapse={
            !isSmallScreen ? (value) => setCollapsed(value) : undefined
          }
          width={250}
          breakpoint="md"
          collapsedWidth="80"
          style={{
            position: "fixed",
            height: "100vh",
            zIndex: "12",
            borderRight: "solid 3px #fff",
          }}
        >
          <img
            src={
              collapsed
                ? "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png"
                : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/FPT_Education_logo.svg/2560px-FPT_Education_logo.svg.png"
            }
            alt="FPT Education"
            className="fpt-education-logo"
            onClick={handleReturnDashboard}
          />
          <div>
            <div>
              <Menu
                selectedKeys={[selectedKey]}
                mode="inline"
                onSelect={({ key }) => handleMenuItemClick(key)}
                items={menuItems}
                openKeys={openKeys}
                onOpenChange={handleOpenChange}
              />
            </div>
            <div style={{ marginBottom: "115px" }}>
              <hr className="logout-hr" />
              <Menu items={menuPropsLogout.items} mode="inline" />
            </div>
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: isSmallScreen ? 0 : collapsed ? 80 : 250,
            transition: "all 0.2s ease",
          }}
        >
          <Header className="header-box">
            <div className="wrapper-title">
              <div className="heading-title">
                {t("header:nationhighschoolexamination")}
              </div>
              {!isSmallScreen && (
                <div className="mainui-modal-info">
                  <div>
                    <Dropdown menu={menuProps} placement="bottomLeft">
                      <Button
                        style={{
                          marginLeft: 190,
                          borderRadius: 20,
                          backgroundColor: "#6A5ACD",
                          color: "#fff",
                          border: "none",
                          height: 28,
                          marginTop: 23,
                          fontSize: 13,
                        }}
                      >
                        {getCurrentLanguage()}
                      </Button>
                    </Dropdown>
                  </div>
                  <div>
                    <Space direction="vertical">
                      <Switch
                        checkedChildren={<MoonOutlined />}
                        unCheckedChildren={<BulbOutlined />}
                        checked={isDarkTheme}
                        onChange={handleToggleTheme}
                      />
                    </Space>
                  </div>
                </div>
              )}

              <div className="logo">
                <Avatar
                  size="large"
                  src={avatarUrl}
                  onClick={showAvatarModal}
                />
              </div>

              <Modal
                open={isAvatarModalVisible}
                footer={null}
                onCancel={handleAvatarCancel}
                mask={false}
                className={
                  isDarkTheme
                    ? "custom-modal dark-theme"
                    : "custom-modal light-theme"
                }
                // wrapClassName={null}
                // centered={false}
              >
                <div className="modal-content">
                  {isSmallScreen && (
                    <div className="mainui-modal-info mainUI-modal-info-repon">
                      <div>
                        <Dropdown menu={menuProps}>
                          <FontAwesomeIcon
                            className="change-language-icon"
                            icon={faLanguage}
                          />
                        </Dropdown>
                      </div>
                      <div>
                        <Space direction="vertical">
                          <Switch
                            checkedChildren={<MoonOutlined />}
                            unCheckedChildren={<BulbOutlined />}
                            checked={isDarkTheme}
                            onChange={handleToggleTheme}
                          />
                        </Space>
                      </div>
                    </div>
                  )}
                  <h2>{userData.username}</h2>
                  <div className="modal-content-avt">
                    <Avatar size="large" src={avatarUrl} />
                  </div>
                  <h3>
                    {t("usermenu:hi")} {transformedUserName} (
                    <span className={`user-role ${userRole}`}>{userRole}</span>)
                  </h3>
                </div>
              </Modal>
            </div>
          </Header>

          <Content
            style={{
              margin: "70px 16px 0px",
              transition: "background-color 0.3s ease, color 0.3s ease",
            }}
            className={`content-box ${isDarkTheme ? "dark-theme" : ""}`}
          >
            <div
              className={
                isDarkTheme ? "dark-theme-content" : "light-theme-content"
              }
              style={{
                margin: "30px 10px 0px ",
                minHeight: "80vh",
                borderRadius: "30px",
                // border: "solid 3px #fff",
              }}
            >
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/student-management"
                  element={<StudentManagement />}
                />
                <Route
                  path="/university-management"
                  element={<UniversityManagement />}
                />
                <Route path="/profile" element={<StudentProfile />} />
                <Route
                  path="/university-admission"
                  element={<UniversityAdmission />}
                />
                <Route path="/register-form" element={<Register />} />
                <Route path="/Announcement" element={<Chat />} />
              </Routes>
            </div>
          </Content>
        </Layout>
        <Modal
          title={t("logout:confirmation")}
          open={logoutModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>{t("logout:logoutConfirmation")}</p>
        </Modal>
      </Layout>
    </div>
  );
};

export default MainUI;
