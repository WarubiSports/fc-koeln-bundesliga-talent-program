export default function EmergencyTest() {
  const testClick = () => {
    alert("EMERGENCY TEST WORKS!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>EMERGENCY TEST PAGE</h1>
      <button onClick={testClick} style={{ 
        padding: "10px 20px", 
        backgroundColor: "red", 
        color: "white", 
        border: "none", 
        cursor: "pointer" 
      }}>
        CLICK ME
      </button>
    </div>
  );
}