import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HashRouter } from 'react-router-dom';
import LandingPage from "@/components/pages/landingPage";
import PrizesAdminDashboard from "@/components/pages/prizesAdminDashboard";
import DrawingMain from "@/components/pages/drawingMain";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import BounceInMotionDiv from "./components/ui/bounce-in-motion-div";
import CheckIn from "./components/pages/checkIn";
import SettingsPage from "./components/pages/settingsPage";
import ManualCheckInPage from "./components/pages/manualCheckIn";

function AnimatedRoutes() {
  const location = useLocation(); // Get current location for transitions

  return (
    <div className="h-full w-full">
      <AnimatePresence mode="wait">
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          {/* Main content beside sidebar */}
          <div className="h-full w-full flex flex-col pl-8 pr-8 gap-4">
            {/* Sidebar toggle button */}
            <div className="z-10 pt-4">
              <SidebarTrigger />
            </div>
            <main className="h-full w-full" id="mainContent">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/"
                  element={
                    <BounceInMotionDiv className="h-full w-full">
                      <LandingPage />
                    </BounceInMotionDiv>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <BounceInMotionDiv className="h-full w-full">
                      <PrizesAdminDashboard />
                    </BounceInMotionDiv>
                  }
                />
                <Route
                  path="/draw"
                  element={
                    <BounceInMotionDiv className="h-full w-full">
                      <DrawingMain />
                    </BounceInMotionDiv>
                  }
                />
                <Route
                  path="/check-in"
                  element={
                    <BounceInMotionDiv className="h-full w-full">
                      <CheckIn />
                    </BounceInMotionDiv>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <BounceInMotionDiv className="h-full w-full">
                      <SettingsPage />
                    </BounceInMotionDiv>
                  }
                />
                <Route
                  path="/manual-check-in"
                  element={
                    <BounceInMotionDiv className="h-full w-full">
                      <ManualCheckInPage />
                    </BounceInMotionDiv>
                  }
                />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <div>
        <AnimatedRoutes />
      </div>
      <Toaster closeButton richColors position="top-right" />
    </HashRouter>
  );
}

export default App;
