import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { ChatPage } from "./pages/ChatPage";
import { EducationPage } from "./pages/EducationPage";
import { TriagePage } from "./pages/TriagePage";
import { ClinicListPage } from "./pages/ClinicListPage";
import { ClinicDetailPage } from "./pages/ClinicDetailPage";
import { HandoffPage } from "./pages/HandoffPage";
import { SharePage } from "./pages/SharePage";
import { PrivacyPage } from "./pages/PrivacyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/chat",
    Component: ChatPage,
  },
  {
    path: "/education",
    Component: EducationPage,
  },
  {
    path: "/triage",
    Component: TriagePage,
  },
  {
    path: "/clinics",
    Component: ClinicListPage,
  },
  {
    path: "/clinics/:id",
    Component: ClinicDetailPage,
  },
  {
    path: "/handoff",
    Component: HandoffPage,
  },
  {
    path: "/share",
    Component: SharePage,
  },
  {
    path: "/privacy",
    Component: PrivacyPage,
  },
]);
