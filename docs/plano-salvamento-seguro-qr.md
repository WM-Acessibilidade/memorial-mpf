# Salvamento seguro do painel de QR Codes — especificação

## Arquitetura escolhida
O painel estático `administrar-qr.html` não deve receber tokens pessoais ou segredos.
Criar serviço independente do Audire, com autenticação GitHub App (OAuth web flow) e sessão de curta duração via cookie Secure, HttpOnly e SameSite=Lax, com proteção CSRF e validação de state na autenticação.

## API do serviço
- GET /api/session: identifica usuário autenticado e permissão efetiva no repositório WM-Acessibilidade/memorial-mpf.
- GET /api/destinos: lê configuração publicada e sua revisão SHA.
- PATCH /api/destinos/:item: recebe destino original|audire, URL HTTPS opcional e revisão SHA esperada; valida item01–item17, autorização, URL e conflito de versão.
- POST /api/destinos/lote: altera somente itens explicitamente indicados, com confirmação e controle de revisão.
- POST /api/logout: encerra sessão.

## Proteções obrigatórias
GitHub App instalado apenas no repositório escolhido, com Contents: read/write e Metadata: read; menor escopo possível. Chave privada e segredo OAuth somente no servidor, nunca no HTML ou JavaScript público. Restringir origens, registrar auditoria sem segredos, impor limites de requisições, tratar conflitos de edição e registrar configuração anterior para restauração. Validar URL HTTPS, sem credenciais embutidas, e opcionalmente restringir domínio ao destino oficial Audire. A aplicação deve gravar somente config/destinos-qr.json, não aceitar caminhos arbitrários.

## Experiência acessível
Botões de opção nativos por item, nome acessível único, campo URL com rótulo, botão Salvar, status com role=status, erros com role=alert e foco gerenciado após falha. Comandos em lote exigem confirmação; evitar anúncios duplicados no VoiceOver e NVDA. Mostrar estado publicado separado de alterações não salvas.

## Implantação e testes
1. Implementar serviço e configurar GitHub App com URL de callback real; sem inserir segredos no repositório.
2. Integrar painel à API e testar autenticação, permissão, sessão, CSRF, conflitos e restauração.
3. Testar com item01 na ramificação de teste; demais 16 devem permanecer originais.
4. Conferir URL codificada no selo físico antigo antes de publicar. Validar VoiceOver e NVDA.
5. Publicar somente após aprovação explícita e manter opção de reversão.

**Estado atual:** especificação apenas. Nenhum serviço OAuth, endpoint ou salvamento direto está implantado.
