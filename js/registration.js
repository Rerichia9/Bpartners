function post(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    }).then(response => {
        return response.text()
    })
    .then((data) => {
      return data ? JSON.parse(data) : {}
    });
}

function sendRegistrationRequest(data) {
    return post('https://dashboard.bpartners.io/api/client/partner', data);
}

function sendLoginRequest(data) {
    return post('https://dashboard.bpartners.io/api/client/partner/sign_in', data);
}

function sendResetPasswordRequest(data) {
    return post('https://dashboard.bpartners.io/api/client/partner/password', data);
}

function sendSetStagRequest(data) {
    return post('https://dashboard.bpartners.io/api/client/partner/track_stag', data);
}

function sendQuestionForm(data) {
    return fetch('/question.php', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        credentials: 'include',
        body: data
    }).then(response => {
        return response.text()
    })
    .then((data) => {
      return data ? JSON.parse(data) : {}
    });
}

window.addEventListener("DOMContentLoaded", function() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (params.stag) {
        sendSetStagRequest({
            stag: params.stag
        });
    }

    Vue.use(VeeValidate);

    var app = new Vue({
        el: '#app',
        data: {
            firstForm: {
                contactField: '',
                selectedContact: '',
                promotion: '',
                agreeReceiveNews: true,
            },
            isOpened: false,
            secondForm: {
                email: '',
                password: '',
                password_confirmation: '',
            },
            loginForm: {
                email: '',
                password: '',
            },
            resetPassworForm: {
                email: '',
            }
        },
        methods: {
            toggle: function() {
                this.isOpened = !this.isOpened;
            },
            selectMethod: function(v) {
                this.isOpened = false;
                this.firstForm.selectedContact = v;
            },
            open: function() {
                this.isOpened = true;
            },
            onSubmitFirst: function() {
                this.$validator.validateAll('firstForm').then(valid => {
                    if (!valid) {
                      // do stuff if not valid.
                      return;
                    }
                    UIkit.modal('#modal-register').hide();
                    UIkit.modal('#modal-login-info').show();
                  });
            },
            onSubmitSecond: function() {
                console.log('prevalidate')
                this.$validator.validateAll('secondForm').then(valid => {
                    if (!valid) {
                      return;
                    }

                    const contact = this.firstForm.selectedContact === 'Skype'
                        ? {skype: this.firstForm.contactField}
                        : {telegram: this.firstForm.contactField};

                    sendRegistrationRequest({
                        partner_user: {
                            company_name: '-',
                            email: this.secondForm.email,
                            password: this.secondForm.password,
                            password_confirmation: this.secondForm.password_confirmation,
                            terms_accepted: true,
                            traffic_sources: this.firstForm.promotion,
                            ...contact,
                        }
                    }).then((data) => {
                        if (data.errors && data.errors.email[0].includes('уже используется')) {
                            this.$validator.errors.add({
                                field: 'email',
                                msg: 'Email is already in use',
                                scope: 'secondForm'
                            })
                            this.$validator.errors.first('email');
                            return;
                        }
                        UIkit.modal('#modal-login-info').hide();
                        sendLoginRequest({
                            partner_user:{
                                email: this.secondForm.email,
                                password: this.secondForm.password,
                            }
                        }).then((data) => {
                            if (data.email) {
                                window.location = 'https://dashboard.bpartners.io/partner'
                            }
                        });
                    })
                  });
            },
            onSubmitLoginForm: function() {
                this.$validator.validateAll('loginForm').then(valid => {
                    sendLoginRequest({
                        partner_user:{
                            email: this.loginForm.email,
                            password: this.loginForm.password,
                        }
                    }).then((data) => {
                        console.log(data);
                        if (data.email) {
                            window.location = 'https://dashboard.bpartners.io/partner'
                        }
                        if (data.error && data.error.includes('Необходимо войти в аккаунт')) {
                            this.$validator.errors.add({
                                field: 'email',
                                msg: 'Wrong login or password',
                                scope: 'loginForm'
                            })
                            this.$validator.errors.first('email');
                            return;
                        }
                        if (data.error) {
                            alert(data.error)
                        }
                    });
                })
            },
            onSubmitResetPasswordForm: function() {
                this.$validator.validateAll('resetPassworForm').then(valid => {
                    sendResetPasswordRequest({
                        partner_user:{
                            email: this.resetPassworForm.email,
                        }
                    }).then((data) => {
                        if (data.errors && data.errors.email) {
                            this.$validator.errors.add({
                                field: 'email',
                                msg: 'User not found',
                                scope: 'resetPassworForm'
                            })
                            this.$validator.errors.first('email');
                            return;
                        }

                        UIkit.modal('#modal-forgot-password').hide();
                        UIkit.modal('#check-mail').show();

                    });
                })
            },
        }
    })

    var questionApp= new Vue({
        el: '#questionApp',
        data: {
            questionForm: {
                email: '',
                name: '',
                message: '',
            }
        },
        methods: {
            onSubmitQuestionForm: function() {
                this.$validator.validateAll('questionForm').then(() => {
                    const data = new FormData();
                    data.append('email', this.questionForm.email)
                    data.append('message', this.questionForm.message)
                    data.append('name', this.questionForm.name)
                    sendQuestionForm(data);
                    UIkit.modal('#sent').show();
                })
            }
        }
    })
});
