import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    restaurantName: "",
    address: "",
    gstNumber: "",
    phone: "",
    theme: "light",
    taxPercent: 5,
    printerSize: "58mm",
  });

  // LOAD SETTINGS
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(API);

      if (res.data) {
        setSettings({
          restaurantName: res.data.restaurant_name || "",
          address: res.data.address || "",
          gstNumber: res.data.gst_number || "",
          phone: res.data.phone || "",
          theme: res.data.theme || "light",
          taxPercent: Number(res.data.tax_percent) || 5,
          printerSize: res.data.printer_size || "58mm",
        });
      }
    } catch (err) {
      console.error("Fetch settings failed", err);
    }
  };

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      // 🔥 CONVERT camelCase → snake_case
      const payload = {
        restaurant_name: settings.restaurantName,
        address: settings.address,
        gst_number: settings.gstNumber,
        phone: settings.phone,
        theme: settings.theme,
        tax_percent: settings.taxPercent,
        printer_size: settings.printerSize,
      };

      await axios.post(API, payload);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* RESTAURANT INFO */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Restaurant Info</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Restaurant Name"
            value={settings.restaurantName}
            onChange={(e) => update("restaurantName", e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Phone"
            value={settings.phone}
            onChange={(e) => update("phone", e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="GST Number"
            value={settings.gstNumber}
            onChange={(e) => update("gstNumber", e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Address"
            value={settings.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
      </section>

      {/* TAX */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Tax</h2>
        <input
          type="number"
          className="border p-2 rounded w-32"
          value={settings.taxPercent}
          onChange={(e) => update("taxPercent", Number(e.target.value))}
        />
      </section>

      {/* THEME */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Theme</h2>
        <div className="flex gap-4">
          {["light", "dark"].map((t) => (
            <button
              key={t}
              onClick={() => update("theme", t)}
              className={`px-4 py-2 rounded ${
                settings.theme === t
                  ? "bg-black text-white"
                  : "bg-gray-200"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* PRINTER */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Printer</h2>
        <select
          className="border p-2 rounded"
          value={settings.printerSize}
          onChange={(e) => update("printerSize", e.target.value)}
        >
          <option value="58mm">58mm Thermal</option>
          <option value="80mm">80mm Thermal</option>
        </select>
      </section>

      {/* SAVE */}
      <button
        onClick={saveSettings}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Save Settings
      </button>
    </div>
  );
}
