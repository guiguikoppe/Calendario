function configurarContador() {
    const dataInput = document.getElementById('data-alvo').value;
    if (!dataInput) return;

    const alvo = new Date(dataInput);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas para cálculo limpo

    const diffMilisegundos = alvo - hoje;
    const diasFaltando = Math.ceil(diffMilisegundos / (1000 * 60 * 60 * 24));

    const display = document.getElementById('resultado-contador');

    if (diasFaltando > 0) {
        display.innerText = `Faltam ${diasFaltando} dias para esta data!`;
    } else if (diasFaltando === 0) {
        display.innerText = `É hoje! 🎉`;
    } else {
        display.innerText = `Essa data já passou faz ${Math.abs(diasFaltando)} dias.`;
    }
}