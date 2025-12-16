import { NavLink } from "react-router-dom";

// Icons
import DashboardIcon from "../assets/sidebar icons/dashboard.png";
import ReceiptIcon from "../assets/sidebar icons/bill.png";
import OrderIcon from "../assets/sidebar icons/file.png";
import MenuIcon from "../assets/sidebar icons/groceries.png";
import SettingsIcon from "../assets/sidebar icons/setting.png";

function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/", icon: DashboardIcon },
    { name: "Receipts", path: "/receipts", icon: ReceiptIcon },
    { name: "New Order", path: "/new-order", icon: OrderIcon },
    { name: "Menu Items", path: "/menu-items", icon: MenuIcon },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r">
      {menu.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === "/"}
          className={({ isActive }) =>
            `flex items-center gap-3 p-4 mx-2 my-1 rounded-lg cursor-pointer transition-all
            ${
              isActive
                ? "bg-gradient-to-r from-pink-400 to-orange-400 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={item.icon}
                alt={item.name}
                className={`w-5 h-5 object-contain transition-all ${
                  isActive ? "brightness-0 invert" : ""
                }`}
              />
              <span className="font-medium">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default Sidebar;
