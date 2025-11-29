import { Link } from "react-router-dom";

function Sidebar({ active }) {
  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Receipts", path: "/receipts" },
    { name: "Reports", path: "/new-order" },
    { name: "Menu Items", path: "/menu-items" },
    // { name: "Customers", path: "/customers" },
    // { name: "Reports", path: "/reports" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r">
      {menu.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`block p-4 cursor-pointer ${
            active === item.name ? "bg-gray-200 font-bold" : ""
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;
