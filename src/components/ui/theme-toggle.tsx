import React, { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "./sidebar";

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <SidebarMenuItem key={"Swag"}>
      <SidebarMenuButton asChild>
        <button onClick={toggleTheme}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default ThemeToggle;
