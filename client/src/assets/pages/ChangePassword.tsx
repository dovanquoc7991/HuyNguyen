import { useState } from "react";
import { useLocation } from "wouter";
import { MdLockReset, MdArrowBack, MdLockOutline } from "react-icons/md";
import "../css/ChangePassword.css";
import { useAuth } from "../hooks/use-auth";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");
  const [, setLocation] = useLocation();
  const { changePassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWarning("");
    setSuccess("");
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setSuccess("Password changed successfully!");
        setTimeout(() => setLocation("/"), 1500);
      } else {
        setWarning(res.message || "Change password failed.");
      }
    } catch (error: any) {
      setWarning(error?.message || "Change password failed");
    }
  };

  return (
    <div className="change-password-bg">
      <div className="change-password-container">
        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="change-password-title">
            <MdLockReset size={30} />
            Change Password
          </div>

          <label className="change-password-label" htmlFor="oldPassword">
            Old Password
          </label>
          <div className="input-group">
            <MdLockOutline className="input-icon" />
            <input
              id="oldPassword"
              className="change-password-input"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <label className="change-password-label" htmlFor="newPassword">
            New Password
          </label>
          <div className="input-group">
            <MdLockOutline className="input-icon" />
            <input
              id="newPassword"
              className="change-password-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {warning && <div className="message warning">{warning}</div>}
          {success && <div className="message success">{success}</div>}

          <button type="submit" className="change-password-btn">
            Update Password
          </button>

          <button
            type="button"
            className="back-btn-changepw"
            onClick={() => setLocation("/practice/reading")}
          >
            <MdArrowBack size={20} />
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
