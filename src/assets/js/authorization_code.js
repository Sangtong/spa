import {createApp} from 'vue'

const AuthorizationCodeApp = {
    data() {
        return {
            loading: true,
            response: {},
        }
    },
    mounted() {
        let searchParams = new URLSearchParams(window.location.search)

        for (let key of searchParams.keys()) {
            this.response[key] = searchParams.get(key)
        }

        this.loading = false
    }
}

createApp(AuthorizationCodeApp).mount('#app')
