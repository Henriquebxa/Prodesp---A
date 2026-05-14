function openModal(tab) {
    document.getElementById('modalOverlay').classList.add('active');
    switchTab(tab);
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}
function handleOverlayClick(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
}
function switchTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('tabLogin').classList.toggle('active', isLogin);
    document.getElementById('tabRegister').classList.toggle('active', !isLogin);
    document.getElementById('panelLogin').classList.toggle('active', isLogin);
    document.getElementById('panelRegister').classList.toggle('active', !isLogin);
    document.getElementById('modalHeadline').textContent = isLogin ? 'Acesse sua conta' : 'Crie sua conta';
    document.getElementById('modalSub').textContent = isLogin
        ? 'Portal de Editais e Licitações'
        : 'Cadastro gratuito para fornecedores e gestores';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });