import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/protected/ProtectedRoute";

function App() {
  return (
    <div className="w-full h-full overflow-x-hidden">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<ProtectedRoute />}>
         
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10b981",
              color: "#fff",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

export default App;