const donForm = document.getElementById('don-form');
const donOutput = document.getElementById('don-output');

donForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    nom: donForm.nom.value.trim(),
    prenom: donForm.prenom.value.trim(),
    email: donForm.email.value.trim(),
    telephone: donForm.telephone.value.trim(),
    nature: donForm.nature.value.trim(),
    message: donForm.message.value.trim(),
    autorisation: donForm.autorisation.checked
  };

  try {
    const res = await fetch('http://localhost:3000/api/dons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur lors de l’envoi');
    donOutput.textContent = "✅ Merci ! Votre don a été enregistré.";
    donForm.reset();
  } catch (err) {
    donOutput.textContent = "❌ " + err.message;
  }
});
