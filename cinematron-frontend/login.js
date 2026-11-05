async function hacerLogin(event) {
  event.preventDefault();
  const user = document.getElementById("admin-user").value;
  const pass = document.getElementById("admin-pass").value;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: user, password: pass }),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.data.token);
      document.getElementById("form-login").hidden = true;
      document.getElementById("admin-panel").hidden = false;
    } else {
      alert("Credenciales incorrectas");
    }
  } catch (error) {
    alert("Error de conexión");
  }
}