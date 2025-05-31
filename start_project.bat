    @echo off
    setlocal

    :: Define o diretório raiz do projeto (onde este .bat está)
    set "PROJECT_ROOT=%~dp0"

    :: Caminho para o script de ativação do ambiente virtual (activate.bat)
    set "VENV_ACTIVATE=%PROJECT_ROOT%venv\Scripts\activate.bat"

    echo --- Preparando Ambiente ---
    echo Verificando/Instalando 'python-dotenv' no ambiente virtual...
    call "%VENV_ACTIVATE%"
    python -c "import dotenv" >nul 2>&1
    if %errorlevel% neq 0 (
        echo 'python-dotenv' não encontrado. Instalando...
        pip install python-dotenv
        echo 'python-dotenv' instalado.
    ) else (
        echo 'python-dotenv' já está instalado.
    )
    deactivate >nul 2>&1
    echo.

    echo --- Iniciando Backend (Flask App) ---
    :: Inicia o backend em uma nova janela do CMD
    :: O api/index.py irá carregar a GEMINI_API_KEY do .env automaticamente
    start "Backend Server" cmd /k "call "%VENV_ACTIVATE%" && python "%PROJECT_ROOT%api\index.py""

    echo.
    echo --- Iniciando Frontend (HTTP Server) ---
    :: Inicia o frontend em outra nova janela do CMD
    :: Navega para a pasta public antes de iniciar o servidor HTTP
    start "Frontend Server" cmd /k "call "%VENV_ACTIVATE%" && cd "%PROJECT_ROOT%public" && python -m http.server 8000"

    echo.
    echo --- Servidores Iniciados ---
    echo Verifique as duas novas janelas de comando para os logs dos servidores.
    echo Acesse seu frontend em: http://127.0.0.1:8000/
    echo.
    echo Pressione qualquer tecla para fechar esta janela principal.
    pause >nul

    endlocal
    