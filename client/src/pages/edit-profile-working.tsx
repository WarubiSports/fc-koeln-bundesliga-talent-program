import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-token-auth";
import { apiRequest } from "@/lib/queryClient";

export default function EditProfile() {
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
    setLoading(true);
    setMessage("");
    
    try {
      const response = await apiRequest("PUT", "/api/auth/update-profile", formData);
      
      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "16px"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "4px",
    fontWeight: "500",
    fontSize: "14px"
  };

  const buttonStyle = {
    backgroundColor: loading ? "#ccc" : "#dc2626",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "16px"
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
        Edit Profile
      </h1>
      
      {message && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "20px", 
          backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
          color: message.includes("successfully") ? "#155724" : "#721c24",
          borderRadius: "4px"
        }}>
          {message}
        </div>
      )}

      <div>
        <label style={labelStyle}>First Name</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Last Name</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Phone Number</label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Emergency Contact Name</label>
        <input
          type="text"
          value={formData.emergencyContactName}
          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Emergency Contact Phone</label>
        <input
          type="tel"
          value={formData.emergencyContactPhone}
          onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Date of Birth</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Nationality</label>
        <input
          type="text"
          value={formData.nationality}
          onChange={(e) => handleInputChange("nationality", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Position</label>
        <input
          type="text"
          value={formData.position}
          onChange={(e) => handleInputChange("position", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Medical Conditions</label>
        <input
          type="text"
          value={formData.medicalConditions}
          onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Allergies</label>
        <input
          type="text"
          value={formData.allergies}
          onChange={(e) => handleInputChange("allergies", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Medications</label>
        <input
          type="text"
          value={formData.medications}
          onChange={(e) => handleInputChange("medications", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>House</label>
        <select
          value={formData.house}
          onChange={(e) => handleInputChange("house", e.target.value)}
          style={inputStyle}
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
        style={buttonStyle}
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </div>
  );
}