document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("contactForm");

  form.addEventListener("submit", function(event){
    event.preventDefault(); // evita recarregar a página

    const data = new FormData(form);

    fetch("https://formsubmit.co/matheus.santos@inderio.com.br", {
      method: "POST",
      body: data
    }).then(response => {
      if(response.ok){
        Swal.fire({
          icon: 'success',
          title: 'Mensagem enviada!',
          html: 'Obrigado pelo seu contato.<br>Em breve retornaremos. ',
          confirmButtonText: 'Fechar',
          confirmButtonColor: '#4CAF50', // verde
          background: 'linear-gradient(to right, #0d0f12, #12151c)',
          color: '#f0f0f0'
        });
        form.reset(); // limpa os campos
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ops...',
          html: 'Não conseguimos enviar sua mensagem 😢<br>Tente novamente.',
          confirmButtonText: 'Fechar',
          confirmButtonColor: '#f44336', // vermelho
          background: 'linear-gradient(to right, #0d0f12, #12151c)',
          color: '#333'
        });
      }
    }).catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Erro de rede',
        html: 'Verifique sua conexão e tente novamente 😢',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#f44336',
        background: '#f0f0f0',
        color: '#333'
      });
    });
  });
});
