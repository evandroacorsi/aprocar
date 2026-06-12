## Notícias e Painel Administrativo

O blog segue o mesmo modelo usado na Cyrino:

- `/gestao-aprocar` abre o painel administrativo.
- `/security` faz login com Supabase Auth.
- Notícias são salvas em arquivos Markdown dentro de `news/` no servidor.
- O índice público fica em `news/index.json`.
- Imagens enviadas pelo admin ficam em `uploads/`.
- O Supabase é usado apenas para autenticação e permissão de administrador.

Preencha o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SITE_URL=https://www.aprocar.org.br
```

No Supabase, aplique a migração em `supabase/migrations/20260612120000_admin_roles.sql`.
Depois crie o usuário no Auth e insira a role admin:

```sql
insert into public.user_roles (user_id, role)
values ('UUID_DO_USUARIO', 'admin');
```

Em desenvolvimento, `npm run dev` simula a API PHP e grava em `public/news` e `public/uploads`.

## Documentos de Transparência

Arquivos em `public/docs` são publicados diretamente no site. Não coloque nessa pasta PDFs
com CPF ou outros dados pessoais sem tarja definitiva.

Se um documento precisar de redaction:

1. Mantenha o arquivo original fora de `public`, por exemplo em `docs-pendentes-redacao/`.
2. Tarje os CPFs usando ferramenta de redação real de PDF, não apenas um retângulo por cima do texto.
3. Exporte uma cópia nova e conferida.
4. Rode uma varredura antes de publicar:

```bash
pdftotext "arquivo.pdf" - | rg '[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}'
```

Se o comando retornar algum resultado, o PDF ainda não deve ir para `public/docs`.
