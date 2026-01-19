import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import HomeScreen from './screens/Member/HomeScreen.jsx';
import LoginScreen from './screens/Member/LoginScreen.jsx';
import RegisterScreen from './screens/Member/RegisterScreen.jsx';
import ForgotPassword from './screens/Member/ForgotPassword.jsx';
import { Provider } from 'react-redux';
import store from './store.js';
import PrivateRoute from './components/Basic/PrivateRoute.jsx';
import ProfileScreen from './screens/Member/ProfileScreen.jsx';
import DashboardScreen from './screens/Dashboard/DashboardScreen.jsx';
import GroupScreen from './screens/teams/GroupScreen.jsx';
import Dashboard from './components/Dashiboard/Dashboard.jsx';
import ProjectScreen from './screens/teams/ProjectScreen.jsx';
import MemberScreen from './screens/teams/MemberScreen.jsx';
import AccountScreen from './screens/teams/AccountScreen.jsx';
import ServiceScreen from './screens/teams/ServiceScreen.jsx';
import EquipmentScreen from './screens/teams/EquipmentScreen.jsx';
import RealguyScreen from './screens/teams/RealguyScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* Private Routes */}
      <Route path='' element={<PrivateRoute />}>
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />}>
          <Route index element={<Dashboard />} />
          <Route path="teams/groups" element={<GroupScreen />} />
          <Route path="teams/members" element={<MemberScreen />} />
          <Route path="teams/projects" element={<ProjectScreen />} />
          <Route path="teams/accounts" element={<AccountScreen />} />
          <Route path="teams/services" element={<ServiceScreen />} />
          <Route path="teams/equipments" element={<EquipmentScreen />} />
          <Route path="teams/realguys" element={<RealguyScreen />} />
        </Route>   
      </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);