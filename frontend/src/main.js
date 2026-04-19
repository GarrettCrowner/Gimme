import { router } from "./utils/router.js";
import { renderNavbar } from "./components/navbar.js";
import { renderTabBar } from "./components/tabBar.js";

renderNavbar();
renderTabBar(router.navigate);
router.init();
