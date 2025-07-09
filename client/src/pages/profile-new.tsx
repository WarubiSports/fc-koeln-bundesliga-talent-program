import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-token-auth";
import { apiRequest } from "@/lib/queryClient";

export default function ProfileNew() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    dateOfBirth: "",
    nationality: "",
    position: "",
    medicalConditions: "",
    allergies: "",
    medications: "",
    house: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        emergencyContactName: user.emergencyContactName || "",
        emergencyContactPhone: user.emergencyContactPhone || "",
        dateOfBirth: user.dateOfBirth || "",
        nationality: user.nationality || "",
        position: user.position || "",
        medicalConditions: user.medicalConditions || "",
        allergies: user.allergies || "",
        medications: user.medications || "",
        house: user.house || ""
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    alert("Form submitted! Check console for details.");
    setLoading(true);
    setMessage("");
    
    try {
      console.log("Submitting form data:", formData);
      const response = await apiRequest("PUT", "/api/auth/update-profile", formData);
      
      if (response.ok) {
        setMessage("Profile updated successfully!");
        alert("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile. Please try again.");
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("An error occurred while updating your profile.");
      alert("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "40px 20px",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        backgroundColor: "#dc2626",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "30px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0" }}>
          🔧 NEW PROFILE FORM - TESTING
        </h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>
          This is the completely new form - if you see this, the fix worked!
        </p>
      </div>
      
      {message && (
        <div style={{
          padding: "20px",
          marginBottom: "30px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
          color: message.includes("successfully") ? "#155724" : "#721c24",
          border: `3px solid ${message.includes("successfully") ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          {message}
        </div>
      )}

      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Phone Number</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Emergency Contact Name</label>
          <input
            type="text"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Emergency Contact Phone</label>
          <input
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Nationality</label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => handleInputChange("nationality", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Position</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Medical Conditions</label>
          <input
            type="text"
            value={formData.medicalConditions}
            onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Allergies</label>
          <input
            type="text"
            value={formData.allergies}
            onChange={(e) => handleInputChange("allergies", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>Medications</label>
          <input
            type="text"
            value={formData.medications}
            onChange={(e) => handleInputChange("medications", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "40px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>House</label>
          <select
            value={formData.house}
            onChange={(e) => handleInputChange("house", e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              border: "3px solid #007bff",
              borderRadius: "8px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          >
            <option value="">Select House</option>
            <option value="Widdersdorf 1">Widdersdorf 1</option>
            <option value="Widdersdorf 2">Widdersdorf 2</option>
            <option value="Widdersdorf 3">Widdersdorf 3</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "20px",
            backgroundColor: loading ? "#999" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
          }}
        >
          {loading ? "🔄 UPDATING..." : "✅ UPDATE PROFILE - CLICK ME!"}
        </button>
      </div>
    </div>
  );
}