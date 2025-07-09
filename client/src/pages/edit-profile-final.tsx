import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-token-auth";
import { apiRequest } from "@/lib/queryClient";

export default function EditProfileFinal() {
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
      console.log("Submitting form data:", formData);
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

  const containerStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    fontSize: "16px",
    marginBottom: "20px",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333"
  };

  const buttonStyle = {
    backgroundColor: loading ? "#999" : "#dc2626",
    color: "white",
    padding: "15px 30px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "20px",
    width: "100%"
  };

  const messageStyle = {
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: message.includes("successfully") ? "#d4edda" : "#f8d7da",
    color: message.includes("successfully") ? "#155724" : "#721c24",
    border: message.includes("successfully") ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px", textAlign: "center" }}>
        Edit Profile
      </h1>
      
      {message && (
        <div style={messageStyle}>
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