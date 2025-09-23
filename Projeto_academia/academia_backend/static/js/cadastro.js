document.addEventListener('DOMContentLoaded', function() {
    const cadastroForm = document.getElementById('cadastroForm');
    const submitButton = cadastroForm.querySelector('button[type="submit"]');
    
    // Campos do formulário
    const fields = {
        firstName: document.getElementById('first_name'),
        lastName: document.getElementById('last_name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        birthDate: document.getElementById('birth_date'),
        gender: document.getElementById('gender'),
        password: document.getElementById('password'),
        passwordConfirm: document.getElementById('password_confirm'),
        terms: document.getElementById('terms')
    };
    
    // Adicionar validações aos campos
    AuthUtils.addFieldValidation(
        fields.firstName,
        (value) => value.trim().length >= 2,
        'O nome deve ter pelo menos 2 caracteres'
    );
    
    AuthUtils.addFieldValidation(
        fields.lastName,
        (value) => value.trim().length >= 2,
        'O sobrenome deve ter pelo menos 2 caracteres'
    );
    
    AuthUtils.addFieldValidation(
        fields.email,
        AuthUtils.validateEmail,
        'Por favor, insira um email válido'
    );
    
    AuthUtils.addFieldValidation(
        fields.phone,
        (value) => !value || AuthUtils.validatePhone(value),
        'Formato: (11) 99999-9999'
    );
    
    AuthUtils.addFieldValidation(
        fields.password,
        AuthUtils.validatePassword,
        'Mínimo 8 caracteres, pelo menos uma letra e um número'
    );
    
    // Validação de confirmação de senha
    AuthUtils.addFieldValidation(
        fields.passwordConfirm,
        (value) => value === fields.password.value,
        'As senhas não coincidem'
    );
    
    // Revalidar confirmação quando a senha principal mudar
    fields.password.addEventListener('input', function() {
        if (fields.passwordConfirm.value) {
            const isValid = fields.passwordConfirm.value === this.value;
            const formGroup = fields.passwordConfirm.closest('.form-group');
            
            if (isValid) {
                fields.passwordConfirm.classList.remove('invalid');
                fields.passwordConfirm.classList.add('valid');
                formGroup.classList.remove('has-error');
            } else {
                fields.passwordConfirm.classList.remove('valid');
                fields.passwordConfirm.classList.add('invalid');
                formGroup.classList.add('has-error');
            }
        }
    });
    
    // Validação de idade mínima (16 anos)
    AuthUtils.addFieldValidation(
        fields.birthDate,
        (value) => {
            if (!value) return true; // Campo opcional
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age >= 16;
        },
        'Você deve ter pelo menos 16 anos'
    );
    
    // Manipular envio do formulário
    cadastroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar todos os campos
        if (!validarFormulario()) {
            return;
        }
        
        const formData = new FormData(cadastroForm);
        const userData = {
            username: formData.get('email').trim(), // Usar email como username
            first_name: formData.get('first_name').trim(),
            last_name: formData.get('last_name').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone') || null,
            birth_date: formData.get('birth_date') || null,
            gender: formData.get('gender') || null,
            password: formData.get('password'),
            password_confirm: formData.get('password_confirm')
        };
        const planoId = document.getElementById('plano')?.value;
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value;
        
        // Mostrar loading
        AuthUtils.setLoading(submitButton, true);
        AuthUtils.showMessage('Criando sua conta...', 'info');
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Cadastro bem-sucedido
                AuthUtils.showMessage(
                    'Conta criada com sucesso! Fazendo login automaticamente...',
                    'success'
                );
                
                // Se retornou tokens, salvar e criar matrícula + redirecionar
                if (data.access && data.refresh) {
                    AuthUtils.saveTokens(data.access, data.refresh);
                    
                    if (data.user) {
                        localStorage.setItem('user_data', JSON.stringify(data.user));
                    }
                    // Criar matrícula se escolheu plano
                    if (planoId) {
                        try {
                            const respMat = await fetch(`${API_BASE_URL}/planos/escolher/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                                },
                                body: JSON.stringify({ plano_id: parseInt(planoId) })
                            });
                            const matData = await respMat.json();
                            if (!respMat.ok) {
                                console.warn('Falha ao criar matrícula:', matData);
                            } else {
                                localStorage.setItem('last_matricula', JSON.stringify(matData.matricula || {}));
                            }
                        } catch (e) { console.error(e); }
                    }

                    // Decidir rota de checkout conforme método
                    if (paymentMethod && planoId) {
                        const sel = document.getElementById('plano');
                        const opt = sel.options[sel.selectedIndex];
                        const preco = opt?.dataset?.preco || '0';
                        const dias = opt?.dataset?.duracao || '30';
                        const tier = window.getPlanTier(parseInt(dias));
                        const qs = new URLSearchParams({ plano_id: String(planoId), method: paymentMethod, preco: String(preco), tier });
                        setTimeout(() => { window.location.href = `/static/html/checkout_frontend.html?${qs.toString()}`; }, 800);
                        return;
                    }

                    setTimeout(() => { window.location.href = '/portal/'; }, 800);
                } else {
                    // Se não retornou tokens, redirecionar para login
                    setTimeout(() => {
                        window.location.href = '/login/?message=account_created&redirect=/portal/';
                    }, 1500);
                }
                
            } else {
                // Erro no cadastro
                let errorMessage = 'Erro ao criar conta';
                
                if (data.email && data.email[0]) {
                    errorMessage = 'Email: ' + data.email[0];
                } else if (data.password && data.password[0]) {
                    errorMessage = 'Senha: ' + data.password[0];
                } else if (data.non_field_errors && data.non_field_errors[0]) {
                    errorMessage = data.non_field_errors[0];
                } else if (data.detail) {
                    errorMessage = data.detail;
                }
                
                AuthUtils.showMessage(errorMessage, 'error');
                
                // Destacar campos com erro
                if (data.email) {
                    fields.email.classList.add('invalid');
                }
                if (data.password) {
                    fields.password.classList.add('invalid');
                }
            }
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            AuthUtils.showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            AuthUtils.setLoading(submitButton, false);
        }
    });
    
    // Auto-focus no primeiro campo
    fields.firstName.focus();
});

// Função para validar todo o formulário
function validarFormulario() {
    const fields = {
        firstName: document.getElementById('first_name'),
        lastName: document.getElementById('last_name'),
        email: document.getElementById('email'),
        birthDate: document.getElementById('birth_date'),
        password: document.getElementById('password'),
        passwordConfirm: document.getElementById('password_confirm'),
        terms: document.getElementById('terms')
    };
    
    let isValid = true;
    let firstErrorField = null;
    
    // Validar nome
    if (fields.firstName.value.trim().length < 2) {
        fields.firstName.classList.add('invalid');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.firstName;
    }
    
    // Validar sobrenome
    if (fields.lastName.value.trim().length < 2) {
        fields.lastName.classList.add('invalid');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.lastName;
    }
    
    // Validar email
    if (!AuthUtils.validateEmail(fields.email.value)) {
        fields.email.classList.add('invalid');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.email;
    }
    
    // Validar telefone (se preenchido)
    if (fields.phone.value && !AuthUtils.validatePhone(fields.phone.value)) {
        fields.phone.classList.add('invalid');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.phone;
    }
    
    // Validar data de nascimento (se preenchida)
    if (fields.birthDate.value) {
        const birthDate = new Date(fields.birthDate.value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 16) {
            fields.birthDate.classList.add('invalid');
            isValid = false;
            if (!firstErrorField) firstErrorField = fields.birthDate;
        }
    }
    
    // Validar senha
    if (!AuthUtils.validatePassword(fields.password.value)) {
        fields.password.classList.add('invalid');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.password;
    }
    
    // Validar confirmação de senha
    if (fields.password.value !== fields.passwordConfirm.value) {
        fields.passwordConfirm.classList.add('invalid');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.passwordConfirm;
    }
    
    // Validar termos
    if (!fields.terms.checked) {
        AuthUtils.showMessage('Você deve aceitar os termos de uso', 'error');
        isValid = false;
        if (!firstErrorField) firstErrorField = fields.terms;
    }
    
    // Focar no primeiro campo com erro
    if (!isValid && firstErrorField) {
        firstErrorField.focus();
        AuthUtils.showMessage('Por favor, corrija os campos destacados', 'error');
    }
    
    return isValid;
}

// Verificar disponibilidade do email em tempo real
let emailCheckTimeout;
document.getElementById('email').addEventListener('input', function() {
    const email = this.value.trim();
    
    if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
    }
    
    if (email && AuthUtils.validateEmail(email)) {
        emailCheckTimeout = setTimeout(() => {
            verificarEmailDisponivel(email);
        }, 1000);
    }
});

// Função para verificar se o email já está em uso
async function verificarEmailDisponivel(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/check-email/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        const emailField = document.getElementById('email');
        const formGroup = emailField.closest('.form-group');
        
        if (data.available === false) {
            emailField.classList.add('invalid');
            formGroup.classList.add('has-error');
            
            let errorDiv = formGroup.querySelector('.error-message');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                formGroup.appendChild(errorDiv);
            }
            errorDiv.textContent = 'Este email já está em uso';
        } else if (data.available === true) {
            emailField.classList.remove('invalid');
            emailField.classList.add('valid');
            formGroup.classList.remove('has-error');
        }
        
    } catch (error) {
        console.error('Erro ao verificar email:', error);
    }
}
