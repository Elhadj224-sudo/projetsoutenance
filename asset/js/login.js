document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.token) {
      document.getElementById("login-error").style.display = "block";
      return;
    }

    // ✅ Stocke le token JWT dans localStorage
    localStorage.setItem('token', data.token);

    // Redirection vers le dashboard
    window.location.href = "/asset/dashboard.html";

  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    document.getElementById("login-error").style.display = "block";
  }
});