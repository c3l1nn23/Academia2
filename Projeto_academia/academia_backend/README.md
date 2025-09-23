'''
# Academia Fitness - Backend

Este é o projeto backend para o site da Academia Fitness, desenvolvido com Django REST Framework e Simple JWT.

## Funcionalidades

- **Autenticação de Usuários:** Cadastro, login e verificação de token com Simple JWT.
- **Gerenciamento de Usuários:** API para CRUD de usuários (restrito a administradores).
- **Planos:** API para listar e gerenciar os planos da academia.
- **Matrículas:** Sistema para usuários se matricularem em planos.
- **Frontend Simples:** Páginas de Home, Login e Cadastro em HTML, CSS e JavaScript para demonstrar a integração.

## Estrutura do Projeto

```
/home/ubuntu/academia_backend/
├── academia/                 # App principal do Django
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── academia_project/         # Configurações do projeto Django
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── static/
│   ├── css/
│   │   ├── auth.css
│   │   └── home.css
│   ├── html/
│   │   ├── cadastro.html
│   │   ├── home.html
│   │   └── login.html
│   └── js/
│       ├── auth.js
│       ├── cadastro.js
│       ├── home.js
│       └── login.js
├── .env                      # Arquivo para variáveis de ambiente
├── db.sqlite3                # Banco de dados SQLite
├── manage.py                 # Utilitário de gerenciamento do Django
└── requirements.txt          # Dependências do Python
```

## Como Executar o Projeto

### Pré-requisitos

- Python 3.10+
- pip

### 1. Instalar Dependências

Navegue até a pasta do projeto e instale as dependências listadas no `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

O projeto utiliza um arquivo `.env` para gerenciar as variáveis de ambiente. Certifique-se de que ele existe na raiz do projeto com o seguinte conteúdo:

```
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
# DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
# SECURE_SSL_REDIRECT=True
```

> **Nota:** Para produção, `DEBUG` deve ser `False` e a `SECRET_KEY` deve ser uma chave segura e única.

### 3. Aplicar Migrações do Banco de Dados

Execute o seguinte comando para criar as tabelas no banco de dados:

```bash
python3 manage.py migrate
```

### 4. Criar um Superusuário

Para acessar a área administrativa do Django, crie um superusuário:

```bash
python3 manage.py createsuperuser
```

Siga as instruções para definir um nome de usuário, email e senha.

### 5. Iniciar o Servidor de Desenvolvimento

Agora você pode iniciar o servidor:

```bash
python3 manage.py runserver
```

O backend estará rodando em `http://127.0.0.1:8000/`.

## Acessando o Site

- **Página Inicial:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Página de Login:** [http://127.0.0.1:8000/login/](http://127.0.0.1:8000/login/)
- **Página de Cadastro:** [http://127.0.0.1:8000/cadastro/](http://127.0.0.1:8000/cadastro/)
- **Admin Django:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

## Endpoints da API

A base da API é `http://127.0.0.1:8000/api/`.

### Autenticação

- `POST /api/auth/register/`: Cadastro de novo usuário.
- `POST /api/auth/login/`: Login e obtenção de tokens JWT.
- `POST /api/auth/token/refresh/`: Renovar token de acesso.
- `GET /api/auth/user/`: Obter dados do usuário autenticado (requer token).

### Planos

- `GET /api/planos/`: Listar todos os planos ativos.

> **Nota:** A estrutura está pronta para ser expandida com mais endpoints para matrículas, treinos, avaliações, etc.

## Conexão com o Frontend

O frontend (arquivos em `static/`) já está configurado para se comunicar com a API rodando localmente. Os arquivos JavaScript (`auth.js`, `login.js`, `cadastro.js`) fazem as chamadas para os endpoints de autenticação.

Para conectar seu frontend existente, basta apontar as requisições (usando `fetch` ou `axios`) para os endpoints da API listados acima.

Lembre-se de configurar o CORS no arquivo `academia_project/settings.py` para permitir requisições do domínio onde seu frontend está hospedado:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Exemplo para React em desenvolvimento
    "http://127.0.0.1:3000",
    "https://seu-dominio-frontend.com",
]
```
'''
