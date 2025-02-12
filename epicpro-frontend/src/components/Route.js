// Import all components here
// import React, { Component } from 'react'
import Dashboard from './HRMS/Dashboard/Dashboard';
import Users from './HRMS/Users/Users';
import Departments from './HRMS/Departments/Departments';
import Employee from './HRMS/Employee/Employee';
import AddEmployee from './HRMS/Employee/AddEmployee';
import EditEmployee from './HRMS/Employee/EditEmployee';
import Holidays from './HRMS/Holidays/Holidays';
import Events from './HRMS/Events/Events';
import Activities from './HRMS/Activities/Activities';
import Payroll from './HRMS/Payroll/Payroll';
import Report from './HRMS/Report/Report';
import Accounts from './HRMS/Accounts/Accounts';
import Gallery from './HRMS/Gallery/Gallery';
// import ProjectDashboard from './Project/Dashboard/Dashboard';
import ProjectList from './Project/ProjectList/Projectlist';
import Clients from './Project/Clients/Clients';
import TodoList from './Project/TodoList/TodoList';
import JobPortalDashboard from './JobPortal/Dashboard/Dashboard';
import Applicants from './JobPortal/Applicants/Applicants';
import Positions from './JobPortal/Positions/Positions';
import Resumes from './JobPortal/Resumes/Resumes';
import Settings from './JobPortal/Settings/Settings';
import Profile from './Profile/Profile';
import AppCalendar from './AppPages/AppCalendar';
import AppContact from './AppPages/AppContact';
import AppSetting from './AppPages/AppSetting';
import Login from './Authentication/login';
import ForgotPassword from './Authentication/forgotpassword';
import NotFound from './Authentication/404';
import InternalServer from './Authentication/500';
import ViewEmployee from './HRMS/Employee/ViewEmployee';

const Routes = [
    {
        path: "/",
        name: 'dashboard',
        exact: true,
        pageTitle: "HR Dashboard",
        component: Dashboard
    },
    {
        path: "/hr-users",
        name: 'hr-users',
        exact: true,
        pageTitle: "Users",
        component: Users
    },
    {
        path: "/hr-department",
        name: 'department',
        exact: true,
        pageTitle: "Departments",
        component: Departments
    },
    {
        path: "/hr-employee",
        name: 'employee',
        exact: true,
        pageTitle: "Employee",
        component: Employee
    },
    {
        path: "/add-employee",
        name: 'add-employee',
        exact: true,
        pageTitle: "Add Employee",
        component: AddEmployee
    },
    {
        path: "/edit-employee",
        name: 'edit-employee',
        exact: true,
        pageTitle: "Edit Employee",
        component: EditEmployee
    },
    {
        path: "/view-employee",
        name: 'view-employee',
        exact: true,
        pageTitle: "View Employee",
        component: ViewEmployee
    },
    {
        path: "/hr-holidays",
        name: 'holidays',
        exact: true,
        pageTitle: "Holidays",
        component: Holidays
    },
    {
        path: "/hr-events",
        name: 'events',
        exact: true,
        pageTitle: "Events",
        component: Events
    },
    {
        path: "/hr-activities",
        name: 'activities',
        exact: true,
        pageTitle: "Activities",
        component: Activities
    },
    {
        path: "/hr-payroll",
        name: 'payroll',
        exact: true,
        pageTitle: "Payroll",
        component: Payroll
    },
    {
        path: "/hr-accounts",
        name: 'accounts',
        exact: true,
        pageTitle: "Accounts",
        component: Accounts
    },
    {
        path: "/hr-report",
        name: 'report',
        exact: true,
        pageTitle: "Report",
        component: Report
    },
    {
        path: "/gallery",
        name: 'gallery',
        exact: true,
        pageTitle: "Image Gallery",
        component: Gallery
    },
    // add new routes here

    //project

    {
        path: "/project-list",
        name: 'project-list',
        exact: true,
        pageTitle: "Project",
        component: ProjectList
    },

    {
        path: "/project-clients",
        name: 'project-clients',
        exact: true,
        pageTitle: "Clients",
        component: Clients
    },

    {
        path: "/project-todo",
        name: 'project-todo',
        exact: true,
        pageTitle: "Todo List",
        component: TodoList
    },

    //job portal

    {
        path: "/jobportal-dashboard",
        name: 'jobportalDashboard',
        exact: true,
        pageTitle: "Job Dashboard",
        component: JobPortalDashboard
    },
    {
        path: "/jobportal-positions",
        name: 'jobportalPositions',
        exact: true,
        pageTitle: "Job Positions",
        component: Positions
    },
    {
        path: "/jobportal-applicants",
        name: 'jobportalpplicants',
        exact: true,
        pageTitle: "Job Applicants",
        component: Applicants
    },
    {
        path: "/jobportal-resumes",
        name: 'jobportalResumes',
        exact: true,
        pageTitle: "Job Resumes",
        component: Resumes
    },
    {
        path: "/jobportal-settings",
        name: 'jobportalSettings',
        exact: true,
        pageTitle: "Job Settings",
        component: Settings
    },


    {
        path: "/login",
        name: 'login',
        exact: true,
        pageTitle: "Tables",
        component: Login
    },
    {
        path: "/forgotpassword",
        name: 'forgotpassword',
        exact: true,
        pageTitle: "Tables",
        component: ForgotPassword
    },
    {
        path: "/notfound",
        name: 'notfound',
        exact: true,
        pageTitle: "Tables",
        component: NotFound
    },
    {
        path: "/internalserver",
        name: 'internalserver',
        exact: true,
        pageTitle: "Tables",
        component: InternalServer
    },
    {
        path: "/app-calendar",
        name: 'app-calendar',
        exact: true,
        pageTitle: "Calendar",
        component: AppCalendar
    },
    {
        path: "/app-contact",
        name: 'app-contact',
        exact: true,
        pageTitle: "Contact",
        component: AppContact
    },
    {
        path: "/app-setting",
        name: 'app-setting',
        exact: true,
        pageTitle: "App Setting",
        component: AppSetting
    },
    {
        path: "/profile",
        name: 'profile',
        exact: true,
        pageTitle: "My Profile",
        component: Profile
    },
];

export default Routes;