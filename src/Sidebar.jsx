import React from "react";
import {
  FiHome,
  FiFile,
  FiBook,
  FiShare2,
  FiSettings,
  FiUser,
} from "react-icons/fi";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Menu</h2>

      <ul className="sidebar-menu">
        <li><FiHome /> Dashboard</li>
        <li><FiFile /> My Documents</li>
        <li><FiBook /> My Reports</li>
        <li><FiShare2 /> Share</li>
        <li><FiSettings /> Settings</li>
        <li><FiUser /> Profile</li>
      </ul>
    </div>
  );
}
