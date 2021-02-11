import axios from "axios"
import Qs from "qs"
import Cookies from "js-cookie"
import {createApp} from 'vue'

const SpaApp = {
    data() {
        return {
            displayMessage: 'Loading...',
            error: null,
            tokens: null,
            loading: true,
            isSignedInLinkDisplay: true,
            authorizationUrl: '#',
            signOutUrl: '#',
            redirectUri: 'http://localhost:8080',
            clientId: 'd8ef2211-a63b-4a4c-b3e5-4c9cf7ea8256',
            scope: 'api://d665ee86-da44-4d36-8d30-0ad2b5e16bde/access_as_user',
            hasTokens: this.tokens !== undefined,
            tokensRequestUrl: 'https://login.microsoftonline.com/ee64f829-1cc2-4fb2-996e-2e0fb78f5f29/oauth2/v2.0/token',
            webServiceResponseData: null,
        }
    },
    methods: {
        _clear_error() {
            this.loading = true
            this.error = null
        },
        _set_error(error) {
            if (error.response !== undefined) {
                this.error = error.response.data
            }
        },
        _refresh_token() {
            this.displayMessage = "Refreshing tokens..."
            this._clear_error()

            let formData = new FormData()
            formData.append('grant_type', 'refresh_token')
            formData.append('client_id', this.clientId)
            formData.append('scope', this.scope)
            formData.append('refresh_token', this.tokens.refresh_token)

            axios
                .post(this.tokensRequestUrl, formData)
                .then(response => {
                    this.tokens = response.data
                })
                .catch(error => {
                    this._set_error(error)
                })
                .finally(() => {
                    this.loading = false
                    this.displayMessage = "Loading..."
                })
        },
        getSignedInUserProfile() {
            this._clear_error()

            axios
                .get('https://web-services.dtgo.com/api/v1/users/me', {
                    headers: {
                        Authorization: this.tokens.token_type + " " + this.tokens.access_token
                    }
                })
                .then(response => {
                    this.webServiceResponseData = response.data
                    this.loading = false
                })
                .catch(error => {
                    if (error.response.data.detail.error_code === 'expired_token') {
                        this._refresh_token()
                        this.getSignedInUserProfile()
                    } else {
                        this._set_error(error)
                    }
                })
        },
        getTokens() {
            this._clear_error()

            if (window.location.search !== "") {
                let searchParams = new URLSearchParams(window.location.search)
                let code = searchParams.get('code')
                let responseState = searchParams.get('state')
                let errorCode = searchParams.get('error')
                let errorDescription = searchParams.get('error_description')

                if (errorCode === null) {
                    if (Cookies.get('state') === responseState) {
                        let formData = new FormData()
                        formData.append('grant_type', 'authorization_code')
                        formData.append('client_id', this.clientId)
                        formData.append('redirect_uri', this.redirectUri)
                        formData.append('scope', this.scope)
                        formData.append('code', code)
                        formData.append('code_verifier', Cookies.get('codeVerifier'))

                        axios
                            .post(this.tokensRequestUrl, formData)
                            .then(response => {
                                this.tokens = response.data
                                this.hasTokens = true
                                this.isSignedInLinkDisplay = false
                            })
                            .catch(error => {
                                this._set_error(error)
                            })
                            .finally(() => {
                                this.loading = false
                            })
                    } else {
                        this.error = "The state value in the request and response are not identical."
                        this.loading = false
                    }
                } else {
                    this.error = {errorCode: errorCode, errorDescription: errorDescription}
                }
            }
        },
        setSignedInUrl() {
            this._clear_error()

            axios
                .get('https://web-services.dtgo.com/api/v1/oauth2/authorization-url', {
                    params: {
                        client_id: this.clientId,
                        redirect_uri: this.redirectUri,
                    },
                    paramsSerializer: params => {
                        return Qs.stringify(params, {arrayFormat: "repeat"})
                    }
                })
                .then(response => {
                    let data = response.data.data
                    this.authorizationUrl = data.authorization_url
                    Cookies.set('codeVerifier', data.code_verifier)
                    Cookies.set('state', data.state)
                })
                .catch(error => {
                    this._set_error(error)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        setSignOutUrl() {
            this._clear_error()

            axios
                .get('https://web-services.dtgo.com/api/v1/oauth2/sign-out-url', {
                    params: {
                        redirect_uri: this.redirectUri,
                    },
                })
                .then(response => {
                    this.signOutUrl = response.data.data.sign_out_url
                })
                .catch(error => {
                    this._set_error(error)
                })
                .finally(() => {
                    this.loading = false
                })
        }
    },
    mounted() {
        this.setSignedInUrl()
        this.setSignOutUrl()
        this.getTokens()
    }
}

createApp(SpaApp).mount('#app')
